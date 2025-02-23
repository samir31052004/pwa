import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import ActiveTripView from '../views/ActiveTripView.vue'
import IncidentReportView from '../views/IncidentReportView.vue'
import TripHistoryView from '../views/TripHistoryView.vue'
import PrayerTimesView from '../views/PrayerTimesView.vue'
import EmergencyProtocolsView from '../views/EmergencyProtocolsView.vue'
import MaintenanceLogView from '../views/MaintenanceLogView.vue'
import SuggestionsView from '../views/SuggestionsView.vue'

// Navigation guard to check authentication
const requireAuth = (to, from, next) => {
  const driverSession = localStorage.getItem('driver-session')
  if (!driverSession) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    // Protected routes
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      beforeEnter: requireAuth
    },
    {
      path: '/active-trip',
      name: 'activeTrip',
      component: ActiveTripView,
      beforeEnter: requireAuth
    },
    {
      path: '/incident-report',
      name: 'incidentReport',
      component: IncidentReportView,
      beforeEnter: requireAuth
    },
    {
      path: '/trip-history',
      name: 'tripHistory',
      component: TripHistoryView,
      beforeEnter: requireAuth
    },
    {
      path: '/prayer-times',
      name: 'prayerTimes',
      component: PrayerTimesView,
      beforeEnter: requireAuth
    },
    {
      path: '/emergency-protocols',
      name: 'emergencyProtocols',
      component: EmergencyProtocolsView,
      beforeEnter: requireAuth
    },
    {
      path: '/maintenance-log',
      name: 'maintenanceLog',
      component: MaintenanceLogView,
      beforeEnter: requireAuth
    },
    {
      path: '/suggestions',
      name: 'suggestions',
      component: SuggestionsView,
      beforeEnter: requireAuth
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationView.vue'),
      beforeEnter: requireAuth
    }
  ]
})

export default router
