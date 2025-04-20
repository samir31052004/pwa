<template>
  <div class="min-h-screen bg-gray-100 touch-manipulation">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-xl sm:text-3xl font-bold text-gray-900 truncate">
            Tableau de Bord
          </h1>
          <button
            @click="logout"
            class="px-4 py-2 text-sm sm:text-base text-indigo-600 hover:text-indigo-800 touch-manipulation"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Current Trip Status -->
        <div class="bg-white shadow rounded-lg p-4 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900">Trajet Actuel</h2>
            <span
              :class="[
                tripStatus === 'En service'
                  ? 'bg-green-100 text-green-800'
                  : tripStatus === 'En pause'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800',
                'px-3 py-1 rounded-full text-sm font-medium',
              ]"
            >
              {{ tripStatus }}
            </span>
          </div>

          <div class="space-y-4">
            <div class="border-b pb-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Départ</p>
                  <p class="mt-1 text-sm text-gray-900">
                    {{ currentTrip.departure }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Arrivée</p>
                  <p class="mt-1 text-sm text-gray-900">
                    {{ currentTrip.arrival }}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500 mb-2">
                Arrêts Intermédiaires
              </p>
              <ul class="space-y-2">
                <li
                  v-for="(stop, index) in currentTrip.intermediateStops"
                  :key="index"
                  class="flex items-center text-sm"
                >
                  <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  {{ stop }}
                </li>
              </ul>
            </div>

            <div v-if="delayInfo.isDelayed" class="bg-red-50 p-3 rounded-lg">
              <p class="text-sm text-red-800">
                Retard: {{ delayInfo.minutes }} minutes
              </p>
              <p class="text-sm text-red-600">
                Temps de rattrapage estimé: {{ delayInfo.recoveryTime }} minutes
              </p>
            </div>

            <button
              @click="toggleGPSTracking"
              :class="[
                isTrackingActive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-indigo-600 hover:bg-indigo-700',
                'w-full mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
              ]"
            >
              {{
                isTrackingActive
                  ? "Désactiver le suivi GPS"
                  : "Activer le suivi GPS"
              }}
            </button>
          </div>
        </div>

        <!-- Weekly Schedule -->
        <div class="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Planning Hebdomadaire
          </h2>
          <div class="overflow-x-auto relative">
            <div
              v-if="showTimeLine"
              :style="{ top: timeLinePosition + 'px' }"
              class="absolute left-0 right-0 h-px bg-red-500 z-10"
            >
              <div
                class="absolute -left-1 -top-1.5 w-2 h-2 bg-red-500 rounded-full"
              ></div>
            </div>
            <table class="min-w-full divide-y divide-gray-200 relative">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Horaire
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Route
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trajet
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="(shift, index) in todayShifts"
                  :key="index"
                  class="hover:bg-gray-50 relative"
                  :class="{ 'bg-blue-50': isCurrentShift(shift) }"
                >
                  <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <span
                      v-if="isCurrentShift(shift)"
                      class="w-2 h-2 bg-red-500 rounded-full inline-block mr-2"
                    ></span>
                    {{ shift.time }}
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {{ shift.route }}
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {{ shift.location }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4"
      role="alert"
    >
      <span class="block sm:inline">{{ error }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/services/SupabaseService";

const router = useRouter();

// Add loading state
const isLoading = ref(true);
const tripStatus = ref(""); // Initialize as empty
const isTrackingActive = ref(false);
const error = ref(null);

// Current trip data with real-time updates
const currentTrip = ref({
  departure: "",
  arrival: "",
  intermediateStops: [],
});

// Delay information
const delayInfo = ref({
  isDelayed: false,
  minutes: 0,
  recoveryTime: 0,
});

// Today's shifts
const todayShifts = ref([]); // Initialize properly

// Add computed property for empty state
const hasShifts = computed(() => todayShifts.value.length > 0);

// Add new reactive properties
const currentTime = ref(new Date());
const timeLinePosition = ref(0);
const tableStartHour = 8; // Assuming workday starts at 8:00
const tableEndHour = 20; // Assuming workday ends at 20:00

// Computed properties
const showTimeLine = computed(() => {
  const hours = currentTime.value.getHours();
  return hours >= tableStartHour && hours < tableEndHour;
});

// Methods
const updateTimeLinePosition = () => {
  const now = new Date();
  currentTime.value = now;

  const totalMinutes = (tableEndHour - tableStartHour) * 60;
  const currentMinutes =
    (now.getHours() - tableStartHour) * 60 + now.getMinutes();
  const percentage = (currentMinutes / totalMinutes) * 100;

  const tableHeight = document.querySelector("tbody")?.offsetHeight || 0;
  timeLinePosition.value = (percentage / 100) * tableHeight;
};

const isCurrentShift = (shift) => {
  const now = currentTime.value;
  const [start, end] = shift.rawTime.split(" - ");
  const startTime = new Date(now.toDateString() + " " + start);
  const endTime = new Date(now.toDateString() + " " + end);
  return now >= startTime && now <= endTime;
};

// Enhanced fetchCurrentTrip with status handling
const fetchCurrentTrip = async () => {
  try {
    isLoading.value = true;
    const { data, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("status", "active")
      .single();

    if (tripError) throw tripError;

    if (data) {
      currentTrip.value = {
        departure: data.departure,
        arrival: data.arrival,
        intermediateStops: data.intermediate_stops || [],
      };
      tripStatus.value = data.status; // Set dynamic status
    }
  } catch (e) {
    error.value = "Erreur lors du chargement du trajet actuel";
    console.error("Error fetching current trip:", e);
  } finally {
    isLoading.value = false;
  }
};

// Modified fetchTodayShifts to include raw time
const fetchTodayShifts = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { data, error: shiftsError } = await supabase
      .from("shifts")
      .select("*")
      .eq("date", today)
      .order("start_time");

    if (shiftsError) throw shiftsError;

    todayShifts.value = data.map((shift) => ({
      time: `${shift.start_time} - ${shift.end_time}`,
      rawTime: `${shift.start_time} - ${shift.end_time}`,
      route: shift.route_number,
      location: `${shift.start_location} - ${shift.end_location}`,
      start: new Date(`${today}T${shift.start_time}`),
      end: new Date(`${today}T${shift.end_time}`),
    }));
  } catch (e) {
    error.value = "Erreur lors du chargement du planning";
    console.error("Error fetching shifts:", e);
  }
};

// Logout function
const logout = async () => {
  try {
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) throw logoutError;
    await router.push("/login");
  } catch (e) {
    error.value = "Erreur lors de la déconnexion";
    console.error("Error during logout:", e);
  }
};

