"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { LessonCard } from "@/components/lessons/lesson-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { curriculumService, type Lesson } from "@/lib/curriculum-service"
// import { useUserProgress } from "@/contexts/UserProgressContext" // Temporarily disabled
import { Search, Filter, BookOpen, Clock, Users, Star, RefreshCw } from "lucide-react"

// Enhanced lesson interface for UI
interface EnhancedLesson extends Lesson {
  progress: number;
  isCompleted: boolean;
  isLocked: boolean;
  rating: number;
  enrolledCount: number;
  topics: string[];
  category: string;
}

const categories = ["All", "Basics", "Vocabulary", "Grammar", "Practical", "Culture", "Reading", "Speaking"]
const difficulties = ["All", "A1", "A2", "B1", "B2", "C1", "C2"]

export default function LessonsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [sortBy, setSortBy] = useState("progress") // progress, rating, duration, title
  const [lessons, setLessons] = useState<EnhancedLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Temporarily use mock user progress until context issue is resolved
  const userProgress = {
    completedLessons: ['1', '2'] // Mock completed lessons
  }

  // Load curriculum data on component mount
  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true)
        setError(null)

        const curriculumData = await curriculumService.getCurriculumData()

        // Transform curriculum lessons to enhanced lessons with UI data
        const enhancedLessons: EnhancedLesson[] = curriculumData.lessons.map((lesson, index) => {
          const isCompleted = userProgress?.completedLessons?.includes(lesson.id) || false
          const progress = isCompleted ? 100 : Math.floor(Math.random() * 60) // Random progress for demo

          // Determine category based on lesson content
          let category = "Basics"
          if (lesson.title.toLowerCase().includes("grammar") || lesson.title.toLowerCase().includes("verb")) {
            category = "Grammar"
          } else if (lesson.title.toLowerCase().includes("vocabulary") || lesson.title.toLowerCase().includes("word")) {
            category = "Vocabulary"
          } else if (lesson.title.toLowerCase().includes("culture") || lesson.title.toLowerCase().includes("turkish")) {
            category = "Culture"
          } else if (lesson.title.toLowerCase().includes("reading")) {
            category = "Reading"
          } else if (lesson.title.toLowerCase().includes("speaking") || lesson.title.toLowerCase().includes("pronunciation")) {
            category = "Speaking"
          } else if (lesson.title.toLowerCase().includes("practical") || lesson.title.toLowerCase().includes("shopping")) {
            category = "Practical"
          }

          // Extract topics from exercises (with safety check)
          const topics = lesson.exercises ? lesson.exercises.map(ex => ex.type.replace('_', ' ')).slice(0, 3) : []

          return {
            ...lesson,
            progress,
            isCompleted,
            isLocked: false, // For now, no lessons are locked
            rating: 4.2 + Math.random() * 0.8, // Random rating between 4.2-5.0
            enrolledCount: 500 + Math.floor(Math.random() * 1000), // Random enrollment
            topics: topics.length > 0 ? topics : ['Turkish', 'Language Learning'],
            category
          }
        })

        setLessons(enhancedLessons)
      } catch (err) {
        console.error('Failed to load lessons:', err)
        setError('Failed to load lessons. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadLessons()
  }, [])

  const handleStartLesson = (lessonId: string) => {
    window.location.href = `/lesson/${lessonId}`
  }

  const filteredLessons = lessons
    .filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lesson.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "All" || lesson.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === "All" || lesson.difficulty === selectedDifficulty

      return matchesSearch && matchesCategory && matchesDifficulty
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "progress":
          return b.progress - a.progress
        case "rating":
          return b.rating - a.rating
        case "duration":
          return a.duration - b.duration
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const stats = {
    totalLessons: lessons.length,
    completedLessons: lessons.filter(l => l.isCompleted).length,
    inProgressLessons: lessons.filter(l => l.progress > 0 && !l.isCompleted).length,
    averageRating: lessons.length > 0 ? (lessons.reduce((sum, l) => sum + l.rating, 0) / lessons.length).toFixed(1) : "0.0"
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Turkish Lessons
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Loading lessons from curriculum...
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg text-gray-600">Loading lessons...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Turkish Lessons
            </h1>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">😕</div>
                <h3 className="text-lg font-semibold mb-2">Failed to Load Lessons</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Turkish Lessons
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive collection of Turkish language lessons from real curriculum
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{stats.totalLessons}</div>
                <div className="text-sm text-muted-foreground">Total Lessons</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="h-8 w-8 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                </div>
                <div className="text-2xl font-bold">{stats.completedLessons}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{stats.inProgressLessons}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold">{stats.averageRating}</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lessons, topics, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map(difficulty => (
                    <Button
                      key={difficulty}
                      variant={selectedDifficulty === difficulty ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDifficulty(difficulty)}
                    >
                      {difficulty}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "progress", label: "Progress" },
                    { value: "rating", label: "Rating" },
                    { value: "duration", label: "Duration" },
                    { value: "title", label: "Title" }
                  ].map(option => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              Lessons ({filteredLessons.length})
            </h2>
            {searchQuery && (
              <Button variant="ghost" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </div>

          {filteredLessons.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No lessons found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onStart={handleStartLesson}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
