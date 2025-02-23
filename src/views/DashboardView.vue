<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Tableau de Bord MyBus</h1>
          <button @click="logout" class="text-indigo-600 hover:text-indigo-800">Déconnexion</button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Available Trips -->
          <div v-for="trip in availableTrips" :key="trip.id" 
               class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-1">
                  <h3 class="text-lg font-medium text-gray-900">{{ trip.route }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ trip.schedule }}</p>
                </div>
                <div class="ml-4">
                  <span :class="[trip.status === 'On Time' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium']">
                    {{ trip.status }}
                  </span>
                </div>
              </div>
              <div class="mt-4">
                <router-link :to="{ name: 'activeTrip', params: { id: trip.id } }"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Commencer le Suivi
                </router-link>
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

// Mock data for available trips
const availableTrips = ref([
  {
    id: 1,
    route: 'Express Centre-Ville',
    schedule: 'Départ dans 5 minutes',
    status: 'À l\'heure'
  },
  {
    id: 2,
    route: 'Navette Aéroport',
    schedule: 'Départ dans 15 minutes',
    status: 'En retard'
  },
  {
    id: 3,
    route: 'Circuit Campus',
    schedule: 'Départ dans 10 minutes',
    status: 'À l\'heure'
  }
])

const logout = () => {
  localStorage.removeItem('user-token')
  router.push({ name: 'login' })
}
</script>