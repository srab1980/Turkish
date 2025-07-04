"use client"

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { useUserProgress, useProgressUpdater } from '@/contexts/UserProgressContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Trophy, 
  Star, 
  BookOpen, 
  Target, 
  Zap, 
  Calendar,
  Award,
  TrendingUp,
  RefreshCw
} from 'lucide-react'

export default function ProgressDemoPage() {
  const { userProgress, loading, refreshProgress } = useUserProgress()
  const progressUpdater = useProgressUpdater()
  const [actionLog, setActionLog] = useState<string[]>([])

  const addToLog = (action: string) => {
    setActionLog(prev => [`${new Date().toLocaleTimeString()}: ${action}`, ...prev.slice(0, 9)])
  }

  const handleAddXP = (amount: number) => {
    progressUpdater.addXP(amount)
    addToLog(`Added ${amount} XP`)
  }

  const handleCompleteLesson = () => {
    const lessonId = `lesson_${Date.now()}`
    const xp = 50 + Math.floor(Math.random() * 50) // 50-100 XP
    const timeSpent = 5 + Math.floor(Math.random() * 15) // 5-20 minutes
    
    progressUpdater.completeLesson(lessonId, xp, timeSpent)
    addToLog(`Completed lesson: +${xp} XP, ${timeSpent} minutes`)
  }

  const handleCompleteExercise = (difficulty: 'easy' | 'medium' | 'hard') => {
    progressUpdater.completeExercise('practice', difficulty)
    const xpMap = { easy: 10, medium: 15, hard: 25 }
    addToLog(`Completed ${difficulty} exercise: +${xpMap[difficulty]} XP`)
  }

  const handleCompleteFlashcards = () => {
    const cardCount = 5 + Math.floor(Math.random() * 10) // 5-15 cards
    progressUpdater.completeFlashcards(cardCount)
    addToLog(`Reviewed ${cardCount} flashcards: +${cardCount * 2} XP`)
  }

  const handleCompleteGame = () => {
    const score = 50 + Math.floor(Math.random() * 150) // 50-200 score
    progressUpdater.completeGame('memory_match', score)
    const baseXP = 20
    const bonusXP = Math.floor(score / 100) * 5
    addToLog(`Completed game (score: ${score}): +${baseXP + bonusXP} XP`)
  }

  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      localStorage.removeItem('turkish_app_user_progress')
      localStorage.removeItem('turkish_app_daily_stats')
      refreshProgress()
      addToLog('Progress reset')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading progress...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Progress Demo</h1>
            <p className="text-muted-foreground">
              Test the dynamic sidebar and user progress system
            </p>
          </div>
          <Button onClick={refreshProgress} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Current Progress
              </CardTitle>
              <CardDescription>
                Your learning statistics and achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userProgress && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{userProgress.totalXP}</div>
                      <div className="text-sm text-blue-700">Total XP</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{userProgress.currentStreak}</div>
                      <div className="text-sm text-green-700">Day Streak</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Goal</span>
                      <span>{userProgress.dailyXP} / {userProgress.dailyGoal} XP</span>
                    </div>
                    <Progress value={(userProgress.dailyXP / userProgress.dailyGoal) * 100} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{userProgress.level}</span>
                      <span>{userProgress.levelProgress}%</span>
                    </div>
                    <Progress value={userProgress.levelProgress} />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span>{userProgress.completedLessons.length} Lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span>{userProgress.achievements.length} Achievements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <span>{userProgress.vocabularyMastered} Vocabulary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span>{userProgress.totalStudyTime}min Study Time</span>
                    </div>
                  </div>

                  {userProgress.achievements.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Recent Achievements</h4>
                        <div className="space-y-2">
                          {userProgress.achievements.slice(-3).map((achievement, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                              <span className="text-lg">{achievement.icon}</span>
                              <div>
                                <div className="font-medium text-sm">{achievement.title}</div>
                                <div className="text-xs text-muted-foreground">{achievement.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Test Actions
              </CardTitle>
              <CardDescription>
                Simulate learning activities to see progress updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => handleAddXP(10)} variant="outline" size="sm">
                  +10 XP
                </Button>
                <Button onClick={() => handleAddXP(25)} variant="outline" size="sm">
                  +25 XP
                </Button>
                <Button onClick={() => handleCompleteExercise('easy')} variant="outline" size="sm">
                  Easy Exercise
                </Button>
                <Button onClick={() => handleCompleteExercise('hard')} variant="outline" size="sm">
                  Hard Exercise
                </Button>
              </div>

              <div className="space-y-2">
                <Button onClick={handleCompleteLesson} className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Complete Lesson
                </Button>
                <Button onClick={handleCompleteFlashcards} variant="outline" className="w-full">
                  <Star className="h-4 w-4 mr-2" />
                  Review Flashcards
                </Button>
                <Button onClick={handleCompleteGame} variant="outline" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Play Game
                </Button>
              </div>

              <Separator />

              <Button onClick={resetProgress} variant="destructive" size="sm" className="w-full">
                Reset Progress
              </Button>

              {actionLog.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Action Log</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {actionLog.map((log, index) => (
                        <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Watch the sidebar update in real-time as you perform actions</li>
              <li>Complete lessons to see streak and level progression</li>
              <li>Notice how badges and counts change dynamically</li>
              <li>Achievements unlock automatically at milestones</li>
              <li>Daily goals reset each day and maintain streaks</li>
              <li>All progress is saved to localStorage and persists between sessions</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
