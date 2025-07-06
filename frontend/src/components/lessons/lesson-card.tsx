"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Clock, 
  Star, 
  Play, 
  CheckCircle, 
  Lock,
  BookOpen,
  Users
} from "lucide-react"

interface LessonCardProps {
  lesson: {
    id: string
    title: string
    description: string
    estimatedMinutes: number
    difficultyLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
    progress: number
    isCompleted: boolean
    isLocked: boolean
    rating: number
    enrolledCount: number
    topics: string[]
  }
  onStart: (lessonId: string) => void
}

export function LessonCard({ lesson, onStart }: LessonCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "A1": return "bg-green-500"
      case "A2": return "bg-blue-500"
      case "B1": return "bg-yellow-500"
      case "B2": return "bg-orange-500"
      case "C1": return "bg-red-500"
      case "C2": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {lesson.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {lesson.description}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge
              className={`${getDifficultyColor(lesson.difficultyLevel)} text-white`}
            >
              {lesson.difficultyLevel}
            </Badge>
            {lesson.isCompleted && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {lesson.isLocked && (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {lesson.progress > 0 && !lesson.isCompleted && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{lesson.progress}%</span>
            </div>
            <Progress value={lesson.progress} className="h-2" />
          </div>
        )}

        {/* Lesson Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{lesson.estimatedMinutes} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{lesson.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{lesson.enrolledCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-1">
          {lesson.topics.slice(0, 3).map((topic) => (
            <Badge key={topic} variant="outline" className="text-xs">
              {topic}
            </Badge>
          ))}
          {lesson.topics.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{lesson.topics.length - 3} more
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <Button 
          className="w-full" 
          onClick={() => onStart(lesson.id)}
          disabled={lesson.isLocked}
          variant={lesson.isCompleted ? "outline" : "default"}
        >
          {lesson.isLocked ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Locked
            </>
          ) : lesson.isCompleted ? (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Review
            </>
          ) : lesson.progress > 0 ? (
            <>
              <Play className="h-4 w-4 mr-2" />
              Continue
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Lesson
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
