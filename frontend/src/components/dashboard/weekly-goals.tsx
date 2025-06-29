"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Target, 
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings
} from "lucide-react"

interface WeeklyGoalsProps {
  weeklyGoal: number
  weeklyProgress: number
}

export function WeeklyGoals({ weeklyGoal, weeklyProgress }: WeeklyGoalsProps) {
  const progressPercentage = (weeklyProgress / weeklyGoal) * 100
  const isCompleted = weeklyProgress >= weeklyGoal
  const remaining = Math.max(0, weeklyGoal - weeklyProgress)

  const getDaysOfWeek = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const today = new Date().getDay()
    const currentDay = today === 0 ? 6 : today - 1 // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    
    return days.map((day, index) => ({
      name: day,
      completed: index < weeklyProgress,
      isToday: index === currentDay
    }))
  }

  const weekDays = getDaysOfWeek()

  return (
    <Card className={`${isCompleted ? 'border-green-200 bg-green-50/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className={`h-5 w-5 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`} />
            <span>Weekly Goals</span>
          </CardTitle>
          {isCompleted && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed!
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Lessons this week</span>
            <span className="font-medium">
              {weeklyProgress} / {weeklyGoal}
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className={`h-3 ${isCompleted ? '[&>div]:bg-green-500' : ''}`}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(progressPercentage)}% complete</span>
            {!isCompleted && (
              <span>{remaining} lessons remaining</span>
            )}
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>This Week</span>
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {day.name}
                </div>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    day.completed 
                      ? 'bg-green-500 text-white' 
                      : day.isToday 
                        ? 'bg-blue-100 text-blue-600 border-2 border-blue-300' 
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Stats */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div className="text-center">
            <div className={`text-lg font-bold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
              {weeklyProgress}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {Math.round(progressPercentage)}%
            </div>
            <div className="text-xs text-muted-foreground">Progress</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          {!isCompleted ? (
            <Button size="sm" className="flex-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              Continue Learning
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="flex-1">
              <Target className="h-4 w-4 mr-1" />
              Set New Goal
            </Button>
          )}
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Motivational Message */}
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          {isCompleted ? (
            <p className="text-sm text-green-700">
              🎉 Amazing! You've completed your weekly goal. Keep up the great work!
            </p>
          ) : remaining === 1 ? (
            <p className="text-sm text-blue-700">
              💪 You're almost there! Just {remaining} more lesson to reach your goal.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              🎯 {remaining} lessons to go. You can do this!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
