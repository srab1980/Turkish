import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface NotificationSettings {
  enabled: boolean
  dailyReminder: {
    enabled: boolean
    time: string // HH:MM format
    days: number[] // 0-6, Sunday = 0
  }
  streakReminder: {
    enabled: boolean
    time: string
  }
  achievements: boolean
  lessonUpdates: boolean
  social: boolean
  marketing: boolean
}

export interface AudioSettings {
  enabled: boolean
  volume: number // 0-1
  autoplay: boolean
  playbackSpeed: number // 0.5-2.0
  pronunciationFeedback: boolean
  backgroundMusic: boolean
  soundEffects: boolean
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto'
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  fontFamily: 'default' | 'dyslexic' | 'serif'
  animations: boolean
  reducedMotion: boolean
  highContrast: boolean
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
}

export interface LearningSettings {
  difficultyLevel: 'easy' | 'normal' | 'hard' | 'adaptive'
  showTranslations: boolean
  showTransliterations: boolean
  autoAdvance: boolean
  practiceMode: 'spaced' | 'intensive' | 'review'
  dailyGoal: number // minutes
  weeklyGoal: number // lessons
  reminderFrequency: 'never' | 'daily' | 'twice-daily' | 'custom'
  skipKnownWords: boolean
  focusWeakAreas: boolean
}

export interface PrivacySettings {
  analytics: boolean
  crashReporting: boolean
  personalizedAds: boolean
  dataSharing: boolean
  locationTracking: boolean
  voiceRecording: boolean
  profileVisibility: 'public' | 'friends' | 'private'
}

export interface AccessibilitySettings {
  screenReader: boolean
  voiceOver: boolean
  largeText: boolean
  boldText: boolean
  buttonShapes: boolean
  reduceTransparency: boolean
  increaseContrast: boolean
  differentiateWithoutColor: boolean
  assistiveTouch: boolean
}

export interface LanguageSettings {
  appLanguage: string
  learningLanguage: string
  nativeLanguage: string
  translationLanguage: string
  keyboardLayout: string
  rtlSupport: boolean
}

export interface SyncSettings {
  autoSync: boolean
  syncFrequency: 'immediate' | 'hourly' | 'daily' | 'manual'
  wifiOnly: boolean
  backgroundSync: boolean
  conflictResolution: 'server' | 'local' | 'ask'
}

interface SettingsState {
  notifications: NotificationSettings
  audio: AudioSettings
  display: DisplaySettings
  learning: LearningSettings
  privacy: PrivacySettings
  accessibility: AccessibilitySettings
  language: LanguageSettings
  sync: SyncSettings
  isLoading: boolean
  error: string | null
  lastSyncTime: string | null
}

