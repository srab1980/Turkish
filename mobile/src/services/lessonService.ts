import { apiClient } from './apiClient'
import { Lesson } from '../store/slices/lessonsSlice'

interface LessonFilters {
  level?: string
  type?: string
  unit?: string
  completed?: boolean
  limit?: number
  offset?: number
}

export class LessonService {
  static async getLessons(filters: LessonFilters = {}): Promise<Lesson[]> {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })
    
    const response = await apiClient.get<Lesson[]>(`/lessons?${queryParams.toString()}`)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch lessons')
    }
    
    return response.data || []
  }

  static async getLessonById(lessonId: string): Promise<Lesson> {
    const response = await apiClient.get<Lesson>(`/lessons/${lessonId}`)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch lesson')
    }
    
    return response.data
  }

  static async completeLesson(lessonId: string): Promise<{ xpEarned: number; achievements: any[] }> {
    const response = await apiClient.post(`/lessons/${lessonId}/complete`)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to complete lesson')
    }
    
    return response.data || { xpEarned: 0, achievements: [] }
  }

  static async updateProgress(lessonId: string, progress: number): Promise<void> {
    const response = await apiClient.patch(`/lessons/${lessonId}/progress`, { progress })
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update progress')
    }
  }

  static async submitExerciseAnswer(
    lessonId: string, 
    exerciseId: string, 
    answer: string | string[], 
    timeSpent: number
  ): Promise<{ isCorrect: boolean; explanation?: string; score: number }> {
    const response = await apiClient.post(`/lessons/${lessonId}/exercises/${exerciseId}/submit`, {
      answer,
      timeSpent,
    })
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to submit answer')
    }
    
    return response.data
  }

  static async getRecommendedLessons(limit: number = 5): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>(`/lessons/recommended?limit=${limit}`)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch recommended lessons')
    }
    
    return response.data || []
  }

  static async searchLessons(query: string, filters: LessonFilters = {}): Promise<Lesson[]> {
    const queryParams = new URLSearchParams({ q: query })
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })
    
    const response = await apiClient.get<Lesson[]>(`/lessons/search?${queryParams.toString()}`)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to search lessons')
    }
    
    return response.data || []
  }

  static async getLessonUnits(): Promise<{ id: string; name: string; description: string; lessonCount: number }[]> {
    const response = await apiClient.get('/lessons/units')
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch lesson units')
    }
    
    return response.data || []
  }

  static async bookmarkLesson(lessonId: string): Promise<void> {
    const response = await apiClient.post(`/lessons/${lessonId}/bookmark`)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to bookmark lesson')
    }
  }

  static async unbookmarkLesson(lessonId: string): Promise<void> {
    const response = await apiClient.delete(`/lessons/${lessonId}/bookmark`)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove bookmark')
    }
  }

  static async getBookmarkedLessons(): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>('/lessons/bookmarked')
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch bookmarked lessons')
    }
    
    return response.data || []
  }
}
