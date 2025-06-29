'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Clock, Target, Brain, CheckCircle, XCircle, RotateCcw, Calendar, TrendingUp, Star } from 'lucide-react'
import { SpacedRepetitionService, ReviewItem, SpacedRepetitionStats, ReviewSession } from '@/lib/spaced-repetition'
import { ReviewAnalytics } from '@/components/review/review-analytics'

// Interfaces are now imported from the service

const mockReviewItems: ReviewItem[] = [
  {
    id: '1',
    word: 'merhaba',
    translation: 'hello',
    difficulty: 1,
    lastReviewed: new Date('2024-01-15'),
    nextReview: new Date('2024-01-16'),
    correctCount: 5,
    incorrectCount: 1,
    interval: 3,
    easeFactor: 2.6,
    repetitions: 3,
    context: 'Used when greeting someone',
    lessonId: 'lesson-1'
  },
  {
    id: '2',
    word: 'teşekkür ederim',
    translation: 'thank you',
    difficulty: 2,
    lastReviewed: new Date('2024-01-14'),
    nextReview: new Date('2024-01-16'),
    correctCount: 3,
    incorrectCount: 2,
    interval: 1,
    easeFactor: 2.3,
    repetitions: 2,
    context: 'Expressing gratitude',
    lessonId: 'lesson-1'
  },
  {
    id: '3',
    word: 'nasılsınız',
    translation: 'how are you (formal)',
    difficulty: 3,
    lastReviewed: new Date('2024-01-13'),
    nextReview: new Date('2024-01-16'),
    correctCount: 2,
    incorrectCount: 4,
    interval: 1,
    easeFactor: 2.1,
    repetitions: 1,
    context: 'Formal way to ask about someone\'s well-being',
    lessonId: 'lesson-2'
  },
  {
    id: '4',
    word: 'günaydın',
    translation: 'good morning',
    difficulty: 1,
    lastReviewed: new Date('2024-01-15'),
    nextReview: new Date('2024-01-16'),
    correctCount: 4,
    incorrectCount: 0,
    interval: 7,
    easeFactor: 2.8,
    repetitions: 4,
    context: 'Morning greeting',
    lessonId: 'lesson-1'
  },
  {
    id: '5',
    word: 'görüşürüz',
    translation: 'see you later',
    difficulty: 2,
    lastReviewed: new Date('2024-01-14'),
    nextReview: new Date('2024-01-16'),
    correctCount: 2,
    incorrectCount: 1,
    interval: 2,
    easeFactor: 2.4,
    repetitions: 2,
    context: 'Casual farewell',
    lessonId: 'lesson-1'
  }
]

