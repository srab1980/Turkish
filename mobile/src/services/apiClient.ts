import AsyncStorage from '@react-native-async-storage/async-storage'
import { store } from '../store'
import { refreshAuthToken, logoutUser } from '../store/slices/authSlice'

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api' // Development backend
  : 'https://api.turkishlearning.app/api' // Production backend

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  requiresAuth?: boolean
  timeout?: number
}

class ApiClient {
  private baseURL: string
  private defaultTimeout: number = 10000 // 10 seconds

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('auth_token')
      return token
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token')
      if (!refreshToken) {
        return false
      }

      const response = await this.request<{ token: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
        requiresAuth: false,
      })

      if (response.success && response.data) {
        await AsyncStorage.setItem('auth_token', response.data.token)
        await AsyncStorage.setItem('refresh_token', response.data.refreshToken)
        return true
      }

      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  private async handleUnauthorized(): Promise<void> {
    // Try to refresh token first
    const refreshSuccess = await this.refreshToken()
    
    if (!refreshSuccess) {
      // If refresh fails, logout user
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token'])
      store.dispatch(logoutUser())
    }
  }

  async request<T = any>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      requiresAuth = true,
      timeout = this.defaultTimeout,
    } = config

    const url = `${this.baseURL}${endpoint}`
    
    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    }

    // Add auth token if required
    if (requiresAuth) {
      const token = await this.getAuthToken()
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body)
    }

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      })

      // Make the request with timeout
      const response = await Promise.race([
        fetch(url, requestOptions),
        timeoutPromise,
      ])

      // Handle HTTP errors
      if (!response.ok) {
        if (response.status === 401 && requiresAuth) {
          await this.handleUnauthorized()
          throw new Error('Authentication failed')
        }
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      // Parse response
      const data = await response.json()
      
      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } catch (error: any) {
      console.error(`API request failed: ${method} ${url}`, error)
      
      return {
        success: false,
        error: error.message || 'Network request failed',
      }
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T = any>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  async put<T = any>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  async patch<T = any>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  async delete<T = any>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }

  // File upload method
  async uploadFile(
    endpoint: string,
    file: File | Blob,
    fieldName: string = 'file',
    additionalFields?: Record<string, string>
  ): Promise<ApiResponse> {
    const formData = new FormData()
    formData.append(fieldName, file)
    
    if (additionalFields) {
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const token = await this.getAuthToken()
    const headers: Record<string, string> = {}
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 401) {
          await this.handleUnauthorized()
          throw new Error('Authentication failed')
        }
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } catch (error: any) {
      console.error('File upload failed:', error)
      return {
        success: false,
        error: error.message || 'File upload failed',
      }
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request('/health', {
        requiresAuth: false,
        timeout: 5000,
      })
      return response.success
    } catch (error) {
      return false
    }
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL)

// Export types
export type { ApiResponse, RequestConfig }
