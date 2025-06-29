import * as FileSystem from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { apiClient } from './apiClient'
import { OfflineContent, SyncQueue } from '../store/slices/offlineSlice'
import { Lesson } from '../store/slices/lessonsSlice'

const OFFLINE_STORAGE_KEY = 'offline_content'
const SYNC_QUEUE_KEY = 'sync_queue'
const DOWNLOAD_QUEUE_KEY = 'download_queue'
const MAX_STORAGE_SIZE = 500 * 1024 * 1024 // 500MB
const MAX_RETRY_COUNT = 3
const CLEANUP_THRESHOLD = 0.9 // Clean up when 90% full

export interface DownloadProgress {
  contentId: string
  progress: number
  status: 'pending' | 'downloading' | 'completed' | 'failed'
  error?: string
}

export interface DownloadQueueItem {
  contentId: string
  url: string
  type: string
  isEssential: boolean
  priority: 'high' | 'medium' | 'low'
  retryCount: number
}

export interface OfflineStats {
  totalSize: number
  contentCount: number
  lastSyncTime: string
  pendingSyncItems: number
  downloadQueueSize: number
}

export class OfflineService {
  private static downloadProgressCallbacks: Map<string, (progress: DownloadProgress) => void> = new Map()

  static async downloadContent(
    contentId: string,
    url: string,
    type: string,
    isEssential: boolean,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<{ contentId: string; localPath: string; size: number }> {
    try {
      // Register progress callback
      if (onProgress) {
        this.downloadProgressCallbacks.set(contentId, onProgress)
      }

      // Update progress: starting
      this.updateDownloadProgress(contentId, 0, 'downloading')

      // Create directory for offline content if it doesn't exist
      const offlineDir = `${FileSystem.documentDirectory}offline/`
      const dirInfo = await FileSystem.getInfoAsync(offlineDir)

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(offlineDir, { intermediates: true })
      }

      // Generate local file path
      const fileExtension = this.getFileExtension(url, type)
      const localPath = `${offlineDir}${contentId}${fileExtension}`

      // Check if file already exists
      const existingFileInfo = await FileSystem.getInfoAsync(localPath)
      if (existingFileInfo.exists) {
        this.updateDownloadProgress(contentId, 100, 'completed')
        return { contentId, localPath, size: existingFileInfo.size || 0 }
      }

      // Check storage space before download
      await this.ensureStorageSpace()

      // Download the file with progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        localPath,
        {},
        (downloadProgress) => {
          const progress = (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100
          this.updateDownloadProgress(contentId, progress, 'downloading')
        }
      )

      const downloadResult = await downloadResumable.downloadAsync()

      if (!downloadResult || downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult?.status || 'unknown'}`)
      }

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(localPath)
      const size = fileInfo.size || 0

      // Store content metadata
      const content: OfflineContent = {
        id: contentId,
        type: type as any,
        url,
        localPath,
        size,
        downloadedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        isEssential,
      }

      await this.storeContentMetadata(content)

      // Update progress: completed
      this.updateDownloadProgress(contentId, 100, 'completed')

      return { contentId, localPath, size }
    } catch (error: any) {
      console.error('Download failed:', error)
      this.updateDownloadProgress(contentId, 0, 'failed', error.message)
      throw new Error(`Failed to download content: ${error.message}`)
    } finally {
      // Clean up progress callback
      this.downloadProgressCallbacks.delete(contentId)
    }
  }

  static async downloadEssentialContent(lessons: Lesson[]): Promise<OfflineContent[]> {
    const downloadedContent: OfflineContent[] = []
    
    for (const lesson of lessons) {
      try {
        // Download lesson audio files
        if (lesson.content.audio) {
          for (const audio of lesson.content.audio) {
            if (audio.url) {
              const result = await this.downloadContent(
                `audio_${audio.id}`,
                audio.url,
                'audio',
                true
              )
              downloadedContent.push({
                id: result.contentId,
                type: 'audio',
                url: audio.url,
                localPath: result.localPath,
                size: result.size,
                downloadedAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString(),
                isEssential: true,
              })
            }
          }
        }

        // Download vocabulary audio
        if (lesson.content.vocabulary) {
          for (const vocab of lesson.content.vocabulary) {
            if (vocab.audioUrl) {
              const result = await this.downloadContent(
                `vocab_${vocab.id}`,
                vocab.audioUrl,
                'audio',
                true
              )
              downloadedContent.push({
                id: result.contentId,
                type: 'audio',
                url: vocab.audioUrl,
                localPath: result.localPath,
                size: result.size,
                downloadedAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString(),
                isEssential: true,
              })
            }
          }
        }

        // Download dialogue audio
        if (lesson.content.dialogues) {
          for (const dialogue of lesson.content.dialogues) {
            if (dialogue.audioUrl) {
              const result = await this.downloadContent(
                `dialogue_${dialogue.id}`,
                dialogue.audioUrl,
                'audio',
                true
              )
              downloadedContent.push({
                id: result.contentId,
                type: 'audio',
                url: dialogue.audioUrl,
                localPath: result.localPath,
                size: result.size,
                downloadedAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString(),
                isEssential: true,
              })
            }

            // Download individual line audio
            for (const line of dialogue.lines) {
              if (line.audioUrl) {
                const result = await this.downloadContent(
                  `line_${dialogue.id}_${line.speaker}`,
                  line.audioUrl,
                  'audio',
                  true
                )
                downloadedContent.push({
                  id: result.contentId,
                  type: 'audio',
                  url: line.audioUrl,
                  localPath: result.localPath,
                  size: result.size,
                  downloadedAt: new Date().toISOString(),
                  lastAccessed: new Date().toISOString(),
                  isEssential: true,
                })
              }
            }
          }
        }
      } catch (error) {
        console.error(`Failed to download content for lesson ${lesson.id}:`, error)
      }
    }

    return downloadedContent
  }

  static async syncQueuedData(syncQueue: SyncQueue[]): Promise<{ successfulSyncs: string[]; failedSyncs: string[] }> {
    const successfulSyncs: string[] = []
    const failedSyncs: string[] = []

    for (const item of syncQueue) {
      try {
        let endpoint = ''
        let method: 'POST' | 'PUT' | 'PATCH' = 'POST'

        switch (item.type) {
          case 'progress':
            endpoint = '/progress/sync'
            method = 'POST'
            break
          case 'completion':
            endpoint = `/lessons/${item.data.lessonId}/complete`
            method = 'POST'
            break
          case 'settings':
            endpoint = '/user/preferences'
            method = 'PATCH'
            break
          case 'user_data':
            endpoint = '/user/profile'
            method = 'PATCH'
            break
          default:
            throw new Error(`Unknown sync type: ${item.type}`)
        }

        const response = await apiClient.request(endpoint, {
          method,
          body: item.data,
        })

        if (response.success) {
          successfulSyncs.push(item.id)
        } else {
          failedSyncs.push(item.id)
        }
      } catch (error) {
        console.error(`Sync failed for item ${item.id}:`, error)
        failedSyncs.push(item.id)
      }
    }

    return { successfulSyncs, failedSyncs }
  }

  static async cleanupOldContent(downloadedContent: Record<string, OfflineContent>): Promise<{ removedContent: string[]; freedSpace: number }> {
    const removedContent: string[] = []
    let freedSpace = 0

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    for (const [contentId, content] of Object.entries(downloadedContent)) {
      const lastAccessed = new Date(content.lastAccessed)
      
      // Don't remove essential content or recently accessed content
      if (content.isEssential || lastAccessed > thirtyDaysAgo) {
        continue
      }

      try {
        // Check if file exists
        const fileInfo = await FileSystem.getInfoAsync(content.localPath)
        
        if (fileInfo.exists) {
          // Delete the file
          await FileSystem.deleteAsync(content.localPath)
          freedSpace += content.size
          removedContent.push(contentId)
        }
      } catch (error) {
        console.error(`Failed to delete content ${contentId}:`, error)
      }
    }

    // Update stored metadata
    await this.removeContentMetadata(removedContent)

    return { removedContent, freedSpace }
  }

  static async getLocalFilePath(contentId: string): Promise<string | null> {
    try {
      const storedContent = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY)
      if (!storedContent) return null

      const contentMap: Record<string, OfflineContent> = JSON.parse(storedContent)
      const content = contentMap[contentId]
      
      if (!content) return null

      // Check if file still exists
      const fileInfo = await FileSystem.getInfoAsync(content.localPath)
      if (!fileInfo.exists) {
        // File was deleted, remove from metadata
        await this.removeContentMetadata([contentId])
        return null
      }

      // Update last accessed time
      content.lastAccessed = new Date().toISOString()
      await this.storeContentMetadata(content)

      return content.localPath
    } catch (error) {
      console.error('Error getting local file path:', error)
      return null
    }
  }

  private static async storeContentMetadata(content: OfflineContent): Promise<void> {
    try {
      const storedContent = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY)
      const contentMap: Record<string, OfflineContent> = storedContent ? JSON.parse(storedContent) : {}
      
      contentMap[content.id] = content
      
      await AsyncStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(contentMap))
    } catch (error) {
      console.error('Error storing content metadata:', error)
    }
  }

  private static async removeContentMetadata(contentIds: string[]): Promise<void> {
    try {
      const storedContent = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY)
      if (!storedContent) return

      const contentMap: Record<string, OfflineContent> = JSON.parse(storedContent)
      
      contentIds.forEach(id => {
        delete contentMap[id]
      })
      
      await AsyncStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(contentMap))
    } catch (error) {
      console.error('Error removing content metadata:', error)
    }
  }

  private static getFileExtension(url: string, type: string): string {
    // Try to extract extension from URL
    const urlExtension = url.split('.').pop()?.split('?')[0]
    if (urlExtension && urlExtension.length <= 4) {
      return `.${urlExtension}`
    }

    // Fallback based on type
    switch (type) {
      case 'audio':
        return '.mp3'
      case 'image':
        return '.jpg'
      case 'video':
        return '.mp4'
      default:
        return '.dat'
    }
  }

  static async getStorageInfo(): Promise<{ used: number; available: number; total: number }> {
    try {
      const offlineDir = `${FileSystem.documentDirectory}offline/`
      const dirInfo = await FileSystem.getInfoAsync(offlineDir)

      if (!dirInfo.exists) {
        return { used: 0, available: 0, total: 0 }
      }

      // Calculate used space (this is a simplified calculation)
      const storedContent = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY)
      const contentMap: Record<string, OfflineContent> = storedContent ? JSON.parse(storedContent) : {}

      const used = Object.values(contentMap).reduce((total, content) => total + content.size, 0)

      // Note: Getting actual device storage info requires native modules
      // This is a simplified implementation
      return { used, available: 1000000000, total: 1000000000 } // 1GB placeholder
    } catch (error) {
      console.error('Error getting storage info:', error)
      return { used: 0, available: 0, total: 0 }
    }
  }

  // Helper method to update download progress
  private static updateDownloadProgress(
    contentId: string,
    progress: number,
    status: DownloadProgress['status'],
    error?: string
  ): void {
    const progressData: DownloadProgress = { contentId, progress, status, error }
    const callback = this.downloadProgressCallbacks.get(contentId)
    if (callback) {
      callback(progressData)
    }
  }

  // Ensure sufficient storage space
  private static async ensureStorageSpace(): Promise<void> {
    const storageInfo = await this.getStorageInfo()
    const usageRatio = storageInfo.used / MAX_STORAGE_SIZE

    if (usageRatio > CLEANUP_THRESHOLD) {
      console.log('Storage threshold exceeded, cleaning up old content...')
      const storedContent = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY)
      const contentMap: Record<string, OfflineContent> = storedContent ? JSON.parse(storedContent) : {}
      await this.cleanupOldContent(contentMap)
    }
  }

  // Batch download with queue management
  static async batchDownload(
    items: DownloadQueueItem[],
    onProgress?: (overall: number, current: DownloadProgress) => void
  ): Promise<{ successful: string[]; failed: string[] }> {
    const successful: string[] = []
    const failed: string[] = []

    // Sort by priority
    const sortedItems = items.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    for (let i = 0; i < sortedItems.length; i++) {
      const item = sortedItems[i]

      try {
        await this.downloadContent(
          item.contentId,
          item.url,
          item.type,
          item.isEssential,
          (progress) => {
            if (onProgress) {
              const overallProgress = ((i / sortedItems.length) + (progress.progress / 100 / sortedItems.length)) * 100
              onProgress(overallProgress, progress)
            }
          }
        )
        successful.push(item.contentId)
      } catch (error) {
        console.error(`Failed to download ${item.contentId}:`, error)
        failed.push(item.contentId)
      }
    }

    return { successful, failed }
  }

  // Network-aware sync
  static async syncWhenOnline(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch()

      if (!netInfo.isConnected) {
        console.log('No network connection, skipping sync')
        return false
      }

      // Get sync queue
      const syncQueueData = await AsyncStorage.getItem(SYNC_QUEUE_KEY)
      if (!syncQueueData) {
        return true // Nothing to sync
      }

      const syncQueue: SyncQueue[] = JSON.parse(syncQueueData)
      if (syncQueue.length === 0) {
        return true
      }

      // Perform sync
      const { successfulSyncs, failedSyncs } = await this.syncQueuedData(syncQueue)

      // Remove successful syncs from queue
      const remainingQueue = syncQueue.filter(item => !successfulSyncs.includes(item.id))
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remainingQueue))

      console.log(`Sync completed: ${successfulSyncs.length} successful, ${failedSyncs.length} failed`)
      return failedSyncs.length === 0
    } catch (error) {
      console.error('Sync failed:', error)
      return false
    }
  }

  // Get offline statistics
  static async getOfflineStats(): Promise<OfflineStats> {
    try {
      const [storedContent, syncQueueData, downloadQueueData] = await Promise.all([
        AsyncStorage.getItem(OFFLINE_STORAGE_KEY),
        AsyncStorage.getItem(SYNC_QUEUE_KEY),
        AsyncStorage.getItem(DOWNLOAD_QUEUE_KEY)
      ])

      const contentMap: Record<string, OfflineContent> = storedContent ? JSON.parse(storedContent) : {}
      const syncQueue: SyncQueue[] = syncQueueData ? JSON.parse(syncQueueData) : []
      const downloadQueue: DownloadQueueItem[] = downloadQueueData ? JSON.parse(downloadQueueData) : []

      const totalSize = Object.values(contentMap).reduce((total, content) => total + content.size, 0)
      const contentCount = Object.keys(contentMap).length

      // Get last sync time from the most recent sync queue item
      const lastSyncTime = syncQueue.length > 0
        ? Math.max(...syncQueue.map(item => new Date(item.timestamp).getTime()))
        : 0

      return {
        totalSize,
        contentCount,
        lastSyncTime: lastSyncTime > 0 ? new Date(lastSyncTime).toISOString() : '',
        pendingSyncItems: syncQueue.length,
        downloadQueueSize: downloadQueue.length
      }
    } catch (error) {
      console.error('Error getting offline stats:', error)
      return {
        totalSize: 0,
        contentCount: 0,
        lastSyncTime: '',
        pendingSyncItems: 0,
        downloadQueueSize: 0
      }
    }
  }
}
