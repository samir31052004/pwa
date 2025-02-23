<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center">
          <button @click="router.back()" class="mr-4 text-gray-600 hover:text-gray-800">
            <span class="sr-only">Back</span>
            ← Back
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Driver Feedback & Suggestions</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Submit Suggestion Form -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Submit New Suggestion</h2>
            <form @submit.prevent="submitSuggestion" class="space-y-4">
              <div>
                <label for="type" class="block text-sm font-medium text-gray-700">Type</label>
                <select
                  id="type"
                  v-model="newSuggestion.type"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="route_optimization">Route Optimization</option>
                  <option value="infrastructure_issue">Infrastructure Issue</option>
                  <option value="coordination_improvement">Coordination Improvement</option>
                </select>
              </div>

              <div>
                <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  v-model="newSuggestion.title"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  v-model="newSuggestion.description"
                  rows="4"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                ></textarea>
              </div>

              <div>
                <label for="location" class="block text-sm font-medium text-gray-700">Location (if applicable)</label>
                <input
                  type="text"
                  id="location"
                  v-model="newSuggestion.location"
                  class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit Suggestion
                </button>
              </div>
            </form>
          </div>

          <!-- STS Staff Rating -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Rate STS Staff Coordination</h2>
            <div class="space-y-4">
              <div v-for="staff in stsStaff" :key="staff.id" class="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">{{ staff.name }}</h3>
                    <p class="text-sm text-gray-500">{{ staff.role }}</p>
                  </div>
                  <div class="flex items-center space-x-1">
                    <button
                      v-for="star in 5"
                      :key="star"
                      @click="rateStaff(staff.id, star)"
                      :class="[
                        'p-1',
                        staff.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                      ]"
                    >
                      ★
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Submitted Suggestions -->
          <div class="bg-white shadow rounded-lg p-6 lg:col-span-2">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Your Submitted Suggestions</h2>
            <div class="overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="suggestion in submittedSuggestions" :key="suggestion.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatType(suggestion.type) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ suggestion.title }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ suggestion.location || 'N/A' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusClass(suggestion.status)">
                        {{ suggestion.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(suggestion.submittedAt) }}</td>
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

// Form data
const newSuggestion = ref({
  type: 'route_optimization',
  title: '',
  description: '',
  location: ''
})

// Mock STS staff data
const stsStaff = ref([
  { id: 1, name: 'John Smith', role: 'Dispatcher', rating: 0 },
  { id: 2, name: 'Sarah Johnson', role: 'Controller', rating: 0 },
  { id: 3, name: 'Mike Davis', role: 'Coordinator', rating: 0 }
])

// Mock submitted suggestions
const submittedSuggestions = ref([
  {
    id: 1,
    type: 'infrastructure_issue',
    title: 'Pothole on Route 202',
    location: 'Route 202, Mile Marker 15',
    status: 'Under Review',
    submittedAt: '2024-02-15T10:30:00'
  },
  {
    id: 2,
    type: 'route_optimization',
    title: 'Alternative Route for Rush Hour',
    location: 'Downtown Area',
    status: 'Implemented',
    submittedAt: '2024-02-14T15:45:00'
  }
])

// Submit new suggestion
const submitSuggestion = () => {
  const suggestion = {
    id: submittedSuggestions.value.length + 1,
    ...newSuggestion.value,
    status: 'Pending',
    submittedAt: new Date().toISOString()
  }
  submittedSuggestions.value.unshift(suggestion)
  
  // Reset form
  newSuggestion.value = {
    type: 'route_optimization',
    title: '',
    description: '',
    location: ''
  }
}

// Rate STS staff
const rateStaff = (staffId, rating) => {
  const staff = stsStaff.value.find(s => s.id === staffId)
  if (staff) {
    staff.rating = rating
  }
}

// Format suggestion type for display
const formatType = (type) => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

// Get status badge class
const getStatusClass = (status) => {
  const classes = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Under Review': 'bg-blue-100 text-blue-800',
    'Implemented': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800'
  }
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[status] || classes['Pending']}`
}

// Format date for display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  // In a real application, fetch actual data here
})
</script>