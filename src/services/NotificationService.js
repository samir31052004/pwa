import { ref } from 'vue'
import { openDB } from 'idb'

// Prayer times API endpoint
const PRAYER_TIMES_API = 'https://api.aladhan.com/v1/timingsByCity'

// Notification priority levels with their corresponding styles
export const PRIORITY_LEVELS = {
  EMERGENCY: {
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  },
  WARNING: {
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  INFO: {
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  }
}

// Quick reply options for notifications
export const QUICK_REPLIES = {
  fr: [
    { id: 'acknowledged', text: 'Confirmé' },
    { id: 'need_assistance', text: 'Besoin d\'aide' }
  ],
  ar: [
    { id: 'acknowledged', text: 'تم التأكيد' },
    { id: 'need_assistance', text: 'بحاجة إلى مساعدة' }
  ]
}

class NotificationService {
  constructor() {
    this.notifications = ref([])
    this.language = ref('fr') // Default language
    this.setupDatabase()
  }

  async setupDatabase() {
    this.db = await openDB('notifications', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id' })
        }
      }
    })
  }

  setLanguage(lang) {
    this.language.value = lang
  }

  async addNotification(notification) {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }

    await this.db.add('notifications', newNotification)
    this.notifications.value.unshift(newNotification)

    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      })
    }

    return newNotification
  }

  async markAsRead(notificationId) {
    const notification = await this.db.get('notifications', notificationId)
    if (notification) {
      notification.read = true
      await this.db.put('notifications', notification)
      const index = this.notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        this.notifications.value[index] = notification
      }
    }
  }

  async submitQuickReply(notificationId, replyId) {
    const notification = await this.db.get('notifications', notificationId)
    if (notification) {
      notification.reply = replyId
      notification.replyTimestamp = new Date().toISOString()
      await this.db.put('notifications', notification)

      // Update local state
      const index = this.notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        this.notifications.value[index] = notification
      }

      // Here you would typically send the reply to your backend
      // await this.sendReplyToServer(notificationId, replyId)
    }
  }

  async fetchPrayerTimes(city = 'Tunis', country = 'Tunisia') {
    try {
      const response = await fetch(
        `${PRAYER_TIMES_API}?city=${city}&country=${country}&method=3`
      )
      const data = await response.json()
      if (data.code === 200) {
        return data.data.timings
      }
      throw new Error('Failed to fetch prayer times')
    } catch (error) {
      console.error('Error fetching prayer times:', error)
      return null
    }
  }

  async schedulePrayerTimeNotifications() {
    const times = await this.fetchPrayerTimes()
    if (!times) return

    Object.entries(times).forEach(([prayer, time]) => {
      // Only schedule notifications for the main prayers
      if (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(prayer)) {
        const [hours, minutes] = time.split(':')
        const prayerTime = new Date()
        prayerTime.setHours(parseInt(hours), parseInt(minutes), 0)

        // If prayer time has passed for today, don't schedule
        if (prayerTime > new Date()) {
          const timeUntilPrayer = prayerTime.getTime() - new Date().getTime()
          setTimeout(() => {
            this.addNotification({
              title: `Prayer Time - ${prayer}`,
              message: `It's time for ${prayer} prayer`,
              priority: PRIORITY_LEVELS.INFO,
              type: 'prayer'
            })
          }, timeUntilPrayer)
        }
      }
    })
  }
}

export const notificationService = new NotificationService()