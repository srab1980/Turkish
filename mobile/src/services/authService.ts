import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiClient } from './apiClient'
import { User } from '../store/slices/authSlice'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  name: string
  nativeLanguage?: string
  learningGoals?: string[]
}

interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

interface ForgotPasswordData {
  email: string
}

interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials, {
      requiresAuth: false,
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Login failed')
    }

    // Store tokens in AsyncStorage
    await AsyncStorage.multiSet([
      ['auth_token', response.data.token],
      ['refresh_token', response.data.refreshToken],
      ['user_data', JSON.stringify(response.data.user)],
    ])

    return response.data
  }

  static async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData, {
      requiresAuth: false,
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Registration failed')
    }

    // Store tokens in AsyncStorage
    await AsyncStorage.multiSet([
      ['auth_token', response.data.token],
      ['refresh_token', response.data.refreshToken],
      ['user_data', JSON.stringify(response.data.user)],
    ])

    return response.data
  }

  static async logout(token: string): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server
      await apiClient.post('/auth/logout', { token })
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      // Always clear local storage
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
        'user_progress',
        'offline_content',
      ])
    }
  }

  static async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await apiClient.post<{ token: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
      { requiresAuth: false }
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Token refresh failed')
    }

    // Update stored tokens
    await AsyncStorage.multiSet([
      ['auth_token', response.data.token],
      ['refresh_token', response.data.refreshToken],
    ])

    return response.data
  }

  static async forgotPassword(data: ForgotPasswordData): Promise<void> {
    const response = await apiClient.post('/auth/forgot-password', data, {
      requiresAuth: false,
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to send reset email')
    }
  }

  static async resetPassword(data: ResetPasswordData): Promise<void> {
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    const response = await apiClient.post('/auth/reset-password', {
      token: data.token,
      password: data.password,
    }, {
      requiresAuth: false,
    })

    if (!response.success) {
      throw new Error(response.error || 'Password reset failed')
    }
  }

  static async verifyEmail(token: string): Promise<void> {
    const response = await apiClient.post('/auth/verify-email', { token }, {
      requiresAuth: false,
    })

    if (!response.success) {
      throw new Error(response.error || 'Email verification failed')
    }
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    const response = await apiClient.post('/auth/resend-verification', { email }, {
      requiresAuth: false,
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to resend verification email')
    }
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })

    if (!response.success) {
      throw new Error(response.error || 'Password change failed')
    }
  }

  static async deleteAccount(password: string): Promise<void> {
    const response = await apiClient.delete('/auth/account', {
      body: { password },
    })

    if (!response.success) {
      throw new Error(response.error || 'Account deletion failed')
    }

    // Clear all local data
    await AsyncStorage.clear()
  }

  // Social authentication methods
  static async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/google', { idToken }, {
      requiresAuth: false,
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Google login failed')
    }

    // Store tokens in AsyncStorage
    await AsyncStorage.multiSet([
      ['auth_token', response.data.token],
      ['refresh_token', response.data.refreshToken],
      ['user_data', JSON.stringify(response.data.user)],
    ])

    return response.data
  }

  static async loginWithApple(identityToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/apple', { identityToken }, {
      requiresAuth: false,
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Apple login failed')
    }

    // Store tokens in AsyncStorage
    await AsyncStorage.multiSet([
      ['auth_token', response.data.token],
      ['refresh_token', response.data.refreshToken],
      ['user_data', JSON.stringify(response.data.user)],
    ])

    return response.data
  }

  // Utility methods
  static async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error getting stored user:', error)
      return null
    }
  }

  static async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token')
    } catch (error) {
      console.error('Error getting stored token:', error)
      return null
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token')
      const user = await AsyncStorage.getItem('user_data')
      return !!(token && user)
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  }

  static async validateToken(): Promise<boolean> {
    try {
      const response = await apiClient.get('/auth/validate')
      return response.success
    } catch (error) {
      console.error('Token validation failed:', error)
      return false
    }
  }
}
