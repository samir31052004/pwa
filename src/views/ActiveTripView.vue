<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <button @click="router.back()" class="mr-4 text-gray-600 hover:text-gray-800">
              <span class="sr-only">Back</span>
              ← Back
            </button>
            <h1 class="text-3xl font-bold text-gray-900">{{ tripDetails.route }}</h1>
          </div>
          <span :class="[tripDetails.status === 'On Time' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium']">
            {{ tripDetails.status }}
          </span>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Trip Information -->
          <div class="lg:col-span-1">
            <div class="bg-white shadow rounded-lg p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Trip Information</h2>
              <dl class="space-y-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Route Number</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ tripDetails.routeNumber }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Next Stop</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ tripDetails.nextStop }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Estimated Arrival</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ tripDetails.eta }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Current Speed</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ tripDetails.speed }} km/h</dd>
                </div>
              </dl>
              <div class="mt-6">
                <button
                  @click="toggleTracking"
                  :class="[isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700',
                    'w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500']"
                >
                  {{ isTracking ? 'Stop Tracking' : 'Start Tracking' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Map -->
          <div class="lg:col-span-2">
            <div class="bg-white shadow rounded-lg p-6">
              <div class="mb-4 flex justify-between items-center">
                <button
                  @click="toggleBreakMode"
                  :class="[tripDetails.isOnBreak ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700',
                    'inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500']"
                >
                  {{ tripDetails.isOnBreak ? 'End Break' : 'Start Break' }}
                </button>
                <div class="flex space-x-2">
                  <select
                    v-model="selectedTrafficCondition"
                    class="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Report Traffic</option>
                    <option value="ariana">Ariana Traffic Jam</option>
                    <option value="lac1">Lac 1 Accident</option>
                    <option value="sousse">H-Sousse Traffic Jam</option>
                  </select>
                  <button
                    @click="reportTrafficCondition"
                    class="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    :disabled="!selectedTrafficCondition"
                  >
                    Report
                  </button>
                </div>
              </div>
              <div ref="mapContainer" class="h-96 rounded-lg">
                <!-- Map will be mounted here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const route = useRoute()
const mapContainer = ref(null)
let map = null
let busMarker = null

const tripDetails = ref({
  id: route.params.id,
  route: 'Downtown Express',
  routeNumber: 'Route 101',
  nextStop: 'Central Station',
  eta: '5 minutes',
  speed: 0,
  status: 'On Time',
  position: { lat: 36.8065, lng: 10.1815 }, // Default to Tunis coordinates
  scheduledPath: [], // Will store the scheduled route coordinates
  isOnBreak: false, // Track break mode status
  trafficConditions: [], // Store local traffic conditions
  alternativeRoutes: [] // Store STS-approved detour routes
})

// Geolocation tracking
const watchId = ref(null)
const isTracking = ref(false)

// Toggle GPS tracking
const toggleTracking = () => {
  if (isTracking.value) {
    stopTracking()
  } else {
    startTracking()
  }
}

// Toggle break mode
const toggleBreakMode = () => {
  tripDetails.value.isOnBreak = !tripDetails.value.isOnBreak
  if (tripDetails.value.isOnBreak) {
    // Pause location updates but keep trip active
    if (watchId.value) {
      navigator.geolocation.clearWatch(watchId.value)
      watchId.value = null
    }
  } else {
    // Resume tracking if it was active before break
    if (isTracking.value) {
      startTracking()
    }
  }
}

// Selected traffic condition
const selectedTrafficCondition = ref('')

// Report traffic condition
const reportTrafficCondition = async () => {
  if (!selectedTrafficCondition.value) return

  const condition = {
    type: selectedTrafficCondition.value,
    location: tripDetails.value.position,
    timestamp: new Date().toISOString()
  }

  tripDetails.value.trafficConditions.push(condition)
  
  try {
    // Send traffic report to backend
    await fetch('/api/traffic-conditions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(condition),
    })
    
    // Reset selection
    selectedTrafficCondition.value = ''
    
    // Update trip status
    tripDetails.value.status = 'Delayed'
    // Request alternative routes
    fetchAlternativeRoutes()
  } catch (error) {
    console.error('Error reporting traffic condition:', error)
  }
}

// Fetch alternative routes
const fetchAlternativeRoutes = async () => {
  try {
    const response = await fetch(`/api/alternative-routes?lat=${tripDetails.value.position.lat}&lng=${tripDetails.value.position.lng}`)
    const routes = await response.json()
    tripDetails.value.alternativeRoutes = routes
  } catch (error) {
    console.error('Error fetching alternative routes:', error)
  }
}

// Start GPS tracking
const startTracking = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser')
    return
  }

  watchId.value = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, speed } = position.coords
      tripDetails.value.position = { lat: latitude, lng: longitude }
      tripDetails.value.speed = speed ? Math.round(speed * 3.6) : 0 // Convert m/s to km/h
      
      // Update bus marker position
      if (busMarker && map) {
        busMarker.setLatLng([latitude, longitude])
        map.setView([latitude, longitude], 15)
        
        // Check for delays
        checkForDelays()
      }
    },
    (error) => {
      console.error('Error getting location:', error)
      alert('Unable to get your location')
      stopTracking()
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  )
  
  isTracking.value = true
}

// Stop GPS tracking
const stopTracking = () => {
  if (watchId.value) {
    navigator.geolocation.clearWatch(watchId.value)
    watchId.value = null
    isTracking.value = false
  }
}

// Check for delays by comparing current position with scheduled path
const checkForDelays = () => {
  // TODO: Implement actual delay checking logic
  // This would compare current time and position against scheduled times
  const simulatedDelay = Math.random() > 0.7
  if (simulatedDelay) {
    tripDetails.value.status = 'Delayed'
    // Send notification to backend
    sendDelayNotification()
  }
}

// Send delay notification to backend
const sendDelayNotification = async () => {
  try {
    await fetch('/api/delay-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tripId: tripDetails.value.id,
        position: tripDetails.value.position,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Error sending delay notification:', error)
  }
}

// Initialize map
onMounted(() => {
  // Create map instance
  map = L.map(mapContainer.value).setView([tripDetails.value.position.lat, tripDetails.value.position.lng], 13)

  // Add OpenStreetMap tiles with Tunisia-specific GIS data
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors | Tunisia GIS Data'
  }).addTo(map)

  // Add STS route overlay
  const stsRoutes = L.layerGroup().addTo(map)
  // TODO: Add actual STS route data
  // Example: L.polyline([[36.8065, 10.1815], [36.8167, 10.1667]], {color: 'blue'}).addTo(stsRoutes)

  // Add STS bus stops
  const stsStops = L.layerGroup().addTo(map)
  // TODO: Add actual STS bus stop data
  // Example: L.marker([36.8065, 10.1815], {icon: busStopIcon}).addTo(stsStops)

  // Create custom bus icon
  const busIcon = L.icon({
    iconUrl: '/src/assets/bus-icon.png', // You'll need to add this icon
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  })

  // Add bus marker
  busMarker = L.marker([tripDetails.value.position.lat, tripDetails.value.position.lng], {
    icon: busIcon
  }).addTo(map)

  // Start tracking if permission is granted
  if (navigator.permissions) {
    navigator.permissions.query({ name: 'geolocation' })
      .then(permission => {
        if (permission.state === 'granted') {
          startTracking()
        }
      })
  }
})

// Cleanup
onUnmounted(() => {
  stopTracking()
  if (map) {
    map.remove()
  }
})
</script>