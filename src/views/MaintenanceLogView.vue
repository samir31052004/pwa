<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center">
          <button @click="router.back()" class="mr-4 text-gray-600 hover:text-gray-800">
            <span class="sr-only">Back</span>
            ← Back
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Fuel & Maintenance Log</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Quick Actions -->
        <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            @click="openFuelLogForm"
            class="p-4 text-left bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
          >
            <span class="block text-sm font-medium text-gray-900">Log Fuel Purchase</span>
            <span class="text-xs text-gray-500">Record new fuel purchase for your bus</span>
          </button>
          <button
            @click="openIssueForm"
            class="p-4 text-left bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
          >
            <span class="block text-sm font-medium text-gray-900">Report Issue</span>
            <span class="text-xs text-gray-500">Report mechanical or technical problems</span>
          </button>
        </div>

        <!-- Fuel Log Form -->
        <div v-if="showFuelLogForm" class="bg-white shadow rounded-lg p-6 mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Log Fuel Purchase</h2>
          <form @submit.prevent="submitFuelLog" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="amount" class="block text-sm font-medium text-gray-700">Amount (Liters)</label>
                <input
                  type="number"
                  id="amount"
                  v-model="fuelLog.amount"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label for="cost" class="block text-sm font-medium text-gray-700">Cost (TND)</label>
                <input
                  type="number"
                  id="cost"
                  v-model="fuelLog.cost"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label for="station" class="block text-sm font-medium text-gray-700">Station</label>
              <select
                id="station"
                v-model="fuelLog.station"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select station</option>
                <option v-for="station in stations" :key="station.id" :value="station.id">
                  {{ station.name }}
                </option>
              </select>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showFuelLogForm = false"
                class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Submit
              </button>
            </div>
          </form>
        </div>

        <!-- Issue Report Form -->
        <div v-if="showIssueForm" class="bg-white shadow rounded-lg p-6 mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Report Technical Issue</h2>
          <form @submit.prevent="submitIssue" class="space-y-4">
            <div>
              <label for="issue-type" class="block text-sm font-medium text-gray-700">Issue Type</label>
              <select
                id="issue-type"
                v-model="issue.type"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select issue type</option>
                <option v-for="type in issueTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                v-model="issue.description"
                rows="3"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              ></textarea>
            </div>
            <div>
              <label for="severity" class="block text-sm font-medium text-gray-700">Severity</label>
              <select
                id="severity"
                v-model="issue.severity"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showIssueForm = false"
                class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Submit
              </button>
            </div>
          </form>
        </div>

        <!-- Recent Logs -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Recent Logs</h2>
          <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="log in recentLogs" :key="log.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ log.type }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ log.details }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(log.date) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[getStatusClass(log.status),
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium']">
                      {{ log.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Form visibility states
const showFuelLogForm = ref(false)
const showIssueForm = ref(false)

// Mock data for fuel stations
const stations = ref([
  { id: 1, name: 'STS Depot Station' },
  { id: 2, name: 'Total - Avenue Habib Bourguiba' },
  { id: 3, name: 'Shell - Lac 2' }
])

// Mock data for issue types
const issueTypes = ref([
  { id: 1, name: 'Engine Problem' },
  { id: 2, name: 'Brake System' },
  { id: 3, name: 'Transmission' },
  { id: 4, name: 'Electrical System' },
  { id: 5, name: 'Air Conditioning' }
])

// Form data
const fuelLog = ref({
  amount: '',
  cost: '',
  station: ''
})

const issue = ref({
  type: '',
  description: '',
  severity: 'medium'
})

// Mock data for recent logs
const recentLogs = ref([
  {
    id: 1,
    type: 'Fuel Purchase',
    details: '50L at STS Depot Station',
    date: '2024-02-20T10:30:00',
    status: 'completed'
  },
  {
    id: 2,
    type: 'Mechanical Issue',
    details: 'Brake system inspection required',
    date: '2024-02-19T15:45:00',
    status: 'pending'
  },
  {
    id: 3,
    type: 'Maintenance',
    details: 'Regular oil change',
    date: '2024-02-18T09:15:00',
    status: 'completed'
  }
])

// Form handlers
const openFuelLogForm = () => {
  showFuelLogForm.value = true
  showIssueForm.value = false
}

const openIssueForm = () => {
  showIssueForm.value = true
  showFuelLogForm.value = false
}

const submitFuelLog = () => {
  // Implementation to submit fuel log
  console.log('Submitting fuel log:', fuelLog.value)
  showFuelLogForm.value = false
}

const submitIssue = () => {
  // Implementation to submit issue
  console.log('Submitting issue:', issue.value)
  showIssueForm.value = false
}

// Helper functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('fr-TN')
}

const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'in-progress':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>