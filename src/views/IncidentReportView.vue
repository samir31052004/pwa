<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center">
          <button @click="router.back()" class="mr-4 text-gray-600 hover:text-gray-800">
            <span class="sr-only">Back</span>
            ← Back
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Report Incident</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Quick Report Buttons -->
        <div class="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            v-for="quickReport in quickReports"
            :key="quickReport.type"
            @click="handleQuickReport(quickReport)"
            class="p-4 text-left bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
          >
            <span class="block text-sm font-medium text-gray-900">{{ quickReport.label }}</span>
            <span class="text-xs text-gray-500">{{ quickReport.description }}</span>
          </button>
        </div>

        <form @submit.prevent="submitIncident" class="space-y-6">
          <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div class="md:grid md:grid-cols-3 md:gap-6">
              <div class="md:col-span-1">
                <h3 class="text-lg font-medium leading-6 text-gray-900">Incident Details</h3>
                <p class="mt-1 text-sm text-gray-500">Please provide details about the incident.</p>
                <div class="mt-4">
                  <button
                    type="button"
                    @click="startVoiceInput"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span v-if="!isRecording">🎤 Voice Input (العربية)</span>
                    <span v-else class="text-red-600">⏺ Recording...</span>
                  </button>
                </div>
              </div>
              <div class="mt-5 md:mt-0 md:col-span-2">
                <div class="grid grid-cols-6 gap-6">
                  <div class="col-span-6 sm:col-span-3">
                    <label for="incident-type" class="block text-sm font-medium text-gray-700">Incident Type</label>
                    <select
                      id="incident-type"
                      v-model="incidentData.type"
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="mechanical">Mechanical Failure</option>
                      <option value="passenger">Passenger Dispute</option>
                      <option value="infrastructure">Road Infrastructure Issue</option>
                      <option value="weather">Weather-Related Issue</option>
                      <option value="traffic">Traffic Incident</option>
                      <option value="security">Security Incident</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div class="col-span-6 sm:col-span-3">
                    <label for="severity" class="block text-sm font-medium text-gray-700">Severity</label>
                    <select
                      id="severity"
                      v-model="incidentData.severity"
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div class="col-span-6">
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="description"
                      v-model="incidentData.description"
                      rows="3"
                      class="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Describe the incident..."
                    ></textarea>
                  </div>

                  <div class="col-span-6">
                    <label class="block text-sm font-medium text-gray-700">Photos/Videos</label>
                    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div class="space-y-1 text-center">
                        <svg
                          class="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                        <div class="flex text-sm text-gray-600">
                          <label
                            for="file-upload"
                            class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Upload files</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              class="sr-only"
                              multiple
                              @change="handleFileUpload"
                              accept="image/*,video/*"
                            >
                          </label>
                          <p class="pl-1">or drag and drop</p>
                        </div>
                        <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                    <!-- Preview uploaded files -->
                    <div v-if="uploadedFiles.length > 0" class="mt-4 grid grid-cols-2 gap-4">
                      <div v-for="(file, index) in uploadedFiles" :key="index" class="relative">
                        <img v-if="file.type.startsWith('image/')" :src="file.preview" class="h-24 w-full object-cover rounded-lg">
                        <video v-else-if="file.type.startsWith('video/')" :src="file.preview" class="h-24 w-full object-cover rounded-lg" controls></video>
                        <button @click="removeFile(index)" class="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          <span class="sr-only">Remove</span>
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Follow-up Section -->
          <div v-if="incidentData.id" class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Follow-up Status</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">Status</p>
                  <p class="text-sm text-gray-500">{{ incidentData.status || 'Pending Review' }}</p>
                </div>
                <span :class="{
                  'bg-yellow-100 text-yellow-800': incidentData.status === 'Pending',
                  'bg-green-100 text-green-800': incidentData.status === 'Resolved',
                  'bg-blue-100 text-blue-800': incidentData.status === 'In Progress'
                }" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ incidentData.status || 'Pending' }}
                </span>
              </div>
              <div v-if="incidentData.assignedTo">
                <p class="text-sm font-medium text-gray-900">Assigned To</p>
                <p class="text-sm text-gray-500">{{ incidentData.assignedTo }}</p>
              </div>
              <div v-if="incidentData.resolution">
                <p class="text-sm font-medium text-gray-900">Resolution Notes</p>
                <p class="text-sm text-gray-500">{{ incidentData.resolution }}</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { openDB } from 'idb'

