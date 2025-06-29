export interface ReviewItem {
  id: string
  word: string
  translation: string
  difficulty: number
  lastReviewed: Date
  nextReview: Date
  correctCount: number
  incorrectCount: number
  interval: number // days
  easeFactor: number
  repetitions: number
  context?: string
  lessonId?: string
  tags?: string[]
}

export interface SpacedRepetitionStats {
  totalReviews: number
  streakDays: number
  averageAccuracy: number
  itemsDue: number
  itemsLearned: number
  nextReviewTime: Date | null
  dailyGoal: number
  dailyProgress: number
}

export interface ReviewSession {
  id: string
  startTime: Date
  endTime?: Date
  itemsReviewed: number
  correctAnswers: number
  incorrectAnswers: number
  accuracy: number
  timeSpent: number // minutes
}

export class SpacedRepetitionService {
  private static readonly STORAGE_KEY = 'turkish-app-review-items'
  private static readonly STATS_KEY = 'turkish-app-review-stats'
  private static readonly SESSIONS_KEY = 'turkish-app-review-sessions'

  /**
   * SM-2 Algorithm implementation for spaced repetition
   * Based on the SuperMemo SM-2 algorithm
   */
  static calculateSM2(item: ReviewItem, quality: number): {
    newInterval: number
    newEaseFactor: number
    newRepetitions: number
  } {
    let newEaseFactor = item.easeFactor
    let newRepetitions = item.repetitions
    let newInterval = item.interval

    if (quality >= 3) {
      // Correct response
      if (newRepetitions === 0) {
        newInterval = 1
      } else if (newRepetitions === 1) {
        newInterval = 6
      } else {
        newInterval = Math.round(item.interval * item.easeFactor)
      }
      newRepetitions += 1
    } else {
      // Incorrect response - reset repetitions but keep some interval
      newRepetitions = 0
      newInterval = 1
    }

    // Update ease factor based on quality
    newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    
    // Ensure ease factor doesn't go below minimum
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3
    }

