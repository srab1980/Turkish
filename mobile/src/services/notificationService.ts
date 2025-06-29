import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiClient } from './apiClient'

export interface NotificationData {
  id: string
  title: string
  body: string
  data?: any
  categoryId?: string
  sound?: boolean
  badge?: number
}

export interface ScheduledNotification {
  id: string
  title: string
  body: string
  trigger: Notifications.NotificationTriggerInput
  data?: any
}

export interface ReminderSettings {
  enabled: boolean
  dailyStudyTime: string // HH:MM format
  streakReminders: boolean
  lessonReminders: boolean
  practiceReminders: boolean
  weeklyGoalReminders: boolean
}

export class NotificationService {
  private static expoPushToken: string | null = null
  private static isInitialized = false

  // Initialize notification service
  static async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return

      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      })

      // Register notification categories
      await this.registerNotificationCategories()

      // Request permissions and get push token
      await this.requestPermissions()
      await this.registerForPushNotifications()

      this.isInitialized = true
      console.log('Notification service initialized')
    } catch (error) {
      console.error('Failed to initialize notification service:', error)
      throw error
    }
  }

  // Request notification permissions
  static async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices')
        return false
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permission not granted')
        return false
      }

      return true
    } catch (error) {
      console.error('Error requesting notification permissions:', error)
      return false
    }
  }

  // Register for push notifications
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        return null
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data
      this.expoPushToken = token

      // Send token to backend
      await this.sendTokenToBackend(token)

      console.log('Push token registered:', token)
      return token
    } catch (error) {
      console.error('Error registering for push notifications:', error)
      return null
    }
  }

  // Send push token to backend
  private static async sendTokenToBackend(token: string): Promise<void> {
    try {
      await apiClient.request('/notifications/register-token', {
        method: 'POST',
        body: {
          token,
          platform: Platform.OS,
          deviceId: Device.osInternalBuildId || 'unknown',
        },
      })
    } catch (error) {
      console.error('Failed to send push token to backend:', error)
    }
  }

  // Register notification categories
  private static async registerNotificationCategories(): Promise<void> {
    try {
      await Notifications.setNotificationCategoryAsync('study_reminder', [
        {
          identifier: 'start_lesson',
          buttonTitle: 'Start Lesson',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'snooze',
          buttonTitle: 'Remind Later',
          options: { opensAppToForeground: false },
        },
      ])

      await Notifications.setNotificationCategoryAsync('streak_reminder', [
        {
          identifier: 'continue_streak',
          buttonTitle: 'Continue Streak',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'dismiss',
          buttonTitle: 'Dismiss',
          options: { opensAppToForeground: false },
        },
      ])

      await Notifications.setNotificationCategoryAsync('practice_reminder', [
        {
          identifier: 'practice_now',
          buttonTitle: 'Practice Now',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'later',
          buttonTitle: 'Later',
          options: { opensAppToForeground: false },
        },
      ])
    } catch (error) {
      console.error('Failed to register notification categories:', error)
    }
  }

  // Schedule local notification
  static async scheduleNotification(notification: ScheduledNotification): Promise<string | null> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
          badge: 1,
        },
        trigger: notification.trigger,
      })

      console.log('Notification scheduled:', identifier)
      return identifier
    } catch (error) {
      console.error('Failed to schedule notification:', error)
      return null
    }
  }

  // Cancel scheduled notification
  static async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier)
      console.log('Notification cancelled:', identifier)
    } catch (error) {
      console.error('Failed to cancel notification:', error)
    }
  }

  // Cancel all scheduled notifications
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync()
      console.log('All notifications cancelled')
    } catch (error) {
      console.error('Failed to cancel all notifications:', error)
    }
  }

  // Get scheduled notifications
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync()
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error)
      return []
    }
  }

  // Schedule daily study reminder
  static async scheduleDailyStudyReminder(
    time: string, // HH:MM format
    enabled: boolean = true
  ): Promise<string | null> {
    try {
      // Cancel existing daily reminder
      await this.cancelNotificationsByCategory('daily_study')

      if (!enabled) return null

      const [hours, minutes] = time.split(':').map(Number)
      
      const identifier = await this.scheduleNotification({
        id: 'daily_study_reminder',
        title: '📚 Time to Study Turkish!',
        body: 'Keep your learning streak alive with today\'s lesson.',
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
        data: {
          category: 'daily_study',
          action: 'open_lessons',
        },
      })

      return identifier
    } catch (error) {
      console.error('Failed to schedule daily study reminder:', error)
      return null
    }
  }

  // Schedule streak reminder
  static async scheduleStreakReminder(streakDays: number): Promise<string | null> {
    try {
      const title = streakDays > 0 
        ? `🔥 ${streakDays} Day Streak!`
        : '💪 Start Your Streak!'
      
      const body = streakDays > 0
        ? 'Don\'t break your amazing streak! Complete today\'s lesson.'
        : 'Begin your Turkish learning journey today!'

      return await this.scheduleNotification({
        id: 'streak_reminder',
        title,
        body,
        trigger: {
          seconds: 60 * 60 * 2, // 2 hours from now
        },
        data: {
          category: 'streak_reminder',
          streakDays,
          action: 'continue_streak',
        },
      })
    } catch (error) {
      console.error('Failed to schedule streak reminder:', error)
      return null
    }
  }

  // Schedule practice reminder
  static async schedulePracticeReminder(
    lessonId: string,
    lessonTitle: string,
    delayHours: number = 24
  ): Promise<string | null> {
    try {
      return await this.scheduleNotification({
        id: `practice_${lessonId}`,
        title: '🎯 Time to Practice!',
        body: `Review "${lessonTitle}" to strengthen your memory.`,
        trigger: {
          seconds: delayHours * 60 * 60,
        },
        data: {
          category: 'practice_reminder',
          lessonId,
          action: 'practice_lesson',
        },
      })
    } catch (error) {
      console.error('Failed to schedule practice reminder:', error)
      return null
    }
  }

  // Schedule weekly goal reminder
  static async scheduleWeeklyGoalReminder(): Promise<string | null> {
    try {
      return await this.scheduleNotification({
        id: 'weekly_goal_reminder',
        title: '🎯 Weekly Goal Check',
        body: 'How are you progressing with your weekly learning goal?',
        trigger: {
          weekday: 1, // Monday
          hour: 9,
          minute: 0,
          repeats: true,
        },
        data: {
          category: 'weekly_goal',
          action: 'check_progress',
        },
      })
    } catch (error) {
      console.error('Failed to schedule weekly goal reminder:', error)
      return null
    }
  }

  // Cancel notifications by category
  private static async cancelNotificationsByCategory(category: string): Promise<void> {
    try {
      const scheduled = await this.getScheduledNotifications()
      const categoryNotifications = scheduled.filter(
        notification => notification.content.data?.category === category
      )

      for (const notification of categoryNotifications) {
        await this.cancelNotification(notification.identifier)
      }
    } catch (error) {
      console.error(`Failed to cancel ${category} notifications:`, error)
    }
  }

  // Update reminder settings
  static async updateReminderSettings(settings: ReminderSettings): Promise<void> {
    try {
      // Store settings
      await AsyncStorage.setItem('reminder_settings', JSON.stringify(settings))

      // Cancel all existing reminders
      await this.cancelAllNotifications()

      if (!settings.enabled) return

      // Schedule new reminders based on settings
      if (settings.dailyStudyTime) {
        await this.scheduleDailyStudyReminder(settings.dailyStudyTime, true)
      }

      if (settings.weeklyGoalReminders) {
        await this.scheduleWeeklyGoalReminder()
      }

      console.log('Reminder settings updated')
    } catch (error) {
      console.error('Failed to update reminder settings:', error)
    }
  }

  // Get reminder settings
  static async getReminderSettings(): Promise<ReminderSettings> {
    try {
      const stored = await AsyncStorage.getItem('reminder_settings')
      if (stored) {
        return JSON.parse(stored)
      }

      // Default settings
      return {
        enabled: true,
        dailyStudyTime: '19:00',
        streakReminders: true,
        lessonReminders: true,
        practiceReminders: true,
        weeklyGoalReminders: true,
      }
    } catch (error) {
      console.error('Failed to get reminder settings:', error)
      return {
        enabled: false,
        dailyStudyTime: '19:00',
        streakReminders: false,
        lessonReminders: false,
        practiceReminders: false,
        weeklyGoalReminders: false,
      }
    }
  }

  // Handle notification response
  static async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
    try {
      const { notification, actionIdentifier } = response
      const data = notification.request.content.data

      console.log('Notification response:', { actionIdentifier, data })

      // Handle different actions
      switch (actionIdentifier) {
        case 'start_lesson':
        case 'continue_streak':
        case 'practice_now':
          // These will be handled by the app navigation
          break
        
        case 'snooze':
          // Reschedule for 1 hour later
          await this.scheduleNotification({
            id: 'snoozed_reminder',
            title: notification.request.content.title || 'Study Reminder',
            body: notification.request.content.body || 'Time to continue learning!',
            trigger: { seconds: 60 * 60 }, // 1 hour
            data: data,
          })
          break
        
        default:
          // Default action (tap notification)
          break
      }
    } catch (error) {
      console.error('Failed to handle notification response:', error)
    }
  }

  // Get push token
  static getPushToken(): string | null {
    return this.expoPushToken
  }

  // Set badge count
  static async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count)
    } catch (error) {
      console.error('Failed to set badge count:', error)
    }
  }

  // Clear badge
  static async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0)
    } catch (error) {
      console.error('Failed to clear badge:', error)
    }
  }
}
