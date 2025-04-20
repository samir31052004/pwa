<template>
  <div class="min-h-screen bg-gray-100 touch-manipulation">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <button
              @click="router.back()"
              class="p-2 mr-3 text-gray-600 hover:text-gray-800 touch-manipulation"
            >
              ← Retour
            </button>
            <h1 class="text-xl sm:text-3xl font-bold text-gray-900 truncate">
              {{ currentTrip.route }}
            </h1>
          </div>
          <div class="flex items-center space-x-4">
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
            <button
              @click="logout"
              class="px-4 py-2 text-sm sm:text-base text-indigo-600 hover:text-indigo-800 touch-manipulation"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <!-- Section Gauche -->
        <div class="lg:col-span-1 space-y-4 sm:space-y-6">
          <!-- Statut du Trajet -->
          <div class="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              Détails du Trajet
            </h2>
            <div class="space-y-4">
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
                    <span
                      class="w-2 h-2 bg-indigo-500 rounded-full mr-2"
                    ></span>
                    {{ stop }}
                  </li>
                </ul>
              </div>

              <div v-if="delayInfo.isDelayed" class="bg-red-50 p-3 rounded-lg">
                <p class="text-sm text-red-800">
                  Retard: {{ delayInfo.minutes }} minutes
                </p>
                <p class="text-sm text-red-600">
                  Temps de rattrapage estimé:
                  {{ delayInfo.recoveryTime }} minutes
                </p>
              </div>

              <button
                @click="toggleGPSTracking"
                :class="[
                  isTrackingActive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-indigo-600 hover:bg-indigo-700',
                  'w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                ]"
              >
                {{
                  isTrackingActive
                    ? "Désactiver le suivi GPS"
                    : "Démarrer le trajet"
                }}
              </button>
            </div>
          </div>

          <!-- Informations Temps Réel -->
          <div class="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              Statistiques Temps Réel
            </h2>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">
                  Prochain Arrêt
                </dt>
                <dd class="mt-1 text-base text-gray-900">
                  {{ tripDetails.nextStop }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">
                  Vitesse Actuelle
                </dt>
                <dd class="mt-1 text-base text-gray-900">
                  {{ tripDetails.speed }} km/h
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">
                  ETA Prochain Arrêt
                </dt>
                <dd class="mt-1 text-base text-gray-900">
                  {{ tripDetails.eta }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Section Droite (Carte) -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg p-4 sm:p-6 h-full">
            <div
              class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0"
            >
              <button
                @click="toggleBreakMode"
                :class="[
                  tripDetails.isOnBreak
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-blue-600 hover:bg-blue-700',
                  'w-full sm:w-auto inline-flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-manipulation',
                ]"
              >
                {{ tripDetails.isOnBreak ? "Fin Pause" : "Début Pause" }}
              </button>

              <div
                class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto"
              >
                <select
                  v-model="selectedTrafficCondition"
                  class="block w-full sm:w-48 pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg touch-manipulation"
                >
                  <option value="">Signaler un incident</option>
                  <option value="ariana">Embouteillage Ariana</option>
                  <option value="lac1">Accident Lac 1</option>
                  <option value="sousse">Embouteillage Sousse</option>
                </select>
                <button
                  @click="reportTrafficCondition"
                  class="w-full sm:w-auto inline-flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 touch-manipulation"
                  :disabled="!selectedTrafficCondition"
                >
                  Signaler
                </button>
              </div>
            </div>

            <div
              ref="mapContainer"
              class="h-[60vh] sm:h-[70vh] rounded-lg touch-manipulation relative z-0"
            ></div>
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
import { useRouter, useRoute } from "vue-router";
import { supabase } from "@/services/SupabaseService";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const router = useRouter();
const route = useRoute();
const mapContainer = ref(null);
let map = null;
let busMarker = null;

// État du trajet
const currentTrip = ref({
  departure: "",
  arrival: "",
  intermediateStops: [],
  route: "Trajet Principal",
});

const tripDetails = ref({
  nextStop: "Centre Ville",
  eta: "5 min",
  speed: 0,
  isOnBreak: false,
  position: { lat: 36.8065, lng: 10.1815 },
});

const delayInfo = ref({
  isDelayed: false,
  minutes: 0,
  recoveryTime: 0,
});

// États d'interface
const tripStatus = ref("En service");
const isTrackingActive = ref(false);
const selectedTrafficCondition = ref("");
const error = ref(null);
const watchId = ref(null);

// Fonctions de base
const logout = async () => {
  try {
    await supabase.auth.signOut();
    router.push("/login");
  } catch (e) {
    error.value = "Erreur lors de la déconnexion";
  }
};

const toggleGPSTracking = async () => {
  isTrackingActive.value = !isTrackingActive.value;
  if (isTrackingActive.value) {
    startGPSTracking();
  } else {
    stopGPSTracking();
  }
};

// Logique GPS
const startGPSTracking = () => {
  if (!navigator.geolocation) {
    error.value = "Géolocalisation non supportée";
    return;
  }

  watchId.value = navigator.geolocation.watchPosition(
    (position) => {
      tripDetails.value.position = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      tripDetails.value.speed = Math.round(position.coords.speed * 3.6);
      updateMapPosition();
      checkDelays();
    },
    (error) => {
      console.error("Erreur GPS:", error);
      error.value = "Erreur de géolocalisation";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
};

const stopGPSTracking = () => {
  if (watchId.value) {
    navigator.geolocation.clearWatch(watchId.value);
    watchId.value = null;
  }
};

const updateMapPosition = () => {
  if (busMarker && map) {
    busMarker.setLatLng([
      tripDetails.value.position.lat,
      tripDetails.value.position.lng,
    ]);
    map.panTo([tripDetails.value.position.lat, tripDetails.value.position.lng]);
  }
};

const checkDelays = () => {
  // Implémentez la logique de détection de retard ici
};

// Gestion de la carte
onMounted(() => {
  map = L.map(mapContainer.value).setView([36.8065, 10.1815], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  const busIcon = L.icon({
    iconUrl: "/src/assets/bus-icon.png",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

  busMarker = L.marker([36.8065, 10.1815], { icon: busIcon }).addTo(map);
});

onUnmounted(() => {
  stopGPSTracking();
  if (map) map.remove();
});

// Abonnement aux mises à jour en temps réel
let tripSubscription;

onMounted(async () => {
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
});

onUnmounted(() => {
  if (tripSubscription) supabase.removeChannel(tripSubscription);
});
</script>
