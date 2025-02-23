<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isLoggedIn = computed(() => !!localStorage.getItem('driver-session'))
const sidebarOpen = ref(false)

const logout = () => {
  localStorage.removeItem('driver-session')
  localStorage.removeItem('driver-info')
  router.push({ name: 'login' })
}

const navigationItems = [
  { name: 'Tableau de bord', icon: '📊', route: '/dashboard' },
  { name: 'Trajet actif', icon: '🚌', route: '/active-trip' },
  { name: 'Historique des trajets', icon: '📜', route: '/trip-history' },
  { name: 'Incidents', icon: '⚠️', route: '/incident-report' },
  { name: 'Heures de prière', icon: '🕌', route: '/prayer-times' },
  { name: 'Urgence', icon: '🚨', route: '/emergency-protocols' },
  { name: 'Maintenance', icon: '🔧', route: '/maintenance-log' },
  { name: 'Suggestions', icon: '💡', route: '/suggestions' },
  { name: 'Notifications', icon: '🔔', route: '/notifications' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Sidebar for desktop -->
    <div class="hidden md:flex md:flex-shrink-0">
      <div class="flex flex-col w-64 bg-gray-800">
        <div class="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
          <img class="h-8 w-auto" src="@/assets/logo.svg" alt="MyBus Logo" />
          <span class="ml-2 text-xl font-bold text-white">MyBus</span>
        </div>
        <div class="h-0 flex-1 flex flex-col overflow-y-auto">
          <!-- Navigation -->
          <nav class="flex-1 px-2 py-4 space-y-1">
            <template v-if="isLoggedIn">
              <RouterLink
                v-for="item in navigationItems"
                :key="item.route"
                :to="item.route"
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out"
                :class="[route.path === item.route ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
                active-class="bg-gray-900 text-white"
              >
                <span class="mr-3 text-xl">{{ item.icon }}</span>
                {{ item.name }}
              </RouterLink>
              <button
                @click="logout"
                class="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 ease-in-out"
              >
                <span class="mr-3 text-xl">🚪</span>
                Logout
              </button>
            </template>
          </nav>
        </div>
      </div>
    </div>

    <!-- Mobile menu button -->
    <div class="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-800 flex items-center justify-between p-4">
      <div class="flex items-center">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white p-2 rounded-md"
          aria-label="Toggle menu"
        >
          <span class="sr-only">{{ sidebarOpen ? 'Close menu' : 'Open menu' }}</span>
          <svg
            class="h-6 w-6 transition-transform duration-200"
            :class="{ 'transform rotate-90': sidebarOpen }"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <img class="h-8 w-auto ml-4" src="@/assets/logo.svg" alt="MyBus Logo" />
        <span class="ml-2 text-xl font-bold text-white">MyBus</span>
      </div>
    </div>

    <!-- Mobile sidebar with transition -->
    <div
      v-if="sidebarOpen"
      class="md:hidden fixed inset-0 flex z-40"
      @click.self="sidebarOpen = false"
    >
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300"></div>
      <div
        class="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800 transform transition-transform duration-300 ease-in-out"
        :class="{ 'translate-x-0': sidebarOpen, '-translate-x-full': !sidebarOpen }"
      >
        <div class="absolute top-0 right-0 -mr-12 pt-2">
          <button
            @click="sidebarOpen = false"
            class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-label="Close menu"
          >
            <span class="sr-only">Close sidebar</span>
            <svg
              class="h-6 w-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <nav class="mt-5 px-2 space-y-1">
            <template v-if="isLoggedIn">
              <RouterLink
                v-for="item in navigationItems"
                :key="item.route"
                :to="item.route"
                class="group flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors duration-200 ease-in-out active:bg-gray-900"
                :class="[route.path === item.route ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
                @click="sidebarOpen = false"
              >
                <span class="mr-4 text-xl">{{ item.icon }}</span>
                {{ item.name }}
              </RouterLink>
              <button
                @click="logout"
                class="w-full group flex items-center px-4 py-3 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 ease-in-out"
              >
                <span class="mr-4 text-xl">🚪</span>
                Logout
              </button>
            </template>
          </nav>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col md:pl-64">
      <div class="md:hidden h-16"></div> <!-- Spacer for mobile header -->
      <main class="flex-1 overflow-y-auto focus:outline-none">
        <div class="py-6">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Add smooth touch scrolling for mobile devices */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
}

/* Prevent text selection during touch interactions */
.group {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

/* Improve touch target sizes for mobile */
@media (max-width: 768px) {
  .group {
    min-height: 48px;
  }
}
</style>
