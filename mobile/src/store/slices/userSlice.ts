import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { UserService } from '../../services/userService'

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  level: 'beginner' | 'intermediate' | 'advanced'
  nativeLanguage: string
  learningGoals: string[]
  dailyGoal: number
  streak: number
  totalXP: number
  achievements: Achievement[]
  preferences: UserPreferences
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
  category: 'learning' | 'streak' | 'social' | 'special'
}

export interface UserPreferences {
  language: string
  notifications: {
    dailyReminder: boolean
    streakReminder: boolean
    achievements: boolean
    social: boolean
  }
  audio: {
    enabled: boolean
    volume: number
    autoplay: boolean
  }
  display: {
    darkMode: boolean
    fontSize: 'small' | 'medium' | 'large'
    animations: boolean
  }
  learning: {
    showTranslations: boolean
    pronunciationFeedback: boolean
    difficultyLevel: 'easy' | 'normal' | 'hard'
  }
}

interface UserState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  lastSyncTime: string | null
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
  lastSyncTime: null,
}

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await UserService.getProfile()
      return profile
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user profile')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (updates: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const updatedProfile = await UserService.updateProfile(updates)
      return updatedProfile
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile')
    }
  }
)

export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences: Partial<UserPreferences>, { rejectWithValue }) => {
    try {
      const updatedProfile = await UserService.updatePreferences(preferences)
      return updatedProfile
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update preferences')
    }
  }
)

export const syncUserData = createAsyncThunk(
  'user/syncData',
  async (_, { rejectWithValue }) => {
    try {
      const syncedData = await UserService.syncUserData()
      return syncedData
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sync user data')
    }
  }
)

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateLocalProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
      }
    },
    updateLocalPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      if (state.profile) {
        state.profile.preferences = { ...state.profile.preferences, ...action.payload }
      }
    },
    incrementStreak: (state) => {
      if (state.profile) {
        state.profile.streak += 1
      }
    },
    addXP: (state, action: PayloadAction<number>) => {
      if (state.profile) {
        state.profile.totalXP += action.payload
      }
    },
    unlockAchievement: (state, action: PayloadAction<Achievement>) => {
      if (state.profile) {
        const existingAchievement = state.profile.achievements.find(
          (achievement) => achievement.id === action.payload.id
        )
        if (!existingAchievement) {
          state.profile.achievements.push(action.payload)
        }
      }
    },
    resetProfile: (state) => {
      state.profile = null
      state.error = null
      state.lastSyncTime = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
        state.lastSyncTime = new Date().toISOString()
        state.error = null
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
        state.error = null
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Preferences
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.profile = action.payload
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Sync Data
      .addCase(syncUserData.fulfilled, (state, action) => {
        state.profile = action.payload
        state.lastSyncTime = new Date().toISOString()
      })
      .addCase(syncUserData.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  updateLocalProfile,
  updateLocalPreferences,
  incrementStreak,
  addXP,
  unlockAchievement,
  resetProfile,
} = userSlice.actions

export default userSlice.reducer
