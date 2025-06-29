import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-netinfo/netinfo'
import { apiClient } from './apiClient'
import { OfflineService } from './offlineService'
import { NotificationService } from './notificationService'

// Background task identifiers
const BACKGROUND_SYNC_TASK = 'background-sync'
const PROGRESS_SYNC_TASK = 'progress-sync'
const CONTENT_UPDATE_TASK = 'content-update'

export interface BackgroundSyncResult {
  success: boolean
  timestamp: number
  syncedItems: number
  errors: string[]
}

export interface ProgressSyncData {
  lessonProgress: any[]
  streakData: any
  achievements: any[]
  lastSyncTimestamp: number
}

export class BackgroundTaskService {
  private static isInitialized = false
  private static syncInProgress = false

  // Initialize background tasks
  static async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return

      // Register background tasks
      await this.registerBackgroundTasks()

      // Register background fetch
      await this.registerBackgroundFetch()

      this.isInitialized = true
      console.log('Background task service initialized')
    } catch (error) {
      console.error('Failed to initialize background task service:', error)
      throw error
    }
  }

  // Register background tasks with TaskManager
  private static async registerBackgroundTasks(): Promise<void> {
    try {
      // Background sync task
      TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
        try {
          console.log('Running background sync task')
          const result = await this.performBackgroundSync()
          
          return result.success 
            ? BackgroundFetch.BackgroundFetchResult.NewData
            : BackgroundFetch.BackgroundFetchResult.Failed
        } catch (error) {
          console.error('Background sync task failed:', error)
          return BackgroundFetch.BackgroundFetchResult.Failed
        }
      })

      // Progress sync task
      TaskManager.defineTask(PROGRESS_SYNC_TASK, async () => {
        try {
          console.log('Running progress sync task')
          const result = await this.syncUserProgress()
          
          return result.success
            ? BackgroundFetch.BackgroundFetchResult.NewData
            : BackgroundFetch.BackgroundFetchResult.Failed
        } catch (error) {
          console.error('Progress sync task failed:', error)
          return BackgroundFetch.BackgroundFetchResult.Failed
        }
      })

      // Content update task
      TaskManager.defineTask(CONTENT_UPDATE_TASK, async () => {
        try {
          console.log('Running content update task')
          const result = await this.updateContent()
          
          return result.success
            ? BackgroundFetch.BackgroundFetchResult.NewData
            : BackgroundFetch.BackgroundFetchResult.NoData
        } catch (error) {
          console.error('Content update task failed:', error)
          return BackgroundFetch.BackgroundFetchResult.Failed
        }
      })

      console.log('Background tasks registered')
    } catch (error) {
      console.error('Failed to register background tasks:', error)
      throw error
    }
  }

  // Register background fetch
  private static async registerBackgroundFetch(): Promise<void> {
    try {
      const status = await BackgroundFetch.getStatusAsync()
      
      if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
          minimumInterval: 15 * 60, // 15 minutes
          stopOnTerminate: false,
          startOnBoot: true,
        })

        await BackgroundFetch.registerTaskAsync(PROGRESS_SYNC_TASK, {
          minimumInterval: 30 * 60, // 30 minutes
          stopOnTerminate: false,
          startOnBoot: true,
        })

        await BackgroundFetch.registerTaskAsync(CONTENT_UPDATE_TASK, {
          minimumInterval: 60 * 60, // 1 hour
          stopOnTerminate: false,
          startOnBoot: true,
        })

        console.log('Background fetch registered')
      } else {
        console.warn('Background fetch not available:', status)
      }
    } catch (error) {
      console.error('Failed to register background fetch:', error)
      throw error
    }
  }

  // Perform comprehensive background sync
  private static async performBackgroundSync(): Promise<BackgroundSyncResult> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping')
      return {
        success: false,
        timestamp: Date.now(),
        syncedItems: 0,
        errors: ['Sync already in progress'],
      }
    }

    this.syncInProgress = true
    const errors: string[] = []
    let syncedItems = 0

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch()
      if (!netInfo.isConnected) {
        throw new Error('No network connection')
      }

      // Sync user progress
      try {
        const progressResult = await this.syncUserProgress()
        if (progressResult.success) {
          syncedItems += progressResult.syncedItems || 0
        } else {
          errors.push('Failed to sync user progress')
        }
      } catch (error) {
        errors.push(`Progress sync error: ${error}`)
      }

      // Sync offline content
      try {
        const offlineResult = await this.syncOfflineContent()
        if (offlineResult.success) {
          syncedItems += offlineResult.syncedItems || 0
        } else {
          errors.push('Failed to sync offline content')
        }
      } catch (error) {
        errors.push(`Offline sync error: ${error}`)
      }

      // Update streak data
      try {
        await this.updateStreakData()
        syncedItems += 1
      } catch (error) {
        errors.push(`Streak update error: ${error}`)
      }

      // Check for new achievements
      try {
        const achievementCount = await this.checkAchievements()
        syncedItems += achievementCount
      } catch (error) {
        errors.push(`Achievement check error: ${error}`)
      }

      const result: BackgroundSyncResult = {
        success: errors.length === 0,
        timestamp: Date.now(),
        syncedItems,
        errors,
      }

      // Store sync result
      await AsyncStorage.setItem('last_background_sync', JSON.stringify(result))

      console.log('Background sync completed:', result)
      return result

    } catch (error) {
      const result: BackgroundSyncResult = {
        success: false,
        timestamp: Date.now(),
        syncedItems,
        errors: [...errors, `Sync error: ${error}`],
      }

      console.error('Background sync failed:', result)
      return result

    } finally {
      this.syncInProgress = false
    }
  }

  // Sync user progress to backend
  private static async syncUserProgress(): Promise<BackgroundSyncResult> {
    try {
      // Get pending progress data
      const pendingProgress = await AsyncStorage.getItem('pending_progress_sync')
      if (!pendingProgress) {
        return {
          success: true,
          timestamp: Date.now(),
          syncedItems: 0,
          errors: [],
        }
      }

      const progressData: ProgressSyncData = JSON.parse(pendingProgress)

      // Sync to backend
      const response = await apiClient.request('/user/sync-progress', {
        method: 'POST',
        body: progressData,
      })

      if (response.success) {
        // Clear pending data
        await AsyncStorage.removeItem('pending_progress_sync')
        
        // Update last sync timestamp
        await AsyncStorage.setItem('last_progress_sync', Date.now().toString())

        return {
          success: true,
          timestamp: Date.now(),
          syncedItems: progressData.lessonProgress.length + progressData.achievements.length,
          errors: [],
        }
      } else {
        throw new Error('Backend sync failed')
      }

    } catch (error) {
      console.error('Progress sync failed:', error)
      return {
        success: false,
        timestamp: Date.now(),
        syncedItems: 0,
        errors: [`Progress sync error: ${error}`],
      }
    }
  }

  // Sync offline content
  private static async syncOfflineContent(): Promise<BackgroundSyncResult> {
    try {
      const syncResult = await OfflineService.syncWithServer()
      
      return {
        success: syncResult.success,
        timestamp: Date.now(),
        syncedItems: syncResult.syncedItems || 0,
        errors: syncResult.errors || [],
      }
    } catch (error) {
      console.error('Offline content sync failed:', error)
      return {
        success: false,
        timestamp: Date.now(),
        syncedItems: 0,
        errors: [`Offline sync error: ${error}`],
      }
    }
  }

  // Update content from server
  private static async updateContent(): Promise<BackgroundSyncResult> {
    try {
      // Check for content updates
      const lastUpdate = await AsyncStorage.getItem('last_content_update')
      const lastUpdateTime = lastUpdate ? parseInt(lastUpdate) : 0

      const response = await apiClient.request('/content/check-updates', {
        method: 'POST',
        body: { lastUpdate: lastUpdateTime },
      })

      if (response.hasUpdates) {
        // Download updated content
        const updateResult = await OfflineService.downloadUpdatedContent(response.updates)
        
        if (updateResult.success) {
          await AsyncStorage.setItem('last_content_update', Date.now().toString())
          
          // Schedule notification about new content
          await NotificationService.scheduleNotification({
            id: 'content_update',
            title: '📚 New Content Available!',
            body: `${response.updates.length} new lessons and activities are ready.`,
            trigger: { seconds: 5 },
            data: { type: 'content_update' },
          })
        }

        return {
          success: updateResult.success,
          timestamp: Date.now(),
          syncedItems: response.updates.length,
          errors: updateResult.errors || [],
        }
      }

      return {
        success: true,
        timestamp: Date.now(),
        syncedItems: 0,
        errors: [],
      }

    } catch (error) {
      console.error('Content update failed:', error)
      return {
        success: false,
        timestamp: Date.now(),
        syncedItems: 0,
        errors: [`Content update error: ${error}`],
      }
    }
  }

  // Update streak data
  private static async updateStreakData(): Promise<void> {
    try {
      const response = await apiClient.request('/user/streak-status')
      
      if (response.streak) {
        await AsyncStorage.setItem('user_streak', JSON.stringify(response.streak))
        
        // Schedule streak reminder if needed
        if (response.streak.needsReminder) {
          await NotificationService.scheduleStreakReminder(response.streak.currentStreak)
        }
      }
    } catch (error) {
      console.error('Failed to update streak data:', error)
      throw error
    }
  }

  // Check for new achievements
  private static async checkAchievements(): Promise<number> {
    try {
      const response = await apiClient.request('/user/check-achievements')
      
      if (response.newAchievements && response.newAchievements.length > 0) {
        // Store new achievements
        const existingAchievements = await AsyncStorage.getItem('user_achievements')
        const achievements = existingAchievements ? JSON.parse(existingAchievements) : []
        
        const updatedAchievements = [...achievements, ...response.newAchievements]
        await AsyncStorage.setItem('user_achievements', JSON.stringify(updatedAchievements))
        
        // Schedule achievement notification
        for (const achievement of response.newAchievements) {
          await NotificationService.scheduleNotification({
            id: `achievement_${achievement.id}`,
            title: '🏆 Achievement Unlocked!',
            body: `You earned "${achievement.title}" - ${achievement.description}`,
            trigger: { seconds: 2 },
            data: { type: 'achievement', achievementId: achievement.id },
          })
        }
        
        return response.newAchievements.length
      }
      
      return 0
    } catch (error) {
      console.error('Failed to check achievements:', error)
      throw error
    }
  }

  // Queue progress for sync
  static async queueProgressSync(progressData: Partial<ProgressSyncData>): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem('pending_progress_sync')
      const currentData: ProgressSyncData = existing ? JSON.parse(existing) : {
        lessonProgress: [],
        streakData: null,
        achievements: [],
        lastSyncTimestamp: 0,
      }

      // Merge new data
      if (progressData.lessonProgress) {
        currentData.lessonProgress.push(...progressData.lessonProgress)
      }
      if (progressData.streakData) {
        currentData.streakData = progressData.streakData
      }
      if (progressData.achievements) {
        currentData.achievements.push(...progressData.achievements)
      }
      currentData.lastSyncTimestamp = Date.now()

      await AsyncStorage.setItem('pending_progress_sync', JSON.stringify(currentData))
      console.log('Progress queued for sync')
    } catch (error) {
      console.error('Failed to queue progress sync:', error)
    }
  }

  // Force immediate sync
  static async forceSyncNow(): Promise<BackgroundSyncResult> {
    console.log('Forcing immediate sync')
    return await this.performBackgroundSync()
  }

  // Get last sync status
  static async getLastSyncStatus(): Promise<BackgroundSyncResult | null> {
    try {
      const stored = await AsyncStorage.getItem('last_background_sync')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Failed to get last sync status:', error)
      return null
    }
  }

  // Unregister background tasks
  static async unregister(): Promise<void> {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK)
      await BackgroundFetch.unregisterTaskAsync(PROGRESS_SYNC_TASK)
      await BackgroundFetch.unregisterTaskAsync(CONTENT_UPDATE_TASK)
      
      console.log('Background tasks unregistered')
    } catch (error) {
      console.error('Failed to unregister background tasks:', error)
    }
  }
}