const initialState: SettingsState = {
  notifications: {
    enabled: true,
    dailyReminder: {
      enabled: true,
      time: '19:00',
      days: [1, 2, 3, 4, 5], // Monday to Friday
    },
    streakReminder: {
      enabled: true,
      time: '20:00',
    },
    achievements: true,
    lessonUpdates: true,
    social: false,
    marketing: false,
  },
  audio: {
    enabled: true,
    volume: 0.8,
    autoplay: true,
    playbackSpeed: 1.0,
    pronunciationFeedback: true,
    backgroundMusic: false,
    soundEffects: true,
  },
  display: {
    theme: 'auto',
    fontSize: 'medium',
    fontFamily: 'default',
    animations: true,
    reducedMotion: false,
    highContrast: false,
    colorBlindMode: 'none',
  },
  learning: {
    difficultyLevel: 'adaptive',
    showTranslations: true,
    showTransliterations: true,
    autoAdvance: false,
    practiceMode: 'spaced',
    dailyGoal: 20, // minutes
    weeklyGoal: 5, // lessons
    reminderFrequency: 'daily',
    skipKnownWords: false,
    focusWeakAreas: true,
  },
  privacy: {
    analytics: true,
    crashReporting: true,
    personalizedAds: false,
    dataSharing: false,
    locationTracking: false,
    voiceRecording: true,
    profileVisibility: 'friends',
  },
  accessibility: {
    screenReader: false,
    voiceOver: false,
    largeText: false,
    boldText: false,
    buttonShapes: false,
    reduceTransparency: false,
    increaseContrast: false,
    differentiateWithoutColor: false,
    assistiveTouch: false,
  },
  language: {
    appLanguage: 'en',
    learningLanguage: 'tr',
    nativeLanguage: 'en',
    translationLanguage: 'en',
    keyboardLayout: 'qwerty',
    rtlSupport: false,
  },
  sync: {
    autoSync: true,
    syncFrequency: 'hourly',
    wifiOnly: true,
    backgroundSync: true,
    conflictResolution: 'server',
  },
  isLoading: false,
  error: null,
  lastSyncTime: null,
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.notifications = { ...state.notifications, ...action.payload }
    },
    updateAudioSettings: (state, action: PayloadAction<Partial<AudioSettings>>) => {
      state.audio = { ...state.audio, ...action.payload }
    },
    updateDisplaySettings: (state, action: PayloadAction<Partial<DisplaySettings>>) => {
      state.display = { ...state.display, ...action.payload }
    },
    updateLearningSettings: (state, action: PayloadAction<Partial<LearningSettings>>) => {
      state.learning = { ...state.learning, ...action.payload }
    },
    updatePrivacySettings: (state, action: PayloadAction<Partial<PrivacySettings>>) => {
      state.privacy = { ...state.privacy, ...action.payload }
    },
    updateAccessibilitySettings: (state, action: PayloadAction<Partial<AccessibilitySettings>>) => {
      state.accessibility = { ...state.accessibility, ...action.payload }
    },
    updateLanguageSettings: (state, action: PayloadAction<Partial<LanguageSettings>>) => {
      state.language = { ...state.language, ...action.payload }
    },
    updateSyncSettings: (state, action: PayloadAction<Partial<SyncSettings>>) => {
      state.sync = { ...state.sync, ...action.payload }
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.display.theme = action.payload
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large' | 'extra-large'>) => {
      state.display.fontSize = action.payload
    },
    setDailyGoal: (state, action: PayloadAction<number>) => {
      state.learning.dailyGoal = action.payload
    },
    toggleNotifications: (state) => {
      state.notifications.enabled = !state.notifications.enabled
    },
    toggleAudio: (state) => {
      state.audio.enabled = !state.audio.enabled
    },
    toggleAnimations: (state) => {
      state.display.animations = !state.display.animations
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.audio.volume = Math.max(0, Math.min(1, action.payload))
    },
    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.audio.playbackSpeed = Math.max(0.5, Math.min(2.0, action.payload))
    },
    resetToDefaults: (state, action: PayloadAction<keyof SettingsState | 'all'>) => {
      if (action.payload === 'all') {
        return { ...initialState, isLoading: state.isLoading, error: state.error, lastSyncTime: state.lastSyncTime }
      } else if (action.payload in initialState) {
        const key = action.payload as keyof typeof initialState
        if (key !== 'isLoading' && key !== 'error' && key !== 'lastSyncTime') {
          ;(state as any)[key] = (initialState as any)[key]
        }
      }
    },
    clearError: (state) => {
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setSyncTime: (state) => {
      state.lastSyncTime = new Date().toISOString()
    },
  },
})

export const {
  updateNotificationSettings,
  updateAudioSettings,
  updateDisplaySettings,
  updateLearningSettings,
  updatePrivacySettings,
  updateAccessibilitySettings,
  updateLanguageSettings,
  updateSyncSettings,
  setTheme,
  setFontSize,
  setDailyGoal,
  toggleNotifications,
  toggleAudio,
  toggleAnimations,
  setVolume,
  setPlaybackSpeed,
  resetToDefaults,
  clearError,
  setLoading,
  setSyncTime,
} = settingsSlice.actions

export default settingsSlice.reducer