// GPS tracking toggle function
const toggleGPSTracking = async () => {
  try {
    isTrackingActive.value = !isTrackingActive.value;

    if (isTrackingActive.value) {
      // Start GPS tracking
      await startGPSTracking();
    } else {
      // Stop GPS tracking
      await stopGPSTracking();
    }
  } catch (e) {
    error.value = "Erreur lors de la modification du suivi GPS";
    console.error("Error toggling GPS tracking:", e);
    isTrackingActive.value = !isTrackingActive.value; // Revert the toggle
  }
};

// GPS tracking functions
const startGPSTracking = async () => {
  // Implementation will depend on the GPS tracking service
  // This is a placeholder for the actual implementation
  console.log("Starting GPS tracking...");
};

const stopGPSTracking = async () => {
  // Implementation will depend on the GPS tracking service
  // This is a placeholder for the actual implementation
  console.log("Stopping GPS tracking...");
};

// Real-time subscription for trip updates
let tripSubscription;

onMounted(async () => {
  await Promise.all([fetchCurrentTrip(), fetchTodayShifts()]);

  tripSubscription = supabase
    .channel("trips")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "trips",
        filter: "status=eq.active",
      },
      (payload) => {
        currentTrip.value = {
          departure: payload.new.departure,
          arrival: payload.new.arrival,
          intermediateStops: payload.new.intermediate_stops || [],
        };
        tripStatus.value = payload.new.status;
      }
    )
    .subscribe();

  updateTimeLinePosition();
  timelineInterval = setInterval(() => {
    updateTimeLinePosition();
  }, 60000); // Update every minute
});

onUnmounted(() => {
  if (tripSubscription) {
    supabase.removeChannel(tripSubscription);
  }
  clearInterval(timelineInterval);
});
</script>

<style scoped>
/* Add smooth transition for timeline movement */
.absolute {
  transition: top 0.5s ease-in-out;
}
</style>
