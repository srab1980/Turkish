"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { userProgressService, type UserProgress } from '@/lib/user-progress-service'

interface UserProgressContextType {
  userProgress: UserProgress | null
  loading: boolean
  refreshProgress: () => void
  addXP: (amount: number) => void
  completeLesson: (lessonId: string, xpEarned: number, timeSpent: number) => void
  recordActivity: (xpEarned: number, lessonsCompleted: number, timeSpent: number, exercisesCompleted: number) => void
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined)

interface UserProgressProviderProps {
  children: ReactNode
}

export function UserProgressProvider({ children }: UserProgressProviderProps) {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProgress = () => {
    try {
      const progress = userProgressService.getUserProgress()
      setUserProgress(progress)
    } catch (error) {
      console.error('Failed to load user progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshProgress = () => {
    loadProgress()
  }

  const addXP = (amount: number) => {
    try {
      const updatedProgress = userProgressService.addXP(amount)
      setUserProgress(updatedProgress)
      
      // Record daily activity
      userProgressService.recordDailyActivity(amount, 0, 0, 1)
    } catch (error) {
      console.error('Failed to add XP:', error)
    }
  }

  const completeLesson = (lessonId: string, xpEarned: number, timeSpent: number) => {
    try {
      const updatedProgress = userProgressService.completeLesson(lessonId, xpEarned, timeSpent)
      setUserProgress(updatedProgress)
      
      // Record daily activity
      userProgressService.recordDailyActivity(xpEarned, 1, timeSpent, 0)
    } catch (error) {
      console.error('Failed to complete lesson:', error)
    }
  }

  const recordActivity = (xpEarned: number, lessonsCompleted: number, timeSpent: number, exercisesCompleted: number) => {
    try {
      userProgressService.recordDailyActivity(xpEarned, lessonsCompleted, timeSpent, exercisesCompleted)
      
      if (xpEarned > 0) {
        const updatedProgress = userProgressService.addXP(xpEarned)
        setUserProgress(updatedProgress)
      }
    } catch (error) {
      console.error('Failed to record activity:', error)
    }
  }

  useEffect(() => {
    loadProgress()
  }, [])

  const value: UserProgressContextType = {
    userProgress,
    loading,
    refreshProgress,
    addXP,
    completeLesson,
    recordActivity
  }

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  )
}

export function useUserProgress() {
  const context = useContext(UserProgressContext)
  if (context === undefined) {
    throw new Error('useUserProgress must be used within a UserProgressProvider')
  }
  return context
}

// Hook for components that need to update progress
export function useProgressUpdater() {
  const { addXP, completeLesson, recordActivity } = useUserProgress()
  
  return {
    addXP,
    completeLesson,
    recordActivity,
    
    // Convenience methods for common actions
    completeExercise: (exerciseType: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
      const xpMap = { easy: 10, medium: 15, hard: 25 }
      addXP(xpMap[difficulty])
    },
    
    completeFlashcards: (cardsReviewed: number) => {
      addXP(cardsReviewed * 2) // 2 XP per card
    },
    
    completeGame: (gameType: string, score: number) => {
      const baseXP = 20
      const bonusXP = Math.floor(score / 100) * 5 // Bonus XP for high scores
      addXP(baseXP + bonusXP)
    }
  }
}
