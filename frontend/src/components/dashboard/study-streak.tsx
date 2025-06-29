"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Zap, 
  Calendar,
  Flame,
  Target,
  Clock,
  TrendingUp,
  Award
} from "lucide-react"

interface StudyStreakProps {
  currentStreak: number
  longestStreak: number
}

export function StudyStreak({ currentStreak, longestStreak }: StudyStreakProps) {
  const streakGoal = 7 // Weekly streak goal
  const progressToGoal = Math.min((currentStreak / streakGoal) * 100, 100)
  const isOnFire = currentStreak >= 3
  const isStreakGoalReached = currentStreak >= streakGoal
  
  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: "Legendary", color: "text-purple-600", bg: "bg-purple-50" }
    if (streak >= 21) return { level: "Master", color: "text-red-600", bg: "bg-red-50" }
    if (streak >= 14) return { level: "Expert", color: "text-orange-600", bg: "bg-orange-50" }
    if (streak >= 7) return { level: "Advanced", color: "text-yellow-600", bg: "bg-yellow-50" }
    if (streak >= 3) return { level: "Committed", color: "text-blue-600", bg: "bg-blue-50" }
    return { level: "Getting Started", color: "text-gray-600", bg: "bg-gray-50" }
  }

  const currentLevel = getStreakLevel(currentStreak)
  const longestLevel = getStreakLevel(longestStreak)

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🏆"
    if (streak >= 21) return "🔥"
    if (streak >= 14) return "⚡"
    if (streak >= 7) return "💪"
    if (streak >= 3) return "🎯"
    return "🌱"
  }

  const getMotivationalMessage = () => {
    if (currentStreak === 0) {
      return "Start your learning journey today!"
    }
    if (currentStreak === 1) {
      return "Great start! Keep the momentum going!"
    }
    if (currentStreak < 3) {
      return "You're building a habit! Keep it up!"
    }
    if (currentStreak < 7) {
      return "Amazing consistency! You're on fire! 🔥"
    }
    if (currentStreak < 14) {
      return "Incredible dedication! You're a streak master!"
    }
    if (currentStreak < 21) {
      return "Phenomenal! You're in the expert zone!"
    }
    if (currentStreak < 30) {
      return "Legendary streak! You're unstoppable!"
    }
    return "You're a Turkish learning legend! 🏆"
  }

  return (
    <Card className={`relative overflow-hidden ${isOnFire ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-red-50' : ''}`}>
      {isOnFire && (
        <div className="absolute top-2 right-2">
          <Flame className="h-6 w-6 text-orange-500 animate-pulse" />
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Zap className={`h-5 w-5 ${isOnFire ? 'text-orange-600' : 'text-blue-600'}`} />
          <span>Study Streak</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Streak Display */}
        <div className="text-center space-y-3">
          <div className="relative">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-white text-3xl font-bold ${
              isOnFire ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'
            }`}>
              {currentStreak}
            </div>
            <div className="absolute -top-2 -right-2 text-2xl">
              {getStreakEmoji(currentStreak)}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold">
              {currentStreak} Day{currentStreak !== 1 ? 's' : ''}
            </h3>
            <Badge className={`${currentLevel.bg} ${currentLevel.color} border-0`}>
              {currentLevel.level}
            </Badge>
          </div>
        </div>

        {/* Progress to Weekly Goal */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly Goal Progress</span>
            <span className="font-medium">{Math.round(progressToGoal)}%</span>
          </div>
          <Progress 
            value={progressToGoal} 
            className={`h-3 ${isStreakGoalReached ? '[&>div]:bg-green-500' : ''}`}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{currentStreak} / {streakGoal} days</span>
            {!isStreakGoalReached && (
              <span>{streakGoal - currentStreak} days to goal</span>
            )}
          </div>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg ${currentLevel.bg} text-center`}>
            <div className={`text-lg font-bold ${currentLevel.color}`}>
              {currentStreak}
            </div>
            <div className="text-xs text-muted-foreground">Current</div>
          </div>
          <div className={`p-3 rounded-lg ${longestLevel.bg} text-center`}>
            <div className={`text-lg font-bold ${longestLevel.color}`}>
              {longestStreak}
            </div>
            <div className="text-xs text-muted-foreground">Best</div>
          </div>
        </div>

        {/* Streak Milestones */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center space-x-1">
            <Target className="h-4 w-4" />
            <span>Streak Milestones</span>
          </h4>
          <div className="space-y-2">
            {[3, 7, 14, 21, 30].map((milestone) => {
              const isReached = currentStreak >= milestone
              const isCurrent = currentStreak < milestone && currentStreak >= (milestone === 3 ? 0 : milestone === 7 ? 3 : milestone === 14 ? 7 : milestone === 21 ? 14 : 21)
              
              return (
                <div key={milestone} className={`flex items-center justify-between p-2 rounded-lg ${
                  isReached ? 'bg-green-50 border border-green-200' : 
                  isCurrent ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      isReached ? 'bg-green-500 text-white' : 
                      isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isReached ? '✓' : milestone}
                    </div>
                    <span className="text-sm font-medium">
                      {milestone} Day Streak
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {getStreakLevel(milestone).level}
                    </span>
                    <span className="text-lg">
                      {getStreakEmoji(milestone)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Button */}
        <Button className={`w-full ${isOnFire ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' : ''}`}>
          <Calendar className="h-4 w-4 mr-2" />
          {currentStreak === 0 ? 'Start Your Streak' : 'Continue Streak'}
        </Button>

        {/* Motivational Message */}
        <div className={`text-center p-3 rounded-lg border ${
          isOnFire ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' : 'bg-accent/50'
        }`}>
          <p className={`text-sm ${isOnFire ? 'text-orange-700' : 'text-muted-foreground'}`}>
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Streak Tips */}
        {currentStreak < 7 && (
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-sm font-medium text-blue-700 mb-1">💡 Streak Tip</h5>
            <p className="text-xs text-blue-600">
              Set a daily reminder and aim for just 10 minutes of study each day to build your streak!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
