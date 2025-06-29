import React, { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { useAppSelector } from '../store'
import { NotificationService } from '../services/notificationService'
import { BackgroundTaskService } from '../services/backgroundTaskService'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { notifications } = useAppSelector((state) => state.settings)
  const notificationListener = useRef<any>()
  const responseListener = useRef<any>()
  const isInitialized = useRef(false)

  useEffect(() => {
    // Initialize services once
    const initializeServices = async () => {
      if (isInitialized.current) return

      try {
        // Initialize notification service
        await NotificationService.initialize()
        console.log('NotificationService initialized')

        // Initialize background task service
        await BackgroundTaskService.initialize()
        console.log('BackgroundTaskService initialized')

        isInitialized.current = true
      } catch (error) {
        console.error('Failed to initialize notification services:', error)
      }
    }

    initializeServices()
  }, [])

  useEffect(() => {
    if (!notifications.enabled || !isInitialized.current) {
      return
    }

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification)
      // Handle notification received while app is in foreground
    })

    // Listen for notification responses (user tapped notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response)
      // Use the comprehensive notification response handler
      NotificationService.handleNotificationResponse(response)
    })

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current)
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [notifications.enabled, isInitialized.current])

  useEffect(() => {
    // Update notification settings when preferences change
    if (isInitialized.current && notifications.enabled) {
      const updateNotificationSettings = async () => {
        try {
          // Convert old settings format to new format
          const reminderSettings = {
            enabled: notifications.enabled,
            dailyStudyTime: notifications.dailyReminder?.time || '19:00',
            streakReminders: notifications.streakReminder?.enabled || true,
            lessonReminders: true,
            practiceReminders: true,
            weeklyGoalReminders: true,
          }

          await NotificationService.updateReminderSettings(reminderSettings)
          console.log('Notification settings updated')
        } catch (error) {
          console.error('Failed to update notification settings:', error)
        }
      }

      updateNotificationSettings()
    }
  }, [notifications.enabled, notifications.dailyReminder, notifications.streakReminder, isInitialized.current])

  const scheduleDailyReminder = async () => {
    try {
      // Cancel existing daily reminder
      await Notifications.cancelScheduledNotificationAsync('daily-reminder')

      const [hours, minutes] = notifications.dailyReminder.time.split(':').map(Number)
      
      // Schedule for each enabled day
      for (const day of notifications.dailyReminder.days) {
        await Notifications.scheduleNotificationAsync({
          identifier: `daily-reminder-${day}`,
          content: {
            title: 'Time to learn Turkish! 🇹🇷',
            body: 'Keep your streak going with today\'s lesson',
            data: { screen: 'Lessons' },
          },
          trigger: {
            weekday: day + 1, // Expo uses 1-7 for Sunday-Saturday
            hour: hours,
            minute: minutes,
            repeats: true,
          },
        })
      }
    } catch (error) {
      console.error('Error scheduling daily reminder:', error)
    }
  }

  const cancelDailyReminder = async () => {
    try {
      // Cancel all daily reminder notifications
      for (let day = 0; day < 7; day++) {
        await Notifications.cancelScheduledNotificationAsync(`daily-reminder-${day}`)
      }
    } catch (error) {
      console.error('Error canceling daily reminder:', error)
    }
  }

  const scheduleStreakReminder = async () => {
    try {
      await Notifications.cancelScheduledNotificationAsync('streak-reminder')

      const [hours, minutes] = notifications.streakReminder.time.split(':').map(Number)

      await Notifications.scheduleNotificationAsync({
        identifier: 'streak-reminder',
        content: {
          title: 'Don\'t break your streak! 🔥',
          body: 'You haven\'t practiced today. Keep your learning momentum going!',
          data: { screen: 'Home' },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      })
    } catch (error) {
      console.error('Error scheduling streak reminder:', error)
    }
  }

  const cancelStreakReminder = async () => {
    try {
      await Notifications.cancelScheduledNotificationAsync('streak-reminder')
    } catch (error) {
      console.error('Error canceling streak reminder:', error)
    }
  }

  return <>{children}</>
}

async function registerForPushNotificationsAsync() {
  let token

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!')
      return
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data
    console.log('Push notification token:', token)
  } else {
    console.log('Must use physical device for Push Notifications')
  }

  return token
}

// Utility functions for sending local notifications
export const sendLocalNotification = async (title: string, body: string, data?: any) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Send immediately
  })
}

export const scheduleNotification = async (
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput,
  identifier?: string,
  data?: any
) => {
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      data,
    },
    trigger,
  })
}

export const cancelNotification = async (identifier: string) => {
  await Notifications.cancelScheduledNotificationAsync(identifier)
}
