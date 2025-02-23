import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication functions
export const registerDriver = async ({ name, email, licenseNumber, password }) => {
  try {
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check if driver already exists
    const { data: existingDriver, error: existingDriverError } = await supabase
      .from('drivers')
      .select('id, email, license_number')
      .or('email.eq.' + email + ',license_number.eq.' + licenseNumber)
      .maybeSingle()

    if (existingDriverError) {
      console.error('Error checking existing driver:', existingDriverError)
      throw existingDriverError
    }

    if (existingDriver) {
      const errorMessage = existingDriver.email === email
        ? 'A driver with this email already exists'
        : 'A driver with this license number already exists'
      const error = new Error(errorMessage)
      error.code = 'DRIVER_EXISTS'
      throw error
    }

    // Create auth user
    const { data: auth, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`
      }
    })

    if (authError) {
      if (authError.message.includes('User already registered')) {
        const error = new Error('An account with this email already exists')
        error.code = 'AUTH_USER_EXISTS'
        throw error
      }
      throw authError
    }

    // Create driver record with auth_id
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .insert([
        {
          name,
          email,
          license_number: licenseNumber,
          auth_id: auth.user.id
        }
      ])
      .select('*')
      .single()

    if (driverError) throw driverError

    return { session: auth.session, driver }
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

// Location tracking functions
export const startLocationTracking = async (tripId, driverId) => {
  const updateLocation = async (position) => {
    const { latitude, longitude } = position.coords
    const timestamp = new Date().toISOString()

    try {
      const { error } = await supabase
        .from('location_history')
        .insert([
          {
            trip_id: tripId,
            driver_id: driverId,
            latitude,
            longitude,
            timestamp
          }
        ])

      if (error) throw error

      // Update the current trip's location
      await supabase
        .from('trips')
        .update({
          current_latitude: latitude,
          current_longitude: longitude,
          last_update: timestamp
        })
        .eq('id', tripId)

    } catch (error) {
      console.error('Error updating location:', error)
      // Store failed updates for later sync
      storeOfflineLocation({
        trip_id: tripId,
        driver_id: driverId,
        latitude,
        longitude,
        timestamp
      })
    }
  }

  // Update location every 3 minutes
  return navigator.geolocation.watchPosition(
    updateLocation,
    (error) => console.error('Error getting location:', error),
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 180000 // 3 minutes
    }
  )
}

// Offline support
const storeOfflineLocation = async (locationData) => {
  try {
    const offlineLocations = JSON.parse(localStorage.getItem('offlineLocations') || '[]')
    offlineLocations.push(locationData)
    localStorage.setItem('offlineLocations', JSON.stringify(offlineLocations))
  } catch (error) {
    console.error('Error storing offline location:', error)
  }
}

export const syncOfflineLocations = async () => {
  try {
    const offlineLocations = JSON.parse(localStorage.getItem('offlineLocations') || '[]')
    if (offlineLocations.length === 0) return

    const { error } = await supabase
      .from('location_history')
      .insert(offlineLocations)

    if (error) throw error

    // Clear synced locations
    localStorage.setItem('offlineLocations', '[]')
  } catch (error) {
    console.error('Error syncing offline locations:', error)
  }
}

// Real-time subscriptions
export const subscribeToTripUpdates = (tripId, callback) => {
  return supabase
    .from(`trips:id=eq.${tripId}`)
    .on('UPDATE', callback)
    .subscribe()
}

// Trip management functions
export const createTrip = async (tripData) => {
  const { data, error } = await supabase
    .from('trips')
    .insert([tripData])
    .select()

  if (error) throw error
  return data[0]
}

export const updateTripStatus = async (tripId, status) => {
  const { error } = await supabase
    .from('trips')
    .update({ status })
    .eq('id', tripId)

  if (error) throw error
}

export const getTripHistory = async (driverId, filters = {}) => {
  let query = supabase
    .from('trips')
    .select('*')
    .eq('driver_id', driverId)

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// Authentication functions
export const signInDriver = async (email, password) => {
  try {
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Invalid email format');
      error.code = 'INVALID_EMAIL';
      throw error;
    }

    // Validate password
    if (!password || password.length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.code = 'INVALID_PASSWORD';
      throw error;
    }

    // Authenticate user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      if (error.message === 'Invalid login credentials') {
        const customError = new Error('Invalid email or password')
        customError.code = 'INVALID_CREDENTIALS'
        throw customError
      }
      throw error
    }

    // Get driver info
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', email)
      .single()

    if (driverError) {
      console.error('Driver lookup error:', driverError)
      throw driverError
    }

    return { session: data.session, driver }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export const signOutDriver = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentDriver = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!session) return null

  const { data: driver, error: driverError } = await supabase
    .from('drivers')
    .select('*')
    .eq('email', session.user.email)
    .single()

  if (driverError) throw driverError
  return driver
}