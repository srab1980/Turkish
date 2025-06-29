import { apiClient } from './apiClient'
import { UserProfile, UserPreferences } from '../store/slices/userSlice'

export class UserService {
  static async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/user/profile')
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch user profile')
    }
    
    return response.data
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>('/user/profile', updates)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update profile')
    }
    
    return response.data
  }

  static async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>('/user/preferences', preferences)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update preferences')
    }
    
    return response.data
  }

  static async uploadAvatar(imageFile: File | Blob): Promise<{ avatarUrl: string }> {
    const response = await apiClient.uploadFile('/user/avatar', imageFile, 'avatar')
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to upload avatar')
    }
    
    return response.data
  }

  static async syncUserData(): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>('/user/sync')
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to sync user data')
    }
    
    return response.data
  }

  static async getAchievements(): Promise<any[]> {
    const response = await apiClient.get('/user/achievements')
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch achievements')
    }
    
    return response.data || []
  }

  static async getLeaderboard(timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<any[]> {
    const response = await apiClient.get(`/user/leaderboard?timeframe=${timeframe}`)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch leaderboard')
    }
    
    return response.data || []
  }
}
