// API Service for Frontend
// Handles all API communication with fallback to mock data

import { mockApiService } from './mock-api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  private useMockApi = false;

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }

      return result.data;
    } catch (error) {
      console.warn(`API request failed for ${endpoint}, using mock data:`, error);
      this.useMockApi = true;
      throw error;
    }
  }

  // Courses
  async getCourses() {
    try {
      if (!this.useMockApi) {
        return await this.makeRequest('/api/courses');
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getCourses();
  }

  async getCourse(id: string) {
    try {
      if (!this.useMockApi) {
        return await this.makeRequest(`/api/courses/${id}`);
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getCourse(id);
  }

  // Units
  async getUnits(courseId?: string) {
    try {
      if (!this.useMockApi) {
        const endpoint = courseId ? `/api/courses/${courseId}/units` : '/api/units';
        return await this.makeRequest(endpoint);
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getUnits(courseId);
  }

  // Lessons
  async getLessons(unitId?: string) {
    try {
      if (!this.useMockApi) {
        const endpoint = unitId ? `/api/units/${unitId}/lessons` : '/api/lessons';
        return await this.makeRequest(endpoint);
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getLessons(unitId);
  }

  async getLesson(id: string) {
    try {
      if (!this.useMockApi) {
        return await this.makeRequest(`/api/lessons/${id}`);
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getLesson(id);
  }

  async getLessonContent(id: string) {
    try {
      if (!this.useMockApi) {
        return await this.makeRequest(`/api/lessons/${id}/content`);
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getLessonContent(id);
  }

  // User Progress
  async getUserProgress(userId: string) {
    try {
      if (!this.useMockApi) {
        return await this.makeRequest(`/api/users/${userId}/progress`);
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getUserProgress(userId);
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Check admin panel sync status
  async getAdminSyncStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/curriculum/sync-status`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.warn('Could not check admin sync status:', error);
    }
    return {
      lastSync: null,
      isConnected: false,
      dataSource: 'mock'
    };
  }

  // Force mock mode (for testing)
  setMockMode(enabled: boolean) {
    this.useMockApi = enabled;
  }

  isMockMode() {
    return this.useMockApi;
  }
}

export const apiService = new ApiService();
export default apiService;
