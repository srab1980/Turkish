"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { LessonCard } from "@/components/lessons/lesson-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api-service"

import { ArrowRight, BookOpen, Target, Trophy, Wifi, WifiOff } from "lucide-react"

// Mock data for demonstration
const mockStats = {
  currentLevel: "A1",
  levelProgress: 75,
  totalXP: 1250,
  dailyGoal: 200,
  dailyProgress: 120,
  streak: 5,
  lessonsCompleted: 12,
  totalLessons: 24,
  averageAccuracy: 87,
  studyTime: 180,
  achievements: 8
}

const mockLessons = [
  {
    id: "1",
    title: "Basic Greetings",
    description: "Learn how to say hello, goodbye, and introduce yourself in Turkish",
    duration: 15,
    difficulty: "A1" as const,
    progress: 100,
    isCompleted: true,
    isLocked: false,
    rating: 4.8,
    enrolledCount: 1250,
    topics: ["Greetings", "Introductions", "Basic Phrases"]
  },
  {
    id: "2",
    title: "Numbers and Counting",
    description: "Master Turkish numbers from 1 to 100 and basic counting",
    duration: 20,
    difficulty: "A1" as const,
    progress: 60,
    isCompleted: false,
    isLocked: false,
    rating: 4.6,
    enrolledCount: 980,
    topics: ["Numbers", "Counting", "Mathematics"]
  },
  {
    id: "3",
    title: "Family and Relationships",
    description: "Vocabulary for family members and describing relationships",
    duration: 25,
    difficulty: "A1" as const,
    progress: 0,
    isCompleted: false,
    isLocked: false,
    rating: 4.7,
    enrolledCount: 850,
    topics: ["Family", "Relationships", "Vocabulary"]
  }
]

export default function Home() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'mock'>('checking')
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    checkApiStatus()
    loadCourses()
  }, [])

  const checkApiStatus = async () => {
    const isHealthy = await apiService.healthCheck()
    setApiStatus(isHealthy ? 'connected' : 'mock')
  }

  const loadCourses = async () => {
    try {
      const coursesData = await apiService.getCourses()
      setCourses(coursesData || [])
    } catch (error) {
      console.error('Failed to load courses:', error)
    }
  }

  const handleStartLesson = (lessonId: string) => {
    window.location.href = `/lesson/${lessonId}`
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-turkish-red to-red-600 bg-clip-text text-transparent">
              Welcome to Türkçe Öğren
            </h1>
            <Badge
              variant={apiStatus === 'connected' ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              {apiStatus === 'checking' ? (
                <>⏳ Checking</>
              ) : apiStatus === 'connected' ? (
                <><Wifi className="h-3 w-3" /> Live</>
              ) : (
                <><WifiOff className="h-3 w-3" /> Demo</>
              )}
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master Turkish with AI-powered lessons based on the Istanbul Book Curriculum
          </p>
          {apiStatus === 'mock' && (
            <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3 max-w-lg mx-auto">
              📡 Backend not available - Running in demo mode with sample data
            </p>
          )}
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg" className="bg-turkish-red hover:bg-red-700" onClick={() => window.location.href = '/courses'}>
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Courses
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = '/lessons'}>
              <Target className="h-5 w-5 mr-2" />
              Start Lessons
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={mockStats} />

        {/* Recent Lessons */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Continue Learning</h2>
            <Button variant="ghost" className="text-primary" onClick={() => window.location.href = '/lessons'}>
              View All Lessons
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onStart={handleStartLesson}
              />
            ))}
          </div>
        </div>

        {/* Achievement Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">First Lesson</p>
                  <p className="text-xs text-muted-foreground">Completed your first lesson</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">5 Day Streak</p>
                  <p className="text-xs text-muted-foreground">Studied 5 days in a row</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Quick Learner</p>
                  <p className="text-xs text-muted-foreground">Completed 10 lessons</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Perfect Score</p>
                  <p className="text-xs text-muted-foreground">100% on 3 exercises</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
