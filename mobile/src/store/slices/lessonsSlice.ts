import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { LessonService } from '../../services/lessonService'

export interface Lesson {
  id: string
  title: string
  description: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  unit: string
  order: number
  duration: number // in minutes
  type: 'vocabulary' | 'grammar' | 'conversation' | 'reading' | 'listening'
  content: LessonContent
  exercises: Exercise[]
  isCompleted: boolean
  isLocked: boolean
  progress: number // 0-100
  lastAccessed?: string
}

export interface LessonContent {
  introduction: string
  vocabulary: VocabularyItem[]
  grammar?: GrammarRule[]
  dialogues?: Dialogue[]
  reading?: ReadingContent
  audio?: AudioContent[]
}

export interface VocabularyItem {
  id: string
  word: string
  translation: string
  pronunciation: string
  audioUrl?: string
  example: string
  exampleTranslation: string
  difficulty: number
}

export interface GrammarRule {
  id: string
  title: string
  explanation: string
  examples: string[]
  tips: string[]
}

export interface Dialogue {
  id: string
  speakers: string[]
  lines: DialogueLine[]
  audioUrl?: string
}

export interface DialogueLine {
  speaker: string
  text: string
  translation: string
  audioUrl?: string
}

export interface ReadingContent {
  title: string
  text: string
  translation?: string
  audioUrl?: string
  comprehensionQuestions: Question[]
}

export interface AudioContent {
  id: string
  title: string
  url: string
  transcript: string
  translation?: string
  duration: number
}

export interface Exercise {
  id: string
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'ordering' | 'speaking' | 'listening'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  audioUrl?: string
  points: number
}

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

interface LessonsState {
  lessons: Lesson[]
  currentLesson: Lesson | null
  isLoading: boolean
  error: string | null
  filters: {
    level: string[]
    type: string[]
    completed: boolean | null
  }
  searchQuery: string
}

const initialState: LessonsState = {
  lessons: [],
  currentLesson: null,
  isLoading: false,
  error: null,
  filters: {
    level: [],
    type: [],
    completed: null,
  },
  searchQuery: '',
}

// Async thunks
export const fetchLessons = createAsyncThunk(
  'lessons/fetchLessons',
  async (params: { level?: string; type?: string; limit?: number }, { rejectWithValue }) => {
    try {
      const lessons = await LessonService.getLessons(params)
      return lessons
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch lessons')
    }
  }
)

export const fetchLessonById = createAsyncThunk(
  'lessons/fetchLessonById',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const lesson = await LessonService.getLessonById(lessonId)
      return lesson
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch lesson')
    }
  }
)

export const completeLesson = createAsyncThunk(
  'lessons/completeLesson',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const result = await LessonService.completeLesson(lessonId)
      return { lessonId, ...result }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to complete lesson')
    }
  }
)

export const updateLessonProgress = createAsyncThunk(
  'lessons/updateProgress',
  async ({ lessonId, progress }: { lessonId: string; progress: number }, { rejectWithValue }) => {
    try {
      await LessonService.updateProgress(lessonId, progress)
      return { lessonId, progress }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update progress')
    }
  }
)

export const lessonsSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentLesson: (state, action: PayloadAction<Lesson | null>) => {
      state.currentLesson = action.payload
    },
    updateFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    markLessonAsAccessed: (state, action: PayloadAction<string>) => {
      const lesson = state.lessons.find((l) => l.id === action.payload)
      if (lesson) {
        lesson.lastAccessed = new Date().toISOString()
      }
    },
    resetLessons: (state) => {
      state.lessons = []
      state.currentLesson = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Lessons
      .addCase(fetchLessons.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.isLoading = false
        state.lessons = action.payload
        state.error = null
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Lesson by ID
      .addCase(fetchLessonById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentLesson = action.payload
        state.error = null
      })
      .addCase(fetchLessonById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Complete Lesson
      .addCase(completeLesson.fulfilled, (state, action) => {
        const lesson = state.lessons.find((l) => l.id === action.payload.lessonId)
        if (lesson) {
          lesson.isCompleted = true
          lesson.progress = 100
        }
        if (state.currentLesson?.id === action.payload.lessonId) {
          state.currentLesson.isCompleted = true
          state.currentLesson.progress = 100
        }
      })
      // Update Progress
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        const lesson = state.lessons.find((l) => l.id === action.payload.lessonId)
        if (lesson) {
          lesson.progress = action.payload.progress
        }
        if (state.currentLesson?.id === action.payload.lessonId) {
          state.currentLesson.progress = action.payload.progress
        }
      })
  },
})

export const {
  clearError,
  setCurrentLesson,
  updateFilters,
  setSearchQuery,
  markLessonAsAccessed,
  resetLessons,
} = lessonsSlice.actions

export default lessonsSlice.reducer
