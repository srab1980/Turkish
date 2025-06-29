"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  Star,
  TrendingUp,
  Target,
  Award,
  Zap
} from "lucide-react"

interface LevelProgressProps {
  currentLevel: string
  progress: number
  totalXP: number
}

export function LevelProgress({ currentLevel, progress, totalXP }: LevelProgressProps) {
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
  const currentLevelIndex = levels.indexOf(currentLevel)
  const nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null
  
  const xpForCurrentLevel = currentLevelIndex * 1000 // Simplified XP calculation
  const xpForNextLevel = nextLevel ? (currentLevelIndex + 1) * 1000 : null
  const xpNeeded = xpForNextLevel ? xpForNextLevel - totalXP : 0

  const getLevelColor = (level: string) => {
    switch (level) {
      case "A1": return "bg-green-500"
      case "A2": return "bg-blue-500"
      case "B1": return "bg-yellow-500"
      case "B2": return "bg-orange-500"
      case "C1": return "bg-red-500"
      case "C2": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  const getLevelDescription = (level: string) => {
    switch (level) {
      case "A1": return "Beginner"
      case "A2": return "Elementary"
      case "B1": return "Intermediate"
      case "B2": return "Upper Intermediate"
      case "C1": return "Advanced"
      case "C2": return "Proficient"
      default: return "Unknown"
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-100 to-transparent opacity-50" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <span>Level Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level Display */}
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-white text-2xl font-bold ${getLevelColor(currentLevel)}`}>
            {currentLevel}
          </div>
          <div>
            <h3 className="text-xl font-bold">{getLevelDescription(currentLevel)}</h3>
            <p className="text-sm text-muted-foreground">Current Level</p>
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to {nextLevel}</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{totalXP.toLocaleString()} XP</span>
              <span>{xpNeeded.toLocaleString()} XP to go</span>
            </div>
          </div>
        )}

        {/* Level Milestones */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center space-x-1">
            <Target className="h-4 w-4" />
            <span>Level Milestones</span>
          </h4>
          <div className="space-y-2">
            {levels.map((level, index) => {
              const isCompleted = index < currentLevelIndex
              const isCurrent = index === currentLevelIndex
              const isNext = index === currentLevelIndex + 1
              
              return (
                <div key={level} className={`flex items-center space-x-3 p-2 rounded-lg ${
                  isCurrent ? 'bg-yellow-50 border border-yellow-200' : 
                  isCompleted ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-yellow-500 text-white' :
                    isNext ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <Trophy className="h-4 w-4" />
                    ) : (
                      level
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{level}</span>
                      <span className="text-sm text-muted-foreground">
                        {getLevelDescription(level)}
                      </span>
                      {isCompleted && (
                        <Badge variant="secondary" className="text-xs">
                          Completed
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge className="text-xs bg-yellow-500">
                          Current
                        </Badge>
                      )}
                      {isNext && (
                        <Badge variant="outline" className="text-xs">
                          Next
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {index * 1000} XP
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Level Stats */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{currentLevelIndex + 1}</div>
            <div className="text-xs text-muted-foreground">Levels Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{totalXP.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </div>
        </div>

        {/* Action Button */}
        {nextLevel && (
          <Button className="w-full">
            <TrendingUp className="h-4 w-4 mr-2" />
            Continue to {nextLevel}
          </Button>
        )}

        {/* Motivational Message */}
        <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          {progress >= 80 ? (
            <p className="text-sm text-yellow-700">
              🔥 You're so close to {nextLevel}! Keep pushing forward!
            </p>
          ) : progress >= 50 ? (
            <p className="text-sm text-blue-700">
              💪 Great progress! You're halfway to {nextLevel}!
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              🎯 Every lesson brings you closer to {nextLevel}!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
