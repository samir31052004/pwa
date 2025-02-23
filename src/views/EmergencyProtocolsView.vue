<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center">
          <button @click="router.back()" class="mr-4 text-gray-600 hover:text-gray-800">
            <span class="sr-only">Back</span>
            ← Back
          </button>
          <h1 class="text-3xl font-bold text-gray-900">STS Emergency Protocols</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Emergency Contacts -->
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Emergency Contacts</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="contact in emergencyContacts" :key="contact.id" 
                 class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                 @click="callEmergencyContact(contact)">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">{{ contact.name }}</h3>
                  <p class="text-sm text-gray-500">{{ contact.department }}</p>
                </div>
                <div class="bg-red-100 rounded-full p-2">
                  <svg class="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              <p class="mt-2 text-sm font-medium text-indigo-600">{{ contact.phone }}</p>
            </div>
          </div>
        </div>

        <!-- Emergency Protocols -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Emergency Protocols</h2>
          <div class="space-y-4">
            <div v-for="protocol in emergencyProtocols" :key="protocol.id" class="border rounded-lg p-4">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <span :class="[`bg-${protocol.severity}-100 text-${protocol.severity}-800`,
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium']">
                    {{ protocol.severity.toUpperCase() }}
                  </span>
                </div>
                <div class="ml-3 flex-1">
                  <h3 class="text-sm font-medium text-gray-900">{{ protocol.title }}</h3>
                  <div class="mt-2 space-y-4">
                    <ol class="list-decimal list-inside space-y-2">
                      <li v-for="(step, index) in protocol.steps" :key="index"
                          class="text-sm text-gray-600">
                        {{ step }}
                      </li>
                    </ol>
                    <div class="mt-3">
                      <button
                        @click="downloadProtocol(protocol)"
                        class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

// Mock data for emergency contacts
const emergencyContacts = ref([
  {
    id: 1,
    name: 'STS Control Room',
    department: 'Operations Center',
    phone: '+216 71 123 456'
  },
  {
    id: 2,
    name: 'Charles Nicolle Hospital',
    department: 'Emergency Services',
    phone: '+216 71 578 000'
  },
  {
    id: 3,
    name: 'Police Emergency',
    department: 'Traffic Division',
    phone: '197'
  },
  {
    id: 4,
    name: 'Fire Department',
    department: 'Emergency Response',
    phone: '198'
  },
  {
    id: 5,
    name: 'STS Maintenance Team',
    department: 'Technical Support',
    phone: '+216 71 789 012'
  },
  {
    id: 6,
    name: 'STS Security Office',
    department: 'Security Division',
    phone: '+216 71 345 678'
  }
])

// Mock data for emergency protocols
const emergencyProtocols = ref([
  {
    id: 1,
    title: 'Vehicle Accident Protocol',
    severity: 'red',
    steps: [
      'Ensure passenger safety and check for injuries',
      'Contact STS Control Room immediately',
      'Document the scene with photos',
      'Collect witness information',
      'Fill out incident report form',
      'Wait for STS response team arrival'
    ]
  },
  {
    id: 2,
    title: 'Medical Emergency Protocol',
    severity: 'yellow',
    steps: [
      'Assess the situation and passenger condition',
      'Call emergency services if needed',
      'Contact STS Control Room',
      'Keep other passengers calm and informed',
      'Document the incident'
    ]
  },
  {
    id: 3,
    title: 'Vehicle Breakdown Protocol',
    severity: 'orange',
    steps: [
      'Park safely if possible',
      'Activate hazard lights',
      'Contact STS Maintenance Team',
      'Inform passengers of the situation',
      'Follow maintenance team instructions'
    ]
  }
])

// Call emergency contact
const callEmergencyContact = (contact) => {
  // Implementation to initiate phone call
  console.log('Calling:', contact.phone)
}

// Download protocol PDF
const downloadProtocol = (protocol) => {
  // Implementation to download protocol PDF
  console.log('Downloading protocol:', protocol.title)
}
</script>