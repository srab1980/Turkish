import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { OfflineService } from '../../services/offlineService'
import { Lesson } from './lessonsSlice'

export interface OfflineContent {
  id: string
  type: 'lesson' | 'audio' | 'image' | 'video'
  url: string
  localPath: string
  size: number // in bytes
  downloadedAt: string
  lastAccessed: string
  isEssential: boolean
}

export interface DownloadProgress {
  contentId: string
  progress: number // 0-100
  totalSize: number
  downloadedSize: number
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused'
  error?: string
}

export interface SyncQueue {
  id: string
  type: 'progress' | 'completion' | 'settings' | 'user_data'
  data: any
  timestamp: string
  retryCount: number
  maxRetries: number
}

interface OfflineState {
  isOnline: boolean
  downloadedContent: Record<string, OfflineContent>
  downloadQueue: DownloadProgress[]
  syncQueue: SyncQueue[]
  essentialContentDownloaded: boolean
  totalStorageUsed: number // in bytes
  maxStorageLimit: number // in bytes
  autoDownload: {
    enabled: boolean
    wifiOnly: boolean
    essentialOnly: boolean
  }
  isLoading: boolean
  error: string | null
  lastSyncTime: string | null
}

const initialState: OfflineState = {
  isOnline: true,
  downloadedContent: {},
  downloadQueue: [],
  syncQueue: [],
  essentialContentDownloaded: false,
  totalStorageUsed: 0,
  maxStorageLimit: 500 * 1024 * 1024, // 500MB default
  autoDownload: {
    enabled: true,
    wifiOnly: true,
    essentialOnly: false,
  },
  isLoading: false,
  error: null,
  lastSyncTime: null,
}

// Async thunks
export const downloadContent = createAsyncThunk(
  'offline/downloadContent',
  async (
    { contentId, url, type, isEssential }: { contentId: string; url: string; type: string; isEssential: boolean },
    { rejectWithValue }
  ) => {
    try {
      const result = await OfflineService.downloadContent(contentId, url, type, isEssential)
      return result
    } catch (error: any) {
      return rejectWithValue(error.message || 'Download failed')
    }
  }
)

export const downloadEssentialContent = createAsyncThunk(
  'offline/downloadEssentialContent',
  async (lessons: Lesson[], { rejectWithValue }) => {
    try {
      const results = await OfflineService.downloadEssentialContent(lessons)
      return results
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to download essential content')
    }
  }
)

export const syncOfflineData = createAsyncThunk(
  'offline/syncOfflineData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { offline: OfflineState }
      const syncQueue = state.offline.syncQueue
      const results = await OfflineService.syncQueuedData(syncQueue)
      return results
    } catch (error: any) {
      return rejectWithValue(error.message || 'Sync failed')
    }
  }
)

export const cleanupStorage = createAsyncThunk(
  'offline/cleanupStorage',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { offline: OfflineState }
      const downloadedContent = state.offline.downloadedContent
      const results = await OfflineService.cleanupOldContent(downloadedContent)
      return results
    } catch (error: any) {
      return rejectWithValue(error.message || 'Cleanup failed')
    }
  }
)

