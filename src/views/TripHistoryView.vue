<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-gray-900" role="heading" aria-level="1">{{ t('common.tripHistory') }}</h1>
          <div class="flex space-x-4">
            <button
              @click="exportData('pdf')"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {{ t('common.exportPDF') }}
            </button>
            <button
              @click="exportData('csv')"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              aria-label="Export data as CSV"
            >
              {{ t('common.exportCSV') }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 sm:px-6 lg:px-8">
        <!-- Filters -->
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-4">
            <div>
              <label for="date-range" class="block text-sm font-medium text-gray-700">{{ t('trips.filters.dateRange') }}</label>
              <select
                id="date-range"
                v-model="filters.dateRange"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="today">{{ t('trips.filters.today') }}</option>
                <option value="week">{{ t('trips.filters.thisWeek') }}</option>
                <option value="month">{{ t('trips.filters.thisMonth') }}</option>
                <option value="custom">{{ t('trips.filters.customRange') }}</option>
              </select>
            </div>

            <div>
              <label for="route" class="block text-sm font-medium text-gray-700">{{ t('trips.filters.route') }}</label>
              <select
                id="route"
                v-model="filters.route"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">{{ t('trips.filters.allRoutes') }}</option>
                <option v-for="route in routes" :key="route.id" :value="route.id">
                  {{ route.name }}
                </option>
              </select>
            </div>

            <div>
              <label for="delay" class="block text-sm font-medium text-gray-700">{{ t('trips.filters.delayStatus') }}</label>
              <select
                id="delay"
                v-model="filters.delay"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">{{ t('trips.filters.all') }}</option>
                <option value="ontime">{{ t('trips.status.onTime') }}</option>
                <option value="delayed">{{ t('trips.status.delayed') }}</option>
                <option value="very-delayed">{{ t('trips.status.veryDelayed') }}</option>
              </select>
            </div>

            <div class="flex items-end">
              <button
                @click="applyFilters"
                class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Trip List -->
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-for="trip in filteredTrips" :key="trip.id">
              <div class="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" @click="viewTripDetails(trip.id)">
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-indigo-600 truncate">{{ trip.route }} - {{ trip.driverName }}</p>
                    <p class="mt-1 flex items-center text-sm text-gray-500">
                      <span>{{ formatDate(trip.date) }}</span>
                      <span class="mx-2">•</span>
                      <span>Duration: {{ formatDuration(trip.duration) }}</span>
                    </p>
                    <div class="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <p>Fuel Efficiency: {{ trip.fuelEfficiency }} L/100km</p>
                      <p>Passenger Load: {{ trip.passengerLoad }}%</p>
                      <p>Delay Rate: {{ formatDelayRate(trip.delayRate) }}</p>
                      <p v-if="trip.incidentZones.length > 0">Incident Zones: {{ trip.incidentZones.join(', ') }}</p>
                    </div>
                    <p class="mt-1 text-xs text-gray-400">
                      Validated by: {{ trip.validatedBy }} at {{ formatDate(trip.validationTimestamp) }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-4">
                    <span
                      :class="[getStatusClass(trip.status)]"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ trip.status }}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

// Computed filtered trips
const filteredTrips = computed(() => {
  return trips.value.filter(trip => {
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
})

// Apply filters
const applyFilters = () => {
  // In a real app, this would fetch filtered data from the server
  console.log('Applying filters:', filters.value)
}

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