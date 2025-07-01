// Shared types for the admin panel

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export enum ContentStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  role: UserRole;
  currentLevel: CEFRLevel;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  language: string;
  timezone: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  studyReminders: boolean;
  dailyGoalMinutes: number;
  preferredStudyTime: string;
  difficultyPreference: string;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  level: CEFRLevel;
  imageUrl?: string;
  totalLessons: number;
  totalStudents?: number;
  estimatedHours: number;
  isPublished: boolean;
  order: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  units?: Unit[];
}

export interface Unit {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  estimatedMinutes: number;
  createdAt: Date;
  updatedAt: Date;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  content: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  order: number;
  isPublished: boolean;
  estimatedMinutes: number;
  difficulty: CEFRLevel;
  objectives: string[];
  createdAt: Date;
  updatedAt: Date;
  exercises?: Exercise[];
  vocabularyItems?: VocabularyItem[];
  grammarRules?: GrammarRule[];
}

export interface Exercise {
  id: string;
  lessonId: string;
  type: string;
  title: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  order: number;
  isPublished: boolean;
  difficulty: CEFRLevel;
  points: number;
  timeLimit?: number;
  hints?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabularyItem {
  id: string;
  lessonId: string;
  turkish: string;
  english: string;
  pronunciation?: string;
  exampleSentence?: string;
  difficulty: CEFRLevel;
  frequencyScore?: number;
  audioUrl?: string;
  imageUrl?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GrammarRule {
  id: string;
  lessonId: string;
  title: string;
  explanation: string;
  examples: string[];
  difficulty: CEFRLevel;
  category: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Progress and Analytics types
export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId?: string;
  completedAt?: Date;
  score?: number;
  timeSpent: number;
  attempts: number;
  isCompleted: boolean;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseAttempt {
  id: string;
  userId: string;
  exerciseId: string;
  userAnswer: string;
  isCorrect: boolean;
  score: number;
  timeSpent: number;
  hintsUsed: number;
  completedAt: Date;
  createdAt: Date;
}

// File and Media types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  metadata?: Record<string, any>;
}

// Analytics types
export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalExercises: number;
  completedExercises: number;
  averageProgress: number;
  engagementRate: number;
  retentionRate: number;
  averageSessionTime: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  coursesCompletedToday: number;
  coursesCompletedThisWeek: number;
  coursesCompletedThisMonth: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  topCourses: Array<{
    id: string;
    title: string;
    enrollments: number;
    rating: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

export interface UserAnalytics {
  userId: string;
  totalStudyTime: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  averageScore: number;
  streakDays: number;
  lastActiveDate: Date;
  progressByLevel: Record<CEFRLevel, number>;
  weeklyActivity: number[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

// Form types
export interface CreateCourseForm {
  title: string;
  description: string;
  level: CEFRLevel;
  imageUrl?: string;
  estimatedHours?: number;
  tags?: string[];
  isPublished?: boolean;
  order?: number;
}

export interface CreateLessonForm {
  unitId: string;
  title: string;
  description: string;
  content: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  order?: number;
  isPublished?: boolean;
  estimatedMinutes?: number;
  difficulty: CEFRLevel;
  objectives: string[];
}

export interface CreateExerciseForm {
  lessonId: string;
  type: string;
  title: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  order?: number;
  isPublished?: boolean;
  difficulty: CEFRLevel;
  points?: number;
  timeLimit?: number;
  hints?: string[];
}

// Content Import types
export interface ContentImportJob {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  errors: string[];
  result?: {
    coursesCreated: number;
    lessonsCreated: number;
    exercisesCreated: number;
    vocabularyCreated: number;
  };
  createdAt: Date;
  completedAt?: Date;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

// System Configuration types
export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  isPublic: boolean;
  updatedAt: Date;
  updatedBy: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  conditions?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Query and Filter types
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface CourseFilters {
  level?: CEFRLevel;
  isPublished?: boolean;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  level?: CEFRLevel;
  registeredAfter?: Date;
  registeredBefore?: Date;
}
