"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { LessonCard } from "@/components/lessons/lesson-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, BookOpen, Clock, Users, Star } from "lucide-react"

// Mock lessons data
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
    topics: ["Greetings", "Introductions", "Basic Phrases"],
    category: "Basics"
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
    topics: ["Numbers", "Counting", "Mathematics"],
    category: "Basics"
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
    topics: ["Family", "Relationships", "Vocabulary"],
    category: "Vocabulary"
  },
  {
    id: "4",
    title: "Colors and Shapes",
    description: "Learn colors, shapes, and basic descriptive vocabulary",
    duration: 18,
    difficulty: "A1" as const,
    progress: 0,
    isCompleted: false,
    isLocked: false,
    rating: 4.5,
    enrolledCount: 720,
    topics: ["Colors", "Shapes", "Descriptions"],
    category: "Vocabulary"
  },
  {
    id: "5",
    title: "Present Tense Verbs",
    description: "Master the present tense conjugation in Turkish",
    duration: 30,
    difficulty: "A2" as const,
    progress: 0,
    isCompleted: false,
    isLocked: false,
    rating: 4.4,
    enrolledCount: 650,
    topics: ["Grammar", "Verbs", "Present Tense"],
    category: "Grammar"
  },
  {
    id: "6",
    title: "Shopping and Money",
    description: "Learn vocabulary for shopping, prices, and transactions",
    duration: 22,
    difficulty: "A2" as const,
    progress: 0,
    isCompleted: false,
    isLocked: false,
    rating: 4.6,
    enrolledCount: 580,
    topics: ["Shopping", "Money", "Transactions"],
    category: "Practical"
  }
]

const categories = ["All", "Basics", "Vocabulary", "Grammar", "Practical"]
const difficulties = ["All", "A1", "A2", "B1", "B2", "C1", "C2"]

export default function LessonsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [sortBy, setSortBy] = useState("progress") // progress, rating, duration, title

  const handleStartLesson = (lessonId: string) => {
    window.location.href = `/lesson/${lessonId}`
  }

  const filteredLessons = mockLessons
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
    totalLessons: mockLessons.length,
    completedLessons: mockLessons.filter(l => l.isCompleted).length,
    inProgressLessons: mockLessons.filter(l => l.progress > 0 && !l.isCompleted).length,
    averageRating: (mockLessons.reduce((sum, l) => sum + l.rating, 0) / mockLessons.length).toFixed(1)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-turkish-red to-red-600 bg-clip-text text-transparent">
            Turkish Lessons
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive collection of Turkish language lessons
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