export const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload
    },
    addToDownloadQueue: (state, action: PayloadAction<Omit<DownloadProgress, 'progress' | 'downloadedSize' | 'status'>>) => {
      const newDownload: DownloadProgress = {
        ...action.payload,
        progress: 0,
        downloadedSize: 0,
        status: 'pending',
      }
      state.downloadQueue.push(newDownload)
    },
    updateDownloadProgress: (state, action: PayloadAction<{ contentId: string; progress: number; downloadedSize: number }>) => {
      const download = state.downloadQueue.find(d => d.contentId === action.payload.contentId)
      if (download) {
        download.progress = action.payload.progress
        download.downloadedSize = action.payload.downloadedSize
        download.status = action.payload.progress === 100 ? 'completed' : 'downloading'
      }
    },
    removeFromDownloadQueue: (state, action: PayloadAction<string>) => {
      state.downloadQueue = state.downloadQueue.filter(d => d.contentId !== action.payload)
    },
    pauseDownload: (state, action: PayloadAction<string>) => {
      const download = state.downloadQueue.find(d => d.contentId === action.payload)
      if (download) {
        download.status = 'paused'
      }
    },
    resumeDownload: (state, action: PayloadAction<string>) => {
      const download = state.downloadQueue.find(d => d.contentId === action.payload)
      if (download && download.status === 'paused') {
        download.status = 'pending'
      }
    },
    addToSyncQueue: (state, action: PayloadAction<Omit<SyncQueue, 'id' | 'timestamp' | 'retryCount'>>) => {
      const syncItem: SyncQueue = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        retryCount: 0,
      }
      state.syncQueue.push(syncItem)
    },
    removeFromSyncQueue: (state, action: PayloadAction<string>) => {
      state.syncQueue = state.syncQueue.filter(item => item.id !== action.payload)
    },
    incrementSyncRetry: (state, action: PayloadAction<string>) => {
      const syncItem = state.syncQueue.find(item => item.id === action.payload)
      if (syncItem) {
        syncItem.retryCount += 1
      }
    },
    updateAutoDownloadSettings: (state, action: PayloadAction<Partial<typeof initialState.autoDownload>>) => {
      state.autoDownload = { ...state.autoDownload, ...action.payload }
    },
    setStorageLimit: (state, action: PayloadAction<number>) => {
      state.maxStorageLimit = action.payload
    },
    updateStorageUsed: (state, action: PayloadAction<number>) => {
      state.totalStorageUsed = action.payload
    },
    markContentAccessed: (state, action: PayloadAction<string>) => {
      const content = state.downloadedContent[action.payload]
      if (content) {
        content.lastAccessed = new Date().toISOString()
      }
    },
    clearError: (state) => {
      state.error = null
    },
    resetOfflineData: (state) => {
      state.downloadedContent = {}
      state.downloadQueue = []
      state.syncQueue = []
      state.essentialContentDownloaded = false
      state.totalStorageUsed = 0
      state.error = null
      state.lastSyncTime = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Download Content
      .addCase(downloadContent.pending, (state, action) => {
        const download = state.downloadQueue.find(d => d.contentId === action.meta.arg.contentId)
        if (download) {
          download.status = 'downloading'
        }
      })
      .addCase(downloadContent.fulfilled, (state, action) => {
        const { contentId, localPath, size } = action.payload
        state.downloadedContent[contentId] = {
          id: contentId,
          type: action.meta.arg.type as any,
          url: action.meta.arg.url,
          localPath,
          size,
          downloadedAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          isEssential: action.meta.arg.isEssential,
        }
        state.totalStorageUsed += size
        state.downloadQueue = state.downloadQueue.filter(d => d.contentId !== contentId)
      })
      .addCase(downloadContent.rejected, (state, action) => {
        const download = state.downloadQueue.find(d => d.contentId === action.meta.arg.contentId)
        if (download) {
          download.status = 'failed'
          download.error = action.payload as string
        }
        state.error = action.payload as string
      })
      // Download Essential Content
      .addCase(downloadEssentialContent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(downloadEssentialContent.fulfilled, (state, action) => {
        state.isLoading = false
        action.payload.forEach(content => {
          state.downloadedContent[content.id] = content
          state.totalStorageUsed += content.size
        })
        state.essentialContentDownloaded = true
      })
      .addCase(downloadEssentialContent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Sync Offline Data
      .addCase(syncOfflineData.fulfilled, (state, action) => {
        // Remove successfully synced items from queue
        action.payload.successfulSyncs.forEach(syncId => {
          state.syncQueue = state.syncQueue.filter(item => item.id !== syncId)
        })
        state.lastSyncTime = new Date().toISOString()
      })
      .addCase(syncOfflineData.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Cleanup Storage
      .addCase(cleanupStorage.fulfilled, (state, action) => {
        action.payload.removedContent.forEach(contentId => {
          const content = state.downloadedContent[contentId]
          if (content) {
            state.totalStorageUsed -= content.size
            delete state.downloadedContent[contentId]
          }
        })
      })
  },
})

export const {
  setOnlineStatus,
  addToDownloadQueue,
  updateDownloadProgress,
  removeFromDownloadQueue,
  pauseDownload,
  resumeDownload,
  addToSyncQueue,
  removeFromSyncQueue,
  incrementSyncRetry,
  updateAutoDownloadSettings,
  setStorageLimit,
  updateStorageUsed,
  markContentAccessed,
  clearError,
  resetOfflineData,
} = offlineSlice.actions

export default offlineSlice.reducer
