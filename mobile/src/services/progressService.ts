import { apiClient } from './apiClient'
import { LessonProgress, DailyProgress, WeeklyStats, OverallStats } from '../store/slices/progressSlice'

interface ProgressData {
  lessonProgress: Record<string, LessonProgress>
  dailyProgress: DailyProgress[]
  weeklyStats: WeeklyStats[]
  overallStats: OverallStats
}

export class ProgressService {
  static async getUserProgress(): Promise<ProgressData> {
    const response = await apiClient.get<ProgressData>('/progress')
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch progress')
    }
    
    return response.data
  }

  static async saveLessonProgress(progressData: LessonProgress): Promise<void> {
    const response = await apiClient.post('/progress/lesson', progressData)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to save lesson progress')
    }
  }

  static async updateDailyProgress(dailyData: Partial<DailyProgress>): Promise<DailyProgress> {
    const response = await apiClient.post<DailyProgress>('/progress/daily', dailyData)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update daily progress')
    }
    
    return response.data
  }

  static async getWeeklyStats(weekStart: string): Promise<WeeklyStats> {
    const response = await apiClient.get<WeeklyStats>(`/progress/weekly?week=${weekStart}`)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch weekly stats')
    }
    
    return response.data
  }

  static async getOverallStats(): Promise<OverallStats> {
    const response = await apiClient.get<OverallStats>('/progress/overall')
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch overall stats')
    }
    
    return response.data
  }

  static async syncProgress(localProgress: any): Promise<ProgressData> {
    const response = await apiClient.post<ProgressData>('/progress/sync', localProgress)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to sync progress')
    }
    
    return response.data
  }

  static async getStreakData(): Promise<{ currentStreak: number; longestStreak: number; streakHistory: string[] }> {
    const response = await apiClient.get('/progress/streak')
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch streak data')
    }
    
    return response.data
  }

  static async getXPHistory(days: number = 30): Promise<{ date: string; xp: number }[]> {
    const response = await apiClient.get(`/progress/xp-history?days=${days}`)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch XP history')
    }
    
    return response.data || []
  }

  static async getAccuracyStats(): Promise<{ overall: number; byType: Record<string, number>; trend: number[] }> {
    const response = await apiClient.get('/progress/accuracy')
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch accuracy stats')
    }
    
    return response.data
  }

  static async getTimeSpentStats(period: 'week' | 'month' | 'year' = 'week'): Promise<{ total: number; daily: { date: string; minutes: number }[] }> {
    const response = await apiClient.get(`/progress/time-spent?period=${period}`)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch time spent stats')
    }
    
    return response.data
  }
}
