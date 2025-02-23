<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Notifications</h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Language Toggle -->
        <div class="mb-4 flex justify-end">
          <button
            @click="toggleLanguage"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {{ notificationService.language.value === 'fr' ? 'العربية' : 'Français' }}
          </button>
        </div>

        <!-- Notifications List -->
        <div class="space-y-4">
          <div
            v-for="notification in notificationService.notifications.value"
            :key="notification.id"
            :class="[
              'bg-white shadow rounded-lg p-4',
              !notification.read ? 'border-l-4' : '',
              !notification.read && notification.priority ? notification.priority.bgColor : ''
            ]"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium" :class="notification.priority?.textColor">
                  {{ notification.title }}
                </p>
                <p class="mt-1 text-sm text-gray-600">{{ notification.message }}</p>
                <p class="mt-1 text-xs text-gray-500">
                  {{ new Date(notification.timestamp).toLocaleString() }}
                </p>

                <!-- Quick Replies -->
                <div v-if="!notification.reply" class="mt-3 space-x-2">
                  <button
                    v-for="reply in QUICK_REPLIES[notificationService.language.value]"
                    :key="reply.id"
                    @click="submitQuickReply(notification.id, reply.id)"
                    class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {{ reply.text }}
                  </button>
                </div>

                <!-- Reply Status -->
                <div v-else class="mt-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ QUICK_REPLIES[notificationService.language.value].find(r => r.id === notification.reply)?.text }}
                  </span>
                </div>
              </div>

              <!-- Mark as Read Button -->
              <button
                v-if="!notification.read"
                @click="markAsRead(notification.id)"
                class="ml-4 text-gray-400 hover:text-gray-500"
              >
                <span class="sr-only">Mark as read</span>
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="notificationService.notifications.value.length === 0" class="text-center py-12">
          <p class="text-sm text-gray-500">
            {{ notificationService.language.value === 'fr' ? 'Aucune notification' : 'لا توجد إشعارات' }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { notificationService, QUICK_REPLIES } from '@/services/NotificationService'

const toggleLanguage = () => {
  notificationService.setLanguage(
    notificationService.language.value === 'fr' ? 'ar' : 'fr'
  )
}

const markAsRead = async (notificationId) => {
  await notificationService.markAsRead(notificationId)
}

const submitQuickReply = async (notificationId, replyId) => {
  await notificationService.submitQuickReply(notificationId, replyId)
}

onMounted(() => {
  // Request notification permission if not granted
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }

  // Schedule prayer time notifications
  notificationService.schedulePrayerTimeNotifications()
})
</script>