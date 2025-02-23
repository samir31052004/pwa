<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center">
          <button @click="router.back()" class="mr-4 text-gray-600 hover:text-gray-800">
            <span class="sr-only">Back</span>
            ← Back
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Prayer Times & Breaks</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Prayer Times Section -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Today's Prayer Times</h2>
            <div class="space-y-4">
              <div v-for="prayer in prayerTimes" :key="prayer.name" class="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900">{{ prayer.name }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500">{{ prayer.time }}</span>
                  <button 
                    v-if="isWithinBreakWindow(prayer.time)"
                    @click="scheduleBreak(prayer)"
                    class="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Schedule Break
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Nearby Mosques Section -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Nearby Prayer Locations</h2>
            <div class="space-y-4">
              <div v-for="mosque in nearbyMosques" :key="mosque.id" class="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">{{ mosque.name }}</h3>
                    <p class="text-sm text-gray-500">{{ mosque.distance }} km away</p>
                    <p class="text-sm text-gray-500">{{ mosque.address }}</p>
                  </div>
                  <button
                    @click="getDirections(mosque)"
                    class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Scheduled Breaks -->
          <div class="bg-white shadow rounded-lg p-6 lg:col-span-2">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Scheduled Breaks</h2>
            <div class="overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prayer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="prayerBreak in scheduledBreaks" :key="prayerBreak.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ prayerBreak.prayer }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ prayerBreak.time }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ prayerBreak.location }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="[prayerBreak.status === 'Scheduled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium']">
                        {{ prayerBreak.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock data for prayer times
const prayerTimes = ref([
  { name: 'Fajr', time: '05:30' },
  { name: 'Dhuhr', time: '12:30' },
  { name: 'Asr', time: '15:45' },
  { name: 'Maghrib', time: '18:15' },
  { name: 'Isha', time: '19:45' }
])

// Mock data for nearby mosques
const nearbyMosques = ref([
  { 
    id: 1, 
    name: 'Zitouna Mosque', 
    distance: 0.5,
    address: 'Rue Jamaa Ezzitouna, Tunis'
  },
  { 
    id: 2, 
    name: 'Al-Fateh Mosque', 
    distance: 1.2,
    address: 'Avenue Habib Bourguiba, Tunis'
  },
  { 
    id: 3, 
    name: 'Sidi Mehrez Mosque', 
    distance: 1.8,
    address: 'Rue Sidi Mehrez, Tunis'
  }
])

// Mock data for scheduled breaks
const scheduledBreaks = ref([
  { 
    id: 1, 
    prayer: 'Dhuhr',
    time: '12:30',
    location: 'Zitouna Mosque',
    status: 'Scheduled'
  },
  { 
    id: 2, 
    prayer: 'Asr',
    time: '15:45',
    location: 'Al-Fateh Mosque',
    status: 'Pending'
  }
])

// Check if current time is within break window
const isWithinBreakWindow = (prayerTime) => {
  // Implementation to check if current time is within acceptable break window
  return true
}

// Schedule a break for prayer
const scheduleBreak = (prayer) => {
  // Implementation to schedule a break
  console.log('Scheduling break for:', prayer.name)
}

// Get directions to mosque
const getDirections = (mosque) => {
  // Implementation to show directions
  console.log('Getting directions to:', mosque.name)
}

onMounted(() => {
  // Fetch actual prayer times and nearby mosques based on current location
})
</script>