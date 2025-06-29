// Shared utility functions for the Turkish Learning App

import { CEFRLevel } from '../types';

// CEFR Level utilities
export const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const getCEFRLevelIndex = (level: CEFRLevel): number => {
  return CEFR_LEVELS.indexOf(level);
};

export const getNextCEFRLevel = (currentLevel: CEFRLevel): CEFRLevel | null => {
  const currentIndex = getCEFRLevelIndex(currentLevel);
  return currentIndex < CEFR_LEVELS.length - 1 ? CEFR_LEVELS[currentIndex + 1] : null;
};

export const getPreviousCEFRLevel = (currentLevel: CEFRLevel): CEFRLevel | null => {
  const currentIndex = getCEFRLevelIndex(currentLevel);
  return currentIndex > 0 ? CEFR_LEVELS[currentIndex - 1] : null;
};

// XP and Level calculations
export const calculateLevelFromXP = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const calculateXPForLevel = (level: number): number => {
  return Math.pow(level - 1, 2) * 100;
};

export const calculateXPToNextLevel = (currentXP: number): number => {
  const currentLevel = calculateLevelFromXP(currentXP);
  const nextLevelXP = calculateXPForLevel(currentLevel + 1);
  return nextLevelXP - currentXP;
};

// Time formatting utilities
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

// String utilities
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidUsername = (username: string): boolean => {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Array utilities
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, array.length));
};

// Score calculation utilities
export const calculateExerciseScore = (
  correctAnswers: number,
  totalQuestions: number,
  timeSpent: number,
  timeLimit?: number
): number => {
  const accuracyScore = (correctAnswers / totalQuestions) * 70;
  const speedBonus = timeLimit && timeSpent < timeLimit 
    ? Math.max(0, (timeLimit - timeSpent) / timeLimit * 30)
    : 0;
  return Math.round(accuracyScore + speedBonus);
};

// Spaced repetition algorithm (SM-2)
export const calculateNextReviewInterval = (
  currentInterval: number,
  quality: number, // 0-5 scale
  easeFactor: number = 2.5
): { interval: number; easeFactor: number } => {
  let newEaseFactor = easeFactor;
  let newInterval = currentInterval;

  if (quality >= 3) {
    if (currentInterval === 0) {
      newInterval = 1;
    } else if (currentInterval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * easeFactor);
    }
    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    newInterval = 1;
  }

  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  return {
    interval: newInterval,
    easeFactor: newEaseFactor
  };
};

// Color utilities for progress visualization
export const getProgressColor = (percentage: number): string => {
  if (percentage < 25) return '#ef4444'; // red
  if (percentage < 50) return '#f97316'; // orange
  if (percentage < 75) return '#eab308'; // yellow
  return '#22c55e'; // green
};

export const getCEFRLevelColor = (level: CEFRLevel): string => {
  const colors = {
    A1: '#3b82f6', // blue
    A2: '#06b6d4', // cyan
    B1: '#10b981', // emerald
    B2: '#84cc16', // lime
    C1: '#f59e0b', // amber
    C2: '#ef4444'  // red
  };
  return colors[level];
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// URL utilities
export const buildApiUrl = (endpoint: string, baseUrl?: string): string => {
  const base = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

// Local storage utilities (client-side only)
export const setLocalStorage = (key: string, value: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  }
  return defaultValue;
};

export const removeLocalStorage = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};
