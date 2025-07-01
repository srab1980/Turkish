// Shared TypeScript type definitions for the Turkish Learning App

// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  level: CEFRLevel;
  xp: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: string;
  notifications: NotificationSettings;
  learningGoals: LearningGoals;
  theme: 'light' | 'dark' | 'auto';
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  reminders: boolean;
  achievements: boolean;
}

export interface LearningGoals {
  dailyXP: number;
  weeklyLessons: number;
  targetLevel: CEFRLevel;
}

// User Roles
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

// CEFR Levels
export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

// Course and Lesson Types
export interface Course {
  id: string;
  title: string;
  description: string;
  level: CEFRLevel;
  imageUrl?: string;
  units: Unit[];
  totalLessons: number;
  estimatedHours: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  isLocked: boolean;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  type: LessonType;
  content: LessonContent;
  exercises: Exercise[];
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  isCompleted: boolean;
}

export enum LessonType {
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  READING = 'reading',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  WRITING = 'writing',
  CULTURE = 'culture',
}

export interface LessonContent {
  text?: string;
  audio?: string;
  images?: string[];
  video?: string;
  vocabulary?: VocabularyItem[];
  grammarRules?: GrammarRule[];
}

export interface VocabularyItem {
  turkish: string;
  english: string;
  pronunciation?: string;
  audio?: string;
  example?: string;
  imageUrl?: string;
}

export interface GrammarRule {
  title: string;
  explanation: string;
  examples: GrammarExample[];
}

export interface GrammarExample {
  turkish: string;
  english: string;
  breakdown?: string;
}

// Exercise Types
export interface Exercise {
  id: string;
  lessonId: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  order: number;
  xpReward: number;
}

// Progress Tracking
export interface UserProgress {
  userId: string;
  courseId: string;
  unitId: string;
  lessonId: string;
  completedAt?: Date;
  score: number;
  timeSpent: number;
  attempts: number;
}

export interface UserStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  timeSpent: number;
  level: CEFRLevel;
  achievements: Achievement[];
}

// Gamification
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: BadgeCriteria;
}

export interface BadgeCriteria {
  type: 'streak' | 'xp' | 'lessons' | 'time' | 'level';
  target: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// AI/NLP Types
export interface ContentExtractionRequest {
  fileUrl: string;
  fileType: 'pdf' | 'epub' | 'docx';
  targetLevel: CEFRLevel;
}

export interface ContentExtractionResponse {
  extractedText: string;
  vocabulary: VocabularyItem[];
  grammarPoints: GrammarRule[];
  suggestedExercises: Exercise[];
  cefrLevel: CEFRLevel;
}

// Spaced Repetition
export interface ReviewItem {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'vocabulary' | 'grammar' | 'exercise';
  difficulty: number;
  interval: number;
  nextReview: Date;
  reviewCount: number;
}

// File Upload
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}
