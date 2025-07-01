import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import {
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  Course,
  Unit,
  Lesson,
  Exercise,
  VocabularyItem,
  GrammarRule,
  User,
  UserProgress,
  AnalyticsData,
  ContentImportJob,
  FileUpload,
  SystemConfig,
  FeatureFlag,
  CreateCourseForm,
  CreateLessonForm,
  CreateExerciseForm,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private aiClient: AxiosInstance;

  constructor() {
    // Main API client
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // AI Service client
    this.aiClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000/api/v1',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    const requestInterceptor = (config: any) => {
      const token = Cookies.get('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    };

    this.client.interceptors.request.use(requestInterceptor);
    this.aiClient.interceptors.request.use(requestInterceptor);

    // Response interceptor for error handling
    const responseErrorInterceptor = (error: AxiosError) => {
      // In development mode, if backend is not available, return mock data
      if (process.env.NODE_ENV === 'development' && (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK')) {
        console.warn('Backend not available, using mock data for:', error.config?.url);
        return Promise.resolve({ data: this.getMockResponse(error.config?.url || '') });
      }

      if (error.response?.status === 401) {
        Cookies.remove('admin_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (error.response?.status >= 500) {
        toast.error('Server error occurred. Please try again later.');
      }

      return Promise.reject(error);
    };

    this.client.interceptors.response.use(
      (response) => response,
      responseErrorInterceptor
    );
    this.aiClient.interceptors.response.use(
      (response) => response,
      responseErrorInterceptor
    );
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    // For development, use mock authentication
    return this.getMockResponse('/auth/admin/login', 'POST', { email, password });
  }

  async logout(): Promise<void> {
    // For development, just remove the token
    Cookies.remove('admin_token');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    // For development, return mock user data
    return this.getMockResponse('/auth/me', 'GET');
  }

  // Users Management
  async getUsers(params?: QueryParams): Promise<ApiResponse<PaginatedResponse<User>>> {
    // In development mode, return mock data if backend is not available
    if (process.env.NODE_ENV === 'development') {
      try {
        const response = await this.client.get('/admin/users', { params });
        return response.data;
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          console.warn('Backend not available, using mock users data');
          return this.getMockResponse('/admin/users');
        }
        throw error;
      }
    }
    const response = await this.client.get('/admin/users', { params });
    return response.data;
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await this.client.get(`/admin/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.put(`/admin/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/admin/users/${id}`);
    return response.data;
  }

  async getUserProgress(userId: string): Promise<ApiResponse<UserProgress[]>> {
    const response = await this.client.get(`/admin/users/${userId}/progress`);
    return response.data;
  }

  // Courses Management
  async getCourses(params?: QueryParams): Promise<ApiResponse<PaginatedResponse<Course>>> {
    // In development mode, return mock data if backend is not available
    if (process.env.NODE_ENV === 'development') {
      try {
        const response = await this.client.get('/admin/courses', { params });
        return response.data;
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          console.warn('Backend not available, using mock courses data');
          return this.getMockResponse('/admin/courses');
        }
        throw error;
      }
    }
    const response = await this.client.get('/admin/courses', { params });
    return response.data;
  }

  async getCourse(id: string): Promise<ApiResponse<Course>> {
    const response = await this.client.get(`/admin/courses/${id}`);
    return response.data;
  }

  async createCourse(data: CreateCourseForm): Promise<ApiResponse<Course>> {
    const response = await this.client.post('/admin/courses', data);
    return response.data;
  }

  async updateCourse(id: string, data: Partial<CreateCourseForm>): Promise<ApiResponse<Course>> {
    const response = await this.client.put(`/admin/courses/${id}`, data);
    return response.data;
  }

  async deleteCourse(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/admin/courses/${id}`);
    return response.data;
  }

  async duplicateCourse(id: string): Promise<ApiResponse<Course>> {
    const response = await this.client.post(`/admin/courses/${id}/duplicate`);
    return response.data;
  }

  // Units Management
  async getUnits(courseId: string): Promise<ApiResponse<Unit[]>> {
    const response = await this.client.get(`/admin/courses/${courseId}/units`);
    return response.data;
  }

  async createUnit(courseId: string, data: Partial<Unit>): Promise<ApiResponse<Unit>> {
    const response = await this.client.post(`/admin/courses/${courseId}/units`, data);
    return response.data;
  }

  async updateUnit(id: string, data: Partial<Unit>): Promise<ApiResponse<Unit>> {
    const response = await this.client.put(`/admin/units/${id}`, data);
    return response.data;
  }

  async deleteUnit(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/admin/units/${id}`);
    return response.data;
  }

  // Lessons Management
  async getLessons(unitId: string): Promise<ApiResponse<Lesson[]>> {
    const response = await this.client.get(`/admin/units/${unitId}/lessons`);
    return response.data;
  }

  async getLesson(id: string): Promise<ApiResponse<Lesson>> {
    const response = await this.client.get(`/admin/lessons/${id}`);
    return response.data;
  }

  async createLesson(data: CreateLessonForm): Promise<ApiResponse<Lesson>> {
    const response = await this.client.post('/admin/lessons', data);
    return response.data;
  }

  async updateLesson(id: string, data: Partial<CreateLessonForm>): Promise<ApiResponse<Lesson>> {
    const response = await this.client.put(`/admin/lessons/${id}`, data);
    return response.data;
  }

  async deleteLesson(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/admin/lessons/${id}`);
    return response.data;
  }

  // Exercises Management
  async getExercises(lessonId: string): Promise<ApiResponse<Exercise[]>> {
    const response = await this.client.get(`/admin/lessons/${lessonId}/exercises`);
    return response.data;
  }

  async createExercise(data: CreateExerciseForm): Promise<ApiResponse<Exercise>> {
    const response = await this.client.post('/admin/exercises', data);
    return response.data;
  }

  async updateExercise(id: string, data: Partial<CreateExerciseForm>): Promise<ApiResponse<Exercise>> {
    const response = await this.client.put(`/admin/exercises/${id}`, data);
    return response.data;
  }

  async deleteExercise(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/admin/exercises/${id}`);
    return response.data;
  }

  // Vocabulary Management
  async getVocabulary(lessonId: string): Promise<ApiResponse<VocabularyItem[]>> {
    const response = await this.client.get(`/admin/lessons/${lessonId}/vocabulary`);
    return response.data;
  }

  async createVocabulary(data: Partial<VocabularyItem>): Promise<ApiResponse<VocabularyItem>> {
    const response = await this.client.post('/admin/vocabulary', data);
    return response.data;
  }

  async updateVocabulary(id: string, data: Partial<VocabularyItem>): Promise<ApiResponse<VocabularyItem>> {
    const response = await this.client.put(`/admin/vocabulary/${id}`, data);
    return response.data;
  }

  async deleteVocabulary(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/admin/vocabulary/${id}`);
    return response.data;
  }

  // Grammar Rules Management
  async getGrammarRules(lessonId: string): Promise<ApiResponse<GrammarRule[]>> {
    const response = await this.client.get(`/admin/lessons/${lessonId}/grammar`);
    return response.data;
  }

  async createGrammarRule(data: Partial<GrammarRule>): Promise<ApiResponse<GrammarRule>> {
    const response = await this.client.post('/admin/grammar', data);
    return response.data;
  }

  async updateGrammarRule(id: string, data: Partial<GrammarRule>): Promise<ApiResponse<GrammarRule>> {
    const response = await this.client.put(`/admin/grammar/${id}`, data);
    return response.data;
  }

  async deleteGrammarRule(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/admin/grammar/${id}`);
    return response.data;
  }

  // File Upload
  async uploadFile(file: File, type: 'image' | 'audio' | 'video' | 'document'): Promise<ApiResponse<FileUpload>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.client.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // User Management
  async getUsers(params?: QueryParams): Promise<ApiResponse<PaginatedResponse<User>>> {
    const response = await this.client.get('/admin/users', { params });
    return response.data;
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await this.client.get(`/admin/users/${id}`);
    return response.data;
  }

  async createUser(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.post('/admin/users', data);
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.put(`/admin/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/admin/users/${id}`);
    return response.data;
  }

  async getUserStats(id: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/admin/users/${id}/stats`);
    return response.data;
  }

  async getUserProgress(id: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/admin/users/${id}/progress`);
    return response.data;
  }

  async getUserActivity(id: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/admin/users/${id}/activity`);
    return response.data;
  }

  // Analytics
  async getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    try {
      const response = await this.client.get('/admin/analytics');
      return response.data;
    } catch (error) {
      // Return mock data in development mode if backend is not available
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          data: {
            totalUsers: 1250,
            activeUsers: 890,
            totalCourses: 45,
            publishedCourses: 38,
            totalLessons: 320,
            completedLessons: 2840,
            totalExercises: 1560,
            completedExercises: 8920,
            averageProgress: 68.5,
            engagementRate: 82.3,
            retentionRate: 76.8,
            averageSessionTime: 28.5,
            dailyActiveUsers: 245,
            weeklyActiveUsers: 680,
            monthlyActiveUsers: 1120,
            newUsersToday: 12,
            newUsersThisWeek: 89,
            newUsersThisMonth: 234,
            coursesCompletedToday: 8,
            coursesCompletedThisWeek: 56,
            coursesCompletedThisMonth: 189,
            revenueToday: 1250.50,
            revenueThisWeek: 8940.25,
            revenueThisMonth: 34560.75,
            topCourses: [
              { id: '1', title: 'Turkish for Beginners A1', enrollments: 450, rating: 4.8 },
              { id: '2', title: 'Turkish Grammar Essentials', enrollments: 320, rating: 4.6 },
              { id: '3', title: 'Turkish Conversation Practice', enrollments: 280, rating: 4.9 },
            ],
            recentActivity: [
              { id: '1', type: 'user_registered', description: 'New user registered', timestamp: new Date() },
              { id: '2', type: 'course_completed', description: 'Course completed by user', timestamp: new Date() },
              { id: '3', type: 'lesson_created', description: 'New lesson created', timestamp: new Date() },
            ],
          },
          message: 'Analytics data retrieved successfully (mock data)',
        };
      }
      throw error;
    }
  }

  async getUserAnalytics(userId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/admin/analytics/users/${userId}`);
    return response.data;
  }

  // Reports
  async getReports(params?: QueryParams): Promise<ApiResponse<PaginatedResponse<any>>> {
    const response = await this.client.get('/admin/reports', { params });
    return response.data;
  }

  async getReportTemplates(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get('/admin/reports/templates');
    return response.data;
  }

  async createReport(data: { templateId: string; parameters: Record<string, any> }): Promise<ApiResponse<any>> {
    const response = await this.client.post('/admin/reports', data);
    return response.data;
  }

  async deleteReport(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/admin/reports/${id}`);
    return response.data;
  }

  // AI Content Review
  async getAIGeneratedContent(params?: QueryParams): Promise<ApiResponse<PaginatedResponse<any>>> {
    const response = await this.client.get('/admin/ai-content', { params });
    return response.data;
  }

  async getAIReviewStats(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/admin/ai-content/stats');
    return response.data;
  }

  async approveAIContent(id: string, notes?: string): Promise<ApiResponse<void>> {
    const response = await this.client.post(`/admin/ai-content/${id}/approve`, { notes });
    return response.data;
  }

  async rejectAIContent(id: string, notes: string): Promise<ApiResponse<void>> {
    const response = await this.client.post(`/admin/ai-content/${id}/reject`, { notes });
    return response.data;
  }

  async requestAIContentRevision(id: string, notes: string): Promise<ApiResponse<void>> {
    const response = await this.client.post(`/admin/ai-content/${id}/revision`, { notes });
    return response.data;
  }

  // System Configuration
  async getSystemConfig(): Promise<ApiResponse<SystemConfig[]>> {
    const response = await this.client.get('/admin/config');
    return response.data;
  }

  async updateSystemConfig(key: string, value: string): Promise<ApiResponse<SystemConfig>> {
    const response = await this.client.put(`/admin/config/${key}`, { value });
    return response.data;
  }

  async createSystemConfig(data: any): Promise<ApiResponse<SystemConfig>> {
    const response = await this.client.post('/admin/config', data);
    return response.data;
  }

  async deleteSystemConfig(key: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/admin/config/${key}`);
    return response.data;
  }

  // Feature Flags
  async getFeatureFlags(): Promise<ApiResponse<FeatureFlag[]>> {
    const response = await this.client.get('/admin/feature-flags');
    return response.data;
  }

  async updateFeatureFlag(id: string, data: Partial<FeatureFlag>): Promise<ApiResponse<FeatureFlag>> {
    const response = await this.client.put(`/admin/feature-flags/${id}`, data);
    return response.data;
  }

  async createFeatureFlag(data: any): Promise<ApiResponse<FeatureFlag>> {
    const response = await this.client.post('/admin/feature-flags', data);
    return response.data;
  }

  async deleteFeatureFlag(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/admin/feature-flags/${id}`);
    return response.data;
  }

  // AI Tools
  async getImportJobs(): Promise<ApiResponse<ContentImportJob[]>> {
    // For development, return mock import jobs data
    return this.getMockResponse('/admin/ai-tools/import-jobs', 'GET');
  }

  async retryImportJob(jobId: string): Promise<ApiResponse<void>> {
    // For development, return mock retry response
    return this.getMockResponse(`/admin/ai-tools/import-jobs/${jobId}/retry`, 'POST');
  }

  async getLessonsForGeneration(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get('/admin/ai-tools/lessons');
    return response.data;
  }

  async generateExercises(options: any): Promise<ApiResponse<any[]>> {
    const response = await this.aiClient.post('/exercises/generate', options);
    return response.data;
  }

  async saveGeneratedExercises(exercises: any[]): Promise<ApiResponse<void>> {
    const response = await this.client.post('/admin/exercises/bulk', { exercises });
    return response.data;
  }

  // Content Import
  async importContent(file: File): Promise<ApiResponse<ContentImportJob>> {
    // For development, return mock import response
    return this.getMockResponse('/admin/content/import', 'POST', { filename: file.name });
  }

  async getImportJob(id: string): Promise<ApiResponse<ContentImportJob>> {
    const response = await this.client.get(`/admin/content/import/${id}`);
    return response.data;
  }

  // AI Content Generation
  async generateContent(file: File, options: any): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    const response = await this.aiClient.post('/content/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async generateExercises(lessonId: string, options: any): Promise<ApiResponse<Exercise[]>> {
    const response = await this.aiClient.post('/lessons/generate-exercises', {
      lessonId,
      ...options,
    });
    return response.data;
  }

  // System Configuration
  async getSystemConfig(): Promise<ApiResponse<SystemConfig[]>> {
    const response = await this.client.get('/admin/config');
    return response.data;
  }

  async updateSystemConfig(key: string, value: string): Promise<ApiResponse<SystemConfig>> {
    const response = await this.client.put(`/admin/config/${key}`, { value });
    return response.data;
  }

  // Feature Flags
  async getFeatureFlags(): Promise<ApiResponse<FeatureFlag[]>> {
    const response = await this.client.get('/admin/feature-flags');
    return response.data;
  }

  async updateFeatureFlag(id: string, data: Partial<FeatureFlag>): Promise<ApiResponse<FeatureFlag>> {
    const response = await this.client.put(`/admin/feature-flags/${id}`, data);
    return response.data;
  }

  // Mock data generator for development mode
  private getMockResponse(url: string, method: string = 'GET', data?: any): any {
    
    // Mock authentication
    if (url.includes('/auth/admin/login')) {
      if (data?.email === 'admin@turkishlearning.com' && data?.password === 'admin123') {
        const token = 'mock-admin-token-' + Date.now();
        Cookies.set('admin_token', token, { expires: 7 });
        return {
          success: true,
          data: {
            token,
            user: {
              id: 'admin-1',
              email: 'admin@turkishlearning.com',
              fullName: 'Admin User',
              role: 'ADMIN',
              isActive: true,
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-20'),
            }
          }
        };
      } else {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        };
      }
    }

    if (url.includes('/auth/me')) {
      return {
        success: true,
        data: {
          id: 'admin-1',
          email: 'admin@turkishlearning.com',
          fullName: 'Admin User',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-20'),
        }
      };
    }

    // Mock import jobs
    if (url.includes('/ai-tools/import-jobs')) {
      if (method === 'POST' && url.includes('/retry')) {
        return {
          success: true,
          data: null
        };
      }

      return {
        success: true,
        data: [
          {
            id: '1',
            filename: 'Istanbul_Book_A1_Chapter1.pdf',
            status: 'completed',
            progress: 100,
            result: {
              coursesCreated: 1,
              lessonsCreated: 5,
              exercisesCreated: 12,
              vocabularyCreated: 45
            },
            errors: [],
            createdAt: new Date('2024-01-20T10:30:00Z'),
            completedAt: new Date('2024-01-20T10:35:00Z')
          },
          {
            id: '2',
            filename: 'Turkish_Grammar_Basics.pdf',
            status: 'processing',
            progress: 65,
            result: null,
            errors: [],
            createdAt: new Date('2024-01-20T11:00:00Z'),
            completedAt: null
          },
          {
            id: '3',
            filename: 'Vocabulary_List_Advanced.pdf',
            status: 'failed',
            progress: 0,
            result: null,
            error: 'File format not supported',
            errors: ['File format not supported', 'Unable to extract text from PDF'],
            createdAt: new Date('2024-01-20T09:15:00Z'),
            completedAt: null
          }
        ]
      };
    }

    // Mock content import
    if (url.includes('/content/import')) {
      return {
        success: true,
        data: {
          id: 'import-' + Date.now(),
          filename: data?.filename || 'uploaded-file.pdf',
          status: 'processing',
          progress: 0,
          result: null,
          errors: [],
          createdAt: new Date(),
          completedAt: null
        }
      };
    }

    // Mock users data
    if (url.includes('/users')) {
      return {
        success: true,
        data: {
          items: [
            {
              id: '1',
              email: 'student1@example.com',
              fullName: 'Ahmet Yılmaz',
              role: 'STUDENT',
              isActive: true,
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-20'),
              lastLoginAt: new Date('2024-01-20'),
              profile: {
                nativeLanguage: 'English',
                proficiencyLevel: 'BEGINNER',
                learningGoals: ['Daily conversation', 'Travel'],
              }
            },
            {
              id: '2',
              email: 'student2@example.com',
              fullName: 'Sarah Johnson',
              role: 'STUDENT',
              isActive: true,
              createdAt: new Date('2024-01-10'),
              updatedAt: new Date('2024-01-18'),
              lastLoginAt: new Date('2024-01-18'),
              profile: {
                nativeLanguage: 'English',
                proficiencyLevel: 'INTERMEDIATE',
                learningGoals: ['Business Turkish', 'Grammar'],
              }
            },
            {
              id: '3',
              email: 'teacher@example.com',
              fullName: 'Fatma Özkan',
              role: 'TEACHER',
              isActive: true,
              createdAt: new Date('2024-01-05'),
              updatedAt: new Date('2024-01-19'),
              lastLoginAt: new Date('2024-01-19'),
            }
          ],
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };
    }

    // Mock courses data
    if (url.includes('/courses')) {
      return {
        success: true,
        data: {
          items: [
            {
              id: '1',
              title: 'Turkish for Beginners',
              description: 'Learn basic Turkish vocabulary and grammar',
              level: 'A1',
              isPublished: true,
              estimatedHours: 20,
              order: 1,
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-15'),
              units: [],
              totalLessons: 12,
              totalStudents: 45
            },
            {
              id: '2',
              title: 'Intermediate Turkish Conversation',
              description: 'Practice speaking and listening skills',
              level: 'B1',
              isPublished: true,
              estimatedHours: 25,
              order: 2,
              createdAt: new Date('2024-01-05'),
              updatedAt: new Date('2024-01-18'),
              units: [],
              totalLessons: 8,
              totalStudents: 23
            },
            {
              id: '3',
              title: 'Advanced Turkish Grammar',
              description: 'Master complex grammar structures',
              level: 'C1',
              isPublished: false,
              estimatedHours: 30,
              order: 3,
              createdAt: new Date('2024-01-10'),
              updatedAt: new Date('2024-01-20'),
              units: [],
              totalLessons: 15,
              totalStudents: 12
            }
          ],
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };
    }

    // Mock import jobs data
    if (url.includes('/ai-tools/import-jobs')) {
      return {
        success: true,
        data: [
          {
            id: '1',
            filename: 'Istanbul_Book_A1_Chapter1.pdf',
            status: 'completed',
            progress: 100,
            totalItems: 50,
            processedItems: 50,
            errors: [],
            result: {
              coursesCreated: 1,
              lessonsCreated: 5,
              exercisesCreated: 12,
              vocabularyCreated: 45
            },
            createdAt: new Date('2024-01-20T10:30:00Z'),
            completedAt: new Date('2024-01-20T10:35:00Z')
          },
          {
            id: '2',
            filename: 'Istanbul_Book_A1_Chapter2.pdf',
            status: 'processing',
            progress: 65,
            totalItems: 40,
            processedItems: 26,
            errors: [],
            result: null,
            createdAt: new Date('2024-01-20T11:00:00Z'),
            completedAt: null
          },
          {
            id: '3',
            filename: 'Istanbul_Book_A2_Chapter1.pdf',
            status: 'failed',
            progress: 0,
            totalItems: 0,
            processedItems: 0,
            errors: ['PDF format not supported', 'File corrupted'],
            result: null,
            createdAt: new Date('2024-01-20T09:15:00Z'),
            completedAt: null
          }
        ]
      };
    }

    // Mock content import
    if (url.includes('/content/import') && method === 'POST') {
      return {
        success: true,
        data: {
          id: Date.now().toString(),
          filename: 'uploaded_file.pdf',
          status: 'pending',
          progress: 0,
          totalItems: 0,
          processedItems: 0,
          errors: [],
          result: null,
          createdAt: new Date(),
          completedAt: null
        }
      };
    }

    // Mock analytics data
    if (url.includes('/analytics')) {
      return {
        success: true,
        data: {
          totalUsers: 1250,
          activeUsers: 890,
          totalCourses: 45,
          completionRate: 68,
          userGrowth: 12,
          activeUserGrowth: 8,
          courseGrowth: 3,
          completionRateChange: 5,
          chartData: [
            { date: '2024-01-01', users: 1100, courses: 42, engagement: 65 },
            { date: '2024-01-08', users: 1150, courses: 43, engagement: 67 },
            { date: '2024-01-15', users: 1200, courses: 44, engagement: 66 },
            { date: '2024-01-22', users: 1250, courses: 45, engagement: 68 },
          ],
          levelDistribution: {
            beginner: 45,
            intermediate: 35,
            advanced: 20
          },
          recentActivity: [
            {
              description: 'New user registered: Sarah Johnson',
              timestamp: new Date('2024-01-20T10:30:00Z')
            },
            {
              description: 'Course completed: Turkish for Beginners',
              timestamp: new Date('2024-01-20T09:15:00Z')
            }
          ]
        }
      };
    }

    // Default mock response
    return {
      success: true,
      data: {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    };
  }
}

export const apiClient = new ApiClient();
export default apiClient;