    return { newInterval, newEaseFactor, newRepetitions }
  }

  /**
   * Get all review items from storage
   */
  static getReviewItems(): ReviewItem[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        // Initialize with sample data if no items exist
        const sampleItems = this.createSampleItems()
        this.saveReviewItems(sampleItems)
        return sampleItems
      }

      const items = JSON.parse(stored)
      return items.map((item: any) => ({
        ...item,
        lastReviewed: new Date(item.lastReviewed),
        nextReview: new Date(item.nextReview)
      }))
    } catch (error) {
      console.error('Error loading review items:', error)
      return []
    }
  }

  /**
   * Create sample review items for demonstration
   */
  private static createSampleItems(): ReviewItem[] {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

    return [
      {
        id: crypto.randomUUID(),
        word: 'merhaba',
        translation: 'hello',
        difficulty: 1,
        lastReviewed: yesterday,
        nextReview: now, // Due now
        correctCount: 5,
        incorrectCount: 1,
        interval: 3,
        easeFactor: 2.6,
        repetitions: 3,
        context: 'Used when greeting someone',
        lessonId: 'lesson-1',
        tags: ['greetings', 'basic']
      },
      {
        id: crypto.randomUUID(),
        word: 'teşekkür ederim',
        translation: 'thank you',
        difficulty: 2,
        lastReviewed: twoDaysAgo,
        nextReview: now, // Due now
        correctCount: 3,
        incorrectCount: 2,
        interval: 1,
        easeFactor: 2.3,
        repetitions: 2,
        context: 'Expressing gratitude',
        lessonId: 'lesson-1',
        tags: ['politeness', 'basic']
      },
      {
        id: crypto.randomUUID(),
        word: 'nasılsınız',
        translation: 'how are you (formal)',
        difficulty: 3,
        lastReviewed: twoDaysAgo,
        nextReview: now, // Due now
        correctCount: 2,
        incorrectCount: 4,
        interval: 1,
        easeFactor: 2.1,
        repetitions: 1,
        context: 'Formal way to ask about someone\'s well-being',
        lessonId: 'lesson-2',
        tags: ['questions', 'formal']
      },
      {
        id: crypto.randomUUID(),
        word: 'günaydın',
        translation: 'good morning',
        difficulty: 1,
        lastReviewed: yesterday,
        nextReview: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        correctCount: 4,
        incorrectCount: 0,
        interval: 7,
        easeFactor: 2.8,
        repetitions: 4,
        context: 'Morning greeting',
        lessonId: 'lesson-1',
        tags: ['greetings', 'time']
      },
      {
        id: crypto.randomUUID(),
        word: 'görüşürüz',
        translation: 'see you later',
        difficulty: 2,
        lastReviewed: yesterday,
        nextReview: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        correctCount: 2,
        incorrectCount: 1,
        interval: 2,
        easeFactor: 2.4,
        repetitions: 2,
        context: 'Casual farewell',
        lessonId: 'lesson-1',
        tags: ['farewells', 'casual']
      }
    ]
  }

  /**
   * Save review items to storage
   */
  static saveReviewItems(items: ReviewItem[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Error saving review items:', error)
    }
  }

  /**
   * Get items that are due for review
   */
  static getDueItems(): ReviewItem[] {
    const allItems = this.getReviewItems()
    const now = new Date()
    
    return allItems.filter(item => item.nextReview <= now)
      .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime())
  }

  /**
   * Add a new item to the review system
   */
  static addReviewItem(word: string, translation: string, options: {
    difficulty?: number
    context?: string
    lessonId?: string
    tags?: string[]
  } = {}): ReviewItem {
    const newItem: ReviewItem = {
      id: crypto.randomUUID(),
      word,
      translation,
      difficulty: options.difficulty || 1,
      lastReviewed: new Date(),
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      correctCount: 0,
      incorrectCount: 0,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      context: options.context,
      lessonId: options.lessonId,
      tags: options.tags || []
    }

    const items = this.getReviewItems()
    items.push(newItem)
    this.saveReviewItems(items)

    return newItem
  }

  /**
   * Update an item after review
   */
  static updateItemAfterReview(itemId: string, quality: number): ReviewItem | null {
    const items = this.getReviewItems()
    const itemIndex = items.findIndex(item => item.id === itemId)
    
    if (itemIndex === -1) return null

    const item = items[itemIndex]
    const { newInterval, newEaseFactor, newRepetitions } = this.calculateSM2(item, quality)
    
    const updatedItem: ReviewItem = {
      ...item,
      lastReviewed: new Date(),
      nextReview: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000),
      correctCount: item.correctCount + (quality >= 3 ? 1 : 0),
      incorrectCount: item.incorrectCount + (quality >= 3 ? 0 : 1),
      interval: newInterval,
      easeFactor: newEaseFactor,
      repetitions: newRepetitions
    }

    items[itemIndex] = updatedItem
    this.saveReviewItems(items)

    return updatedItem
  }

  /**
   * Get spaced repetition statistics
   */
  static getStats(): SpacedRepetitionStats {
    const items = this.getReviewItems()
    const dueItems = this.getDueItems()
    const sessions = this.getReviewSessions()

    const totalReviews = items.reduce((sum, item) => sum + item.correctCount + item.incorrectCount, 0)
    const totalCorrect = items.reduce((sum, item) => sum + item.correctCount, 0)
    const averageAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0

    // Calculate streak
    const streakDays = this.calculateStreakDays(sessions)

    // Find next review time
    const futureItems = items.filter(item => item.nextReview > new Date())
    const nextReviewTime = futureItems.length > 0 
      ? new Date(Math.min(...futureItems.map(item => item.nextReview.getTime())))
      : null

    // Items learned (items with at least 3 repetitions)
    const itemsLearned = items.filter(item => item.repetitions >= 3).length

    return {
      totalReviews,
      streakDays,
      averageAccuracy,
      itemsDue: dueItems.length,
      itemsLearned,
      nextReviewTime,
      dailyGoal: 20, // Default daily goal
      dailyProgress: this.getDailyProgress()
    }
  }

  /**
   * Calculate streak days based on review sessions
   */
  private static calculateStreakDays(sessions: ReviewSession[]): number {
    if (sessions.length === 0) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let streakDays = 0
    let currentDate = new Date(today)

    // Check each day going backwards
    while (true) {
      const dayStart = new Date(currentDate)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      const hasSessionOnDay = sessions.some(session => {
        const sessionDate = new Date(session.startTime)
        return sessionDate >= dayStart && sessionDate <= dayEnd
      })

      if (hasSessionOnDay) {
        streakDays++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streakDays
  }

  /**
   * Get daily progress (items reviewed today)
   */
  private static getDailyProgress(): number {
    const sessions = this.getReviewSessions()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todaySessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime)
      sessionDate.setHours(0, 0, 0, 0)
      return sessionDate.getTime() === today.getTime()
    })

    return todaySessions.reduce((sum, session) => sum + session.itemsReviewed, 0)
  }

  /**
   * Get review sessions from storage
   */
  static getReviewSessions(): ReviewSession[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.SESSIONS_KEY)
      if (!stored) return []
      
      const sessions = JSON.parse(stored)
      return sessions.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined
      }))
    } catch (error) {
      console.error('Error loading review sessions:', error)
      return []
    }
  }

  /**
   * Save a completed review session
   */
  static saveReviewSession(session: ReviewSession): void {
    if (typeof window === 'undefined') return
    
    try {
      const sessions = this.getReviewSessions()
      sessions.push(session)
      
      // Keep only last 100 sessions to prevent storage bloat
      const recentSessions = sessions.slice(-100)
      
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(recentSessions))
    } catch (error) {
      console.error('Error saving review session:', error)
    }
  }

  /**
   * Create a new review session
   */
  static createReviewSession(): ReviewSession {
    return {
      id: crypto.randomUUID(),
      startTime: new Date(),
      itemsReviewed: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracy: 0,
      timeSpent: 0
    }
  }

  /**
   * Complete a review session
   */
  static completeReviewSession(session: ReviewSession, itemsReviewed: number, correctAnswers: number): ReviewSession {
    const completedSession: ReviewSession = {
      ...session,
      endTime: new Date(),
      itemsReviewed,
      correctAnswers,
      incorrectAnswers: itemsReviewed - correctAnswers,
      accuracy: itemsReviewed > 0 ? Math.round((correctAnswers / itemsReviewed) * 100) : 0,
      timeSpent: Math.round((new Date().getTime() - session.startTime.getTime()) / (1000 * 60)) // minutes
    }

    this.saveReviewSession(completedSession)
    return completedSession
  }
}
