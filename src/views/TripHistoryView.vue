<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900" role="heading" aria-level="1">{{ t('common.tripHistory') }}</h1>
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              @click="exportData('pdf')"
              class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {{ t('common.exportPDF') }}
            </button>
            <button
              @click="exportData('csv')"
              class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              aria-label="Export data as CSV"
            >
              {{ t('common.exportCSV') }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <!-- Filters -->
      <div class="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label for="routeFilter" class="block text-sm font-medium text-gray-700">Route</label>
          <select
            id="routeFilter"
            v-model="filters.route"
            @change="applyFilters"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Routes</option>
            <option v-for="route in routes" :key="route.id" :value="route.route_number">
              {{ route.name }}
            </option>
          </select>
        </div>

        <div>
          <label for="dateFilter" class="block text-sm font-medium text-gray-700">Date Range</label>
          <select
            id="dateFilter"
            v-model="filters.dateRange"
            @change="applyFilters"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div>
          <label for="statusFilter" class="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="statusFilter"
            v-model="filters.status"
            @change="applyFilters"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Trip List -->
      <div v-if="!isLoading && !error" class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul v-if="filteredTrips.length > 0" role="list" class="divide-y divide-gray-200">
          <li v-for="trip in filteredTrips" :key="trip.id">
            <div class="p-4 sm:px-6 hover:bg-gray-50 cursor-pointer" @click="viewTripDetails(trip.id)">
              <div class="flex flex-col space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-indigo-600 truncate">{{ trip.route }} - {{ trip.driverName }}</p>
                    <p class="mt-1 flex flex-wrap items-center text-sm text-gray-500 space-x-2">
                      <span>{{ formatDate(trip.date) }}</span>
                      <span class="hidden sm:inline">•</span>
                      <span>Duration: {{ formatDuration(trip.duration) }}</span>
                    </p>
                  </div>
                  <div class="mt-2 sm:mt-0">
                    <span
                      :class="[getStatusClass(trip.status)]"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ trip.status }}
                    </span>
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                  <p>Fuel Efficiency: {{ trip.fuelEfficiency }} L/100km</p>
                  <p>Passenger Load: {{ trip.passengerLoad }}%</p>
                  <p>Delay Rate: {{ formatDelayRate(trip.delayRate) }}</p>
                  <p v-if="trip.incidentZones.length > 0">Incident Zones: {{ trip.incidentZones.join(', ') }}</p>
                </div>
                <p class="text-xs text-gray-400">
                  Validated by: {{ trip.validatedBy }} at {{ formatDate(trip.validationTimestamp) }}
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

// Mock data for routes
const routes = ref([
  { id: 1, name: 'Downtown Express' },
  { id: 2, name: 'Airport Shuttle' },
  { id: 3, name: 'Campus Loop' }
])

// State management
const isLoading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)

// Mock data for trips with enhanced metrics
const trips = ref([
  {
    id: 1,
    route: 'Downtown Express',
    date: '2024-02-20T08:00:00',
    duration: 3600,
    status: 'on-time',
    fuelEfficiency: 8.5, // liters/100km
    passengerLoad: 85, // percentage
    driverId: 'D001',
    driverName: 'Ahmed Ben Ali',
    incidentZones: ['Tunis Marine Station'],
    delayRate: 5, // percentage below fleet average
    validatedBy: 'Supervisor Name',
    validationTimestamp: '2024-02-20T16:00:00'
  },
  {
    id: 2,
    route: 'Airport Shuttle',
    date: '2024-02-20T10:30:00',
    duration: 4500,
    status: 'delayed',
    fuelEfficiency: 9.2,
    passengerLoad: 92,
    driverId: 'D002',
    driverName: 'Sami Trabelsi',
    incidentZones: ['Airport Terminal', 'Downtown Junction'],
    delayRate: 15, // percentage above fleet average
    validatedBy: 'Supervisor Name',
    validationTimestamp: '2024-02-20T17:30:00'
  },
  {
    id: 3,
    route: 'Campus Loop',
    date: '2024-02-20T13:15:00',
    duration: 2700,
    status: 'on-time',
    fuelEfficiency: 7.8,
    passengerLoad: 75,
    driverId: 'D003',
    driverName: 'Leila Gharbi',
    incidentZones: [],
    delayRate: -10, // percentage below fleet average
    validatedBy: 'Supervisor Name',
    validationTimestamp: '2024-02-20T19:15:00'
  }
])

// Filter state
const filters = ref({
  dateRange: 'today',
  route: 'all',
  delay: 'all'
})

// Computed filtered and paginated trips
const filteredTrips = computed(() => {
  const filtered = trips.value.filter(trip => {
    if (filters.value.route !== 'all' && trip.route !== filters.value.route) return false
    if (filters.value.delay !== 'all' && trip.status !== filters.value.delay) return false
    
    const tripDate = new Date(trip.date)
    const today = new Date()
    
    switch (filters.value.dateRange) {
      case 'today':
        return tripDate.toDateString() === today.toDateString()
      case 'week':
        const weekAgo = new Date(today.setDate(today.getDate() - 7))
        return tripDate >= weekAgo
      case 'month':
        const monthAgo = new Date(today.setMonth(today.getMonth() - 1))
        return tripDate >= monthAgo
      default:
        return true
    }
  })
  
  // Update total items for pagination
  totalItems.value = filtered.length
  
  // Apply pagination
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filtered.slice(start, end)
})

// Computed total pages
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

// Apply filters
const applyFilters = async () => {
  try {
    isLoading.value = true
    error.value = null
    currentPage.value = 1 // Reset to first page when applying new filters
    
    // In a real app, this would fetch filtered data from the server
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Applying filters:', filters.value)
  } catch (err) {
    error.value = 'Failed to fetch filtered trips'
    console.error('Error applying filters:', err)
  } finally {
    isLoading.value = false
  }
}

// Change page
const changePage = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Initialize data
const fetchInitialData = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 500))
    // In a real app, this would fetch initial data from the server
  } catch (err) {
    error.value = 'Failed to fetch trip history'
    console.error('Error fetching initial data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchInitialData()
})

// View trip details
const viewTripDetails = (tripId) => {
  router.push(`/trip/${tripId}`)
}

// Export data
const exportData = async (format) => {
  try {
    const response = await fetch(`/api/trips/export?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('user-token')}`
      }
    })

    if (!response.ok) throw new Error('Export failed')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trip-history.${format}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting data:', error)
    alert('Failed to export data. Please try again.')
  }
}

// Helper functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('fr-TN')
}

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

const formatDelayRate = (rate) => {
  if (rate === 0) return 'On Fleet Average'
  return rate > 0 ? 
    `${rate}% Above Fleet Average` : 
    `${Math.abs(rate)}% Below Fleet Average`
}

const getStatusClass = (status) => {
  switch (status) {
    case 'on-time':
      return 'bg-green-100 text-green-800'
    case 'delayed':
      return 'bg-yellow-100 text-yellow-800'
    case 'very-delayed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>