const router = useRouter()
const uploadedFiles = ref([])
const isRecording = ref(false)
const recognition = ref(null)
const isLoadingLocation = ref(false)

const incidentData = ref({
  id: '',
  type: '',
  severity: '',
  description: '',
  location: '',
  coordinates: {
    latitude: null,
    longitude: null
  },
  files: [],
  status: '',
  assignedTo: '',
  resolution: ''
})

const quickReports = [
  { type: 'engine', label: 'Engine Overheating', description: 'Report engine temperature issues' },
  { type: 'brakes', label: 'Brake System', description: 'Report brake-related problems' },
  { type: 'crowd', label: 'Overcrowding', description: 'Report passenger capacity issues' },
  { type: 'weather', label: 'Weather Impact', description: 'Report weather-related delays' }
]

// Get current location
const getCurrentLocation = async () => {
  isLoadingLocation.value = true
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })
    
    incidentData.value.coordinates.latitude = position.coords.latitude
    incidentData.value.coordinates.longitude = position.coords.longitude
    
    // Reverse geocoding to get address
    incidentData.value.location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
  } catch (error) {
    console.error('Error getting location:', error)
  } finally {
    isLoadingLocation.value = false
  }
}

const handleQuickReport = (report) => {
  incidentData.value.type = report.type
  incidentData.value.description = `Quick report: ${report.label} - ${report.description}`
}

const startVoiceInput = () => {
  try {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.')
      return
    }

    if (!recognition.value) {
      recognition.value = new webkitSpeechRecognition()
      recognition.value.lang = 'ar-TN' // Tunisian Arabic
      recognition.value.continuous = true

      recognition.value.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')

        incidentData.value.description += ' ' + transcript
      }

      recognition.value.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        isRecording.value = false
        alert('Speech recognition error: ' + event.error)
      }

      recognition.value.onend = () => {
        isRecording.value = false
      }
    }

    if (!isRecording.value) {
      recognition.value.start()
      isRecording.value = true
    } else {
      recognition.value.stop()
      isRecording.value = false
    }
  } catch (error) {
    console.error('Error initializing speech recognition:', error)
    alert('Failed to initialize speech recognition')
    isRecording.value = false
  }
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size should not exceed 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedFiles.value.push({
        file,
        preview: e.target.result,
        type: file.type
      })
    }
    reader.readAsDataURL(file)
  })
}

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

const submitIncident = async () => {
  try {
    // Validate required fields
    if (!incidentData.value.type || !incidentData.value.severity || !incidentData.value.description) {
      alert('Please fill in all required fields')
      return
    }

    const formData = new FormData()
    formData.append('type', incidentData.value.type)
    formData.append('severity', incidentData.value.severity)
    formData.append('description', incidentData.value.description)
    
    // Add files to form data
    uploadedFiles.value.forEach((fileData, index) => {
      formData.append(`file${index}`, fileData.file)
    })

    // Generate a unique ID for the incident
    const incidentId = `incident_${Date.now()}`
    formData.append('id', incidentId)

    // Store in IndexedDB for offline support
    const incident = {
      id: incidentId,
      type: incidentData.value.type,
      severity: incidentData.value.severity,
      description: incidentData.value.description,
      status: 'Pending',
      timestamp: new Date().toISOString(),
      files: uploadedFiles.value.map(f => ({
        name: f.file.name,
        type: f.file.type,
        size: f.file.size,
        preview: f.preview
      }))
    }

    // Save to IndexedDB
    const db = await openDB('incidents', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('incidents')) {
          db.createObjectStore('incidents', { keyPath: 'id' })
        }
      }
    })

    await db.add('incidents', incident)

    // Try to submit to server if online
    if (navigator.onLine) {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to submit incident')
      }

      const result = await response.json()
      incidentData.value.id = result.id
      incidentData.value.status = 'Submitted'
    }

    // Reset form
    incidentData.value = {
      id: '',
      type: '',
      severity: '',
      description: '',
      files: [],
      status: '',
      assignedTo: '',
      resolution: ''
    }
    uploadedFiles.value = []

    alert('Incident report submitted successfully')
    router.push('/dashboard')
  } catch (error) {
    console.error('Error submitting incident:', error)
    alert('Failed to submit incident. The report has been saved locally and will be submitted when online.')
  }
}
</script>