export default function ReviewPage() {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  })
  const [stats, setStats] = useState<SpacedRepetitionStats | null>(null)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [currentSession, setCurrentSession] = useState<ReviewSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReviewData()
  }, [])

  const loadReviewData = () => {
    try {
      // Get items due for review
      const dueItems = SpacedRepetitionService.getDueItems()
      setReviewItems(dueItems)

      // Get current stats
      const currentStats = SpacedRepetitionService.getStats()
      setStats(currentStats)

      // Create new session if there are items to review
      if (dueItems.length > 0) {
        const session = SpacedRepetitionService.createReviewSession()
        setCurrentSession(session)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading review data:', error)
      setLoading(false)
    }
  }

  const currentItem = reviewItems[currentIndex]

  const handleAnswer = (quality: number) => {
    // quality: 0-5 scale (0=complete blackout, 5=perfect response)
    if (!currentItem) return

    const correct = quality >= 3

    // Update session stats
    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      total: prev.total + 1
    }))

    // Update the item using the service
    SpacedRepetitionService.updateItemAfterReview(currentItem.id, quality)

    // Move to next item
    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    } else {
      // Session complete
      completeSession()
    }
  }

  const completeSession = () => {
    if (currentSession) {
      SpacedRepetitionService.completeReviewSession(
        currentSession,
        sessionStats.total + 1, // +1 for current item
        sessionStats.correct + (sessionStats.total + 1 > sessionStats.correct + sessionStats.incorrect ? 1 : 0)
      )
    }
    setSessionComplete(true)
  }

  const resetSession = () => {
    setCurrentIndex(0)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0, total: 0 })
    setSessionComplete(false)

    // Create new session
    const session = SpacedRepetitionService.createReviewSession()
    setCurrentSession(session)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading review session...</p>
        </div>
      </div>
    )
  }

  if (sessionComplete) {
    const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
            <p className="text-muted-foreground">
              Great job! You've completed your review session.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-4 justify-center">
            <Button onClick={resetSession} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Review Again
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (reviewItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-6">
            <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold mb-2">No Reviews Due</h1>
              <p className="text-muted-foreground mb-6">
                Excellent! You're all caught up with your spaced repetition reviews.
                {stats?.nextReviewTime && (
                  <span className="block mt-2">
                    Next review session: {stats.nextReviewTime.toLocaleString()}
                  </span>
                )}
              </p>
            </div>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Back to Dashboard
            </Button>
          </div>

          {/* Show analytics when no reviews are due */}
          <ReviewAnalytics />
        </div>
      </div>
    )
  }

  if (!currentItem) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Spaced Repetition Review</h1>
            <p className="text-muted-foreground">
              {currentIndex + 1} of {reviewItems.length} items
            </p>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{reviewItems.length} due</span>
          </Badge>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Session Progress</span>
                <span>{Math.round(((currentIndex) / reviewItems.length) * 100)}%</span>
              </div>
              <Progress value={((currentIndex) / reviewItems.length) * 100} />

              <div className="flex justify-between text-sm">
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{sessionStats.correct} correct</span>
                </div>
                <div className="flex items-center space-x-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span>{sessionStats.incorrect} incorrect</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Card */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Review Item</span>
              <div className="flex space-x-2">
                <Badge variant={
                  currentItem.difficulty === 1 ? 'default' :
                  currentItem.difficulty === 2 ? 'secondary' : 'destructive'
                }>
                  {currentItem.difficulty === 1 ? 'Easy' :
                   currentItem.difficulty === 2 ? 'Medium' : 'Hard'}
                </Badge>
                <Badge variant="outline">
                  Rep: {currentItem.repetitions}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center space-y-6">
              <div className="text-4xl font-bold text-primary mb-4">
                {currentItem.word}
              </div>

              {currentItem.context && !showAnswer && (
                <div className="text-sm text-muted-foreground italic bg-muted p-3 rounded-lg">
                  Context: {currentItem.context}
                </div>
              )}

              {showAnswer && (
                <div className="space-y-6">
                  <div className="text-2xl text-muted-foreground font-medium">
                    {currentItem.translation}
                  </div>

                  {currentItem.context && (
                    <div className="text-sm text-muted-foreground italic bg-muted p-3 rounded-lg">
                      {currentItem.context}
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-sm font-medium">How well did you remember this?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleAnswer(1)}
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        size="sm"
                      >
                        Hard (1)
                      </Button>
                      <Button
                        onClick={() => handleAnswer(3)}
                        variant="outline"
                        className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                        size="sm"
                      >
                        Good (3)
                      </Button>
                      <Button
                        onClick={() => handleAnswer(4)}
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        size="sm"
                      >
                        Easy (4)
                      </Button>
                      <Button
                        onClick={() => handleAnswer(5)}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Perfect (5)
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!showAnswer && (
                <Button
                  onClick={() => setShowAnswer(true)}
                  className="w-full"
                  size="lg"
                >
                  Show Answer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Item Stats */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-green-600">
                  {currentItem.correctCount}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">
                  {currentItem.incorrectCount}
                </div>
                <div className="text-xs text-muted-foreground">Incorrect</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600">
                  {currentItem.interval}d
                </div>
                <div className="text-xs text-muted-foreground">Interval</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-600">
                  {currentItem.easeFactor.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Ease</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
