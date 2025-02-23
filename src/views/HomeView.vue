<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900" v-if="isAuthenticated">
          Welcome, {{ driverName }}
        </h1>
        <h1 class="text-3xl font-bold text-gray-900" v-else>
          Welcome to Bus Driver Portal
        </h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Weather Widget -->
        <div class="mb-6 bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Tunis Weather</h2>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-4xl mr-4">🌤️</span>
              <div>
                <p class="text-2xl font-bold">24°C</p>
                <p class="text-sm text-gray-500">Partly Cloudy</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Humidity: 65%</p>
              <p class="text-sm text-gray-500">Wind: 12 km/h</p>
            </div>
          </div>
        </div>

        <!-- Content for logged-in drivers -->
        <template v-if="isAuthenticated">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <router-link
              to="/active-trip"
              class="flex items-center justify-center px-8 py-12 bg-indigo-600 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <span class="mr-4">🚌</span>
              Start Trip
            </router-link>

            <router-link
              to="/incident-report"
              class="flex items-center justify-center px-8 py-12 bg-red-600 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-200"
            >
              <span class="mr-4">⚠️</span>
              Report Incident
            </router-link>
          </div>

          <!-- Quick Actions for logged-in drivers -->
          <div class="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <router-link
              v-for="action in quickActions"
              :key="action.to"
              :to="action.to"
              class="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-center"
            >
              <span class="block text-2xl mb-2">{{ action.icon }}</span>
              <span class="block text-sm font-medium text-gray-900">{{
                action.label
              }}</span>
            </router-link>
          </div>
        </template>

        <!-- Content for logged-out users -->
        <template v-else>
          <div class="text-center py-12">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">
              Join Our Driver Community
            </h2>
            <p class="text-gray-600 mb-8">
              Access your dashboard, manage trips, and more by signing in or
              creating an account.
            </p>

            <div class="flex justify-center space-x-4">
              <router-link
                to="/login"
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign In
              </router-link>
              <router-link
                to="/register"
                class="inline-flex items-center px-6 py-3 border text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 border-indigo-600"
              >
                Register
              </router-link>
            </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

const isAuthenticated = computed(() => {
  return localStorage.getItem("driver-session") !== null;
});

const driverName = computed(() => {
  const driverInfo = localStorage.getItem("driver-info");
  if (driverInfo) {
    const driver = JSON.parse(driverInfo);
    return `${driver.first_name} ${driver.last_name}`;
  }
  return "";
});

const quickActions = ref([
  { icon: "🕌", label: "Prayer Times", to: "/prayer-times" },
  { icon: "🔧", label: "Maintenance Log", to: "/maintenance-log" },
  { icon: "📝", label: "Trip History", to: "/trip-history" },
  { icon: "💡", label: "Suggestions", to: "/suggestions" },
  { icon: "🚨", label: "Emergency Protocols", to: "/emergency-protocols" },
  { icon: "🔔", label: "Notifications", to: "/notifications" },
]);
</script>
