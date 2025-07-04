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
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  private useMockApi = false;
  private curriculumCache: any = null;

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
      console.warn(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get curriculum data and cache it
  private async getCurriculumCache() {
    if (!this.curriculumCache) {
      try {
        this.curriculumCache = await this.makeRequest('/api/v1/curriculum/data');
      } catch (error) {
        console.warn('Failed to load curriculum data, using mock data:', error);
        this.useMockApi = true;
        throw error;
      }
    }
    return this.curriculumCache;
  }

  // Courses
  async getCourses() {
    try {
      if (!this.useMockApi) {
        const curriculum = await this.getCurriculumCache();
        return curriculum.courses;
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getCourses();
  }

  async getCourse(id: string) {
    try {
      if (!this.useMockApi) {
        const curriculum = await this.getCurriculumCache();
        return curriculum.courses.find((course: any) => course.id === id);
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
        const curriculum = await this.getCurriculumCache();
        if (courseId) {
          return curriculum.units.filter((unit: any) => unit.courseId === courseId);
        }
        return curriculum.units;
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
        const curriculum = await this.getCurriculumCache();
        if (unitId) {
          return curriculum.lessons.filter((lesson: any) => lesson.unitId === unitId);
        }
        return curriculum.lessons;
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getLessons(unitId);
  }

  async getLesson(id: string) {
    try {
      if (!this.useMockApi) {
        const curriculum = await this.getCurriculumCache();
        return curriculum.lessons.find((lesson: any) => lesson.id === id);
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getLesson(id);
  }

  async getLessonContent(id: string) {
    try {
      if (!this.useMockApi) {
        const curriculum = await this.getCurriculumCache();
        const lesson = curriculum.lessons.find((lesson: any) => lesson.id === id);
        if (lesson) {
          // Get exercises for this lesson
          const exercises = curriculum.exercises.filter((exercise: any) => exercise.lessonId === id);
          return {
            ...lesson,
            exercises
          };
        }
        return null;
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getLessonContent(id);
  }

  // Exercises
  async getExercises(lessonId?: string) {
    try {
      if (!this.useMockApi) {
        const curriculum = await this.getCurriculumCache();
        if (lessonId) {
          return curriculum.exercises.filter((exercise: any) => exercise.lessonId === lessonId);
        }
        return curriculum.exercises;
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getExercises(lessonId);
  }

  async getExercise(id: string) {
    try {
      if (!this.useMockApi) {
        const curriculum = await this.getCurriculumCache();
        return curriculum.exercises.find((exercise: any) => exercise.id === id);
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getExercise(id);
  }

  // User Progress
  async getUserProgress(userId: string) {
    try {
      if (!this.useMockApi) {
        return await this.makeRequest(`/api/v1/users/${userId}/progress`);
      }
    } catch (error) {
      // Fallback to mock
    }
    return await mockApiService.getUserProgress(userId);
  }

  // Curriculum Data (Public endpoint)
  async getCurriculumData() {
    try {
      return await this.makeRequest('/api/v1/curriculum/data');
    } catch (error) {
      console.error('Failed to fetch curriculum data:', error);
      throw error;
    }
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
