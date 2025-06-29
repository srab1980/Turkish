import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ProgressService } from '../../services/progressService'

export interface LessonProgress {
  lessonId: string
  progress: number // 0-100
  completedAt?: string
  timeSpent: number // in seconds
  score: number // 0-100
  attempts: number
  exerciseResults: ExerciseResult[]
}

export interface ExerciseResult {
  exerciseId: string
  isCorrect: boolean
  timeSpent: number
  attempts: number
  score: number
}

export interface DailyProgress {
  date: string
  lessonsCompleted: number
  timeSpent: number // in minutes
  xpEarned: number
  streak: number
  exercisesCompleted: number
  accuracy: number // 0-100
}

export interface WeeklyStats {
  week: string // ISO week format
  totalTime: number
  lessonsCompleted: number
  averageAccuracy: number
  xpEarned: number
  streakDays: number
}

export interface OverallStats {
  totalLessons: number
  completedLessons: number
  totalTimeSpent: number // in minutes
  currentStreak: number
  longestStreak: number
  totalXP: number
  averageAccuracy: number
  level: number
  nextLevelXP: number
  achievements: string[]
}

interface ProgressState {
  lessonProgress: Record<string, LessonProgress>
  dailyProgress: DailyProgress[]
  weeklyStats: WeeklyStats[]
  overallStats: OverallStats | null
  currentSession: {
    startTime: string | null
    lessonId: string | null
    timeSpent: number
    exercisesCompleted: number
    score: number
  }
  isLoading: boolean
  error: string | null
  lastSyncTime: string | null
}

const initialState: ProgressState = {
  lessonProgress: {},
  dailyProgress: [],
  weeklyStats: [],
  overallStats: null,
  currentSession: {
    startTime: null,
    lessonId: null,
    timeSpent: 0,
    exercisesCompleted: 0,
    score: 0,
  },
  isLoading: false,
  error: null,
  lastSyncTime: null,
}

// Async thunks
export const fetchUserProgress = createAsyncThunk(
  'progress/fetchUserProgress',
  async (_, { rejectWithValue }) => {
    try {
      const progress = await ProgressService.getUserProgress()
      return progress
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch progress')
    }
  }
)

export const saveLessonProgress = createAsyncThunk(
  'progress/saveLessonProgress',
  async (progressData: LessonProgress, { rejectWithValue }) => {
    try {
      await ProgressService.saveLessonProgress(progressData)
      return progressData
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save progress')
    }
  }
)

export const updateDailyProgress = createAsyncThunk(
  'progress/updateDailyProgress',
  async (dailyData: Partial<DailyProgress>, { rejectWithValue }) => {
    try {
      const updatedProgress = await ProgressService.updateDailyProgress(dailyData)
      return updatedProgress
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update daily progress')
    }
  }
)

export const syncProgress = createAsyncThunk(
  'progress/syncProgress',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { progress: ProgressState }
      const localProgress = state.progress
      const syncedProgress = await ProgressService.syncProgress(localProgress)
      return syncedProgress
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sync progress')
    }
  }
)

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    startSession: (state, action: PayloadAction<string>) => {
      state.currentSession = {
        startTime: new Date().toISOString(),
        lessonId: action.payload,
        timeSpent: 0,
        exercisesCompleted: 0,
        score: 0,
      }
    },
    endSession: (state) => {
      if (state.currentSession.startTime && state.currentSession.lessonId) {
        const sessionTime = Date.now() - new Date(state.currentSession.startTime).getTime()
        state.currentSession.timeSpent = Math.floor(sessionTime / 1000)
      }
    },
    updateSessionProgress: (state, action: PayloadAction<{ exercisesCompleted?: number; score?: number }>) => {
      if (action.payload.exercisesCompleted !== undefined) {
        state.currentSession.exercisesCompleted = action.payload.exercisesCompleted
      }
      if (action.payload.score !== undefined) {
        state.currentSession.score = action.payload.score
      }
    },
    addExerciseResult: (state, action: PayloadAction<{ lessonId: string; result: ExerciseResult }>) => {
      const { lessonId, result } = action.payload
      if (!state.lessonProgress[lessonId]) {
        state.lessonProgress[lessonId] = {
          lessonId,
          progress: 0,
          timeSpent: 0,
          score: 0,
          attempts: 0,
          exerciseResults: [],
        }
      }
      state.lessonProgress[lessonId].exerciseResults.push(result)
    },
    updateLessonProgress: (state, action: PayloadAction<{ lessonId: string; progress: number }>) => {
      const { lessonId, progress } = action.payload
      if (!state.lessonProgress[lessonId]) {
        state.lessonProgress[lessonId] = {
          lessonId,
          progress: 0,
          timeSpent: 0,
          score: 0,
          attempts: 0,
          exerciseResults: [],
        }
      }
      state.lessonProgress[lessonId].progress = progress
      if (progress === 100) {
        state.lessonProgress[lessonId].completedAt = new Date().toISOString()
      }
    },
    addDailyProgress: (state, action: PayloadAction<DailyProgress>) => {
      const existingIndex = state.dailyProgress.findIndex(
        (dp) => dp.date === action.payload.date
      )
      if (existingIndex >= 0) {
        state.dailyProgress[existingIndex] = action.payload
      } else {
        state.dailyProgress.push(action.payload)
      }
    },
    resetProgress: (state) => {
      state.lessonProgress = {}
      state.dailyProgress = []
      state.weeklyStats = []
      state.overallStats = null
      state.currentSession = {
        startTime: null,
        lessonId: null,
        timeSpent: 0,
        exercisesCompleted: 0,
        score: 0,
      }
      state.error = null
      state.lastSyncTime = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Progress
      .addCase(fetchUserProgress.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.isLoading = false
        state.lessonProgress = action.payload.lessonProgress || {}
        state.dailyProgress = action.payload.dailyProgress || []
        state.weeklyStats = action.payload.weeklyStats || []
        state.overallStats = action.payload.overallStats || null
        state.lastSyncTime = new Date().toISOString()
        state.error = null
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Save Lesson Progress
      .addCase(saveLessonProgress.fulfilled, (state, action) => {
        state.lessonProgress[action.payload.lessonId] = action.payload
      })
      .addCase(saveLessonProgress.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Update Daily Progress
      .addCase(updateDailyProgress.fulfilled, (state, action) => {
        const existingIndex = state.dailyProgress.findIndex(
          (dp) => dp.date === action.payload.date
        )
        if (existingIndex >= 0) {
          state.dailyProgress[existingIndex] = action.payload
        } else {
          state.dailyProgress.push(action.payload)
        }
      })
      // Sync Progress
      .addCase(syncProgress.fulfilled, (state, action) => {
        state.lessonProgress = action.payload.lessonProgress || state.lessonProgress
        state.dailyProgress = action.payload.dailyProgress || state.dailyProgress
        state.weeklyStats = action.payload.weeklyStats || state.weeklyStats
        state.overallStats = action.payload.overallStats || state.overallStats
        state.lastSyncTime = new Date().toISOString()
      })
      .addCase(syncProgress.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  startSession,
  endSession,
  updateSessionProgress,
  addExerciseResult,
  updateLessonProgress,
  addDailyProgress,
  resetProgress,
} = progressSlice.actions

export default progressSlice.reducer
