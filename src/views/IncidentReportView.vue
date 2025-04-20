<template>
  <div class="min-h-screen bg-gray-100 touch-manipulation">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-4 px-3 sm:px-6 lg:px-8">
        <div class="flex items-center">
          <button @click="router.back()" class="mr-4 text-gray-600 hover:text-gray-800 touch-manipulation">
            <span class="sr-only">Retour</span>
            ← Retour
          </button>
          <h1 class="text-xl sm:text-3xl font-bold text-gray-900">Signaler un Incident</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Quick Report Buttons -->
        <div class="mb-6 grid grid-cols-2 gap-4">
          <button
            v-for="quickReport in quickReports"
            :key="quickReport.type"
            @click="handleQuickReport(quickReport)"
            class="p-4 text-left bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 touch-manipulation"
          >
            <span class="block text-sm font-medium text-gray-900">{{ quickReport.label }}</span>
            <span class="text-xs text-gray-500">{{ quickReport.description }}</span>
          </button>
        </div>

        <form @submit.prevent="submitIncident" class="space-y-6">
          <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div class="md:grid md:grid-cols-3 md:gap-6">
              <div class="md:col-span-1">
                <h3 class="text-lg font-medium leading-6 text-gray-900">Détails de l'Incident</h3>
                <p class="mt-1 text-sm text-gray-500">Veuillez fournir les détails de l'incident.</p>
              </div>
              <div class="mt-5 md:mt-0 md:col-span-2">
                <div class="grid grid-cols-6 gap-6">
                  <div class="col-span-6 sm:col-span-3">
                    <label for="incident-type" class="block text-sm font-medium text-gray-700">Type d'Incident *</label>
                    <select
                      id="incident-type"
                      v-model="incidentData.type"
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      required
                    >
                      <option value="">Sélectionnez un type</option>
                      <option value="mechanical">Panne Mécanique</option>
                      <option value="absence">Absence</option>
                      <option value="emergency">Urgence</option>
                      <option value="infrastructure">Problème d'Infrastructure</option>
                      <option value="security">Incident de Sécurité</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div class="col-span-6">
                    <label for="description" class="block text-sm font-medium text-gray-700">Description *</label>
                    <textarea
                      id="description"
                      v-model="incidentData.description"
                      rows="3"
                      class="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Décrivez l'incident..."
                      required
                    ></textarea>
                  </div>

                  <div class="col-span-6">
                    <label class="block text-sm font-medium text-gray-700">Photos/Vidéos (Optionnel)</label>
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
                            class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 touch-manipulation"
                          >
                            <span>Ajouter des fichiers</span>
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
                        </div>
                        <p class="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
                      </div>
                    </div>
                    <!-- Preview uploaded files -->
                    <div v-if="uploadedFiles.length > 0" class="mt-4 grid grid-cols-2 gap-4">
                      <div v-for="(file, index) in uploadedFiles" :key="index" class="relative">
                        <img v-if="file.type.startsWith('image/')" :src="file.preview" class="h-24 w-full object-cover rounded-lg">
                        <video v-else-if="file.type.startsWith('video/')" :src="file.preview" class="h-24 w-full object-cover rounded-lg" controls></video>
                        <button @click="removeFile(index)" class="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 touch-manipulation">
                          <span class="sr-only">Supprimer</span>
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
            <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">État de Suivi</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">Statut</p>
                  <p class="text-sm text-gray-500">{{ getStatusInFrench(incidentData.status) }}</p>
                </div>
                <span :class="{
                  'bg-yellow-100 text-yellow-800': incidentData.status === 'Pending',
                  'bg-green-100 text-green-800': incidentData.status === 'Resolved',
                  'bg-blue-100 text-blue-800': incidentData.status === 'In Progress'
                }" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStatusInFrench(incidentData.status) }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-manipulation"
            >
              Envoyer le Signalement
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { openDB } from 'idb'

const router = useRouter()
const uploadedFiles = ref([])

const incidentData = ref({
  id: '',
  type: '',
  description: '',
  status: ''
})

const quickReports = [
  { type: 'mechanical', label: 'Panne Mécanique', description: 'Signaler un problème mécanique' },
  { type: 'absence', label: 'Absence', description: 'Signaler une absence' },
  { type: 'emergency', label: 'Urgence', description: 'Signaler une situation urgente' },
  { type: 'infrastructure', label: 'Infrastructure', description: 'Signaler un problème d\'infrastructure' }
]

const handleQuickReport = (report) => {
  incidentData.value.type = report.type
  incidentData.value.description = `Signalement rapide : ${report.label} - ${report.description}`
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('La taille du fichier ne doit pas dépasser 10MB')
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

const getStatusInFrench = (status) => {
  const statusMap = {
    'Pending': 'En attente',
    'In Progress': 'En cours',
    'Resolved': 'Résolu'
  }
  return statusMap[status] || 'En attente'
}

const submitIncident = async () => {
  try {
    if (!incidentData.value.type || !incidentData.value.description) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    const incidentId = `incident_${Date.now()}`
    const incident = {
      id: incidentId,
      type: incidentData.value.type,
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

    const db = await openDB('incidents', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('incidents')) {
          db.createObjectStore('incidents', { keyPath: 'id' })
        }
      }
    })

    await db.add('incidents', incident)

    incidentData.value = {
      id: '',
      type: '',
      description: '',
      status: ''
    }
    uploadedFiles.value = []

    alert('Signalement envoyé avec succès')
    router.push('/dashboard')
  } catch (error) {
    console.error('Erreur lors de l\'envoi du signalement:', error)
    alert('Échec de l\'envoi. Le signalement a été sauvegardé localement.')
  }
}
</script>