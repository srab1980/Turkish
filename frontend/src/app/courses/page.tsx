"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, BookOpen, Clock, Users, Star, Play, CheckCircle } from "lucide-react"

// Mock courses data
const mockCourses = [
  {
    id: "beginner-turkish",
    title: "Complete Turkish for Beginners",
    description: "Master the fundamentals of Turkish language with our comprehensive beginner course based on Istanbul Book A1-A2 curriculum",
    instructor: "Dr. Ayşe Demir",
    duration: "12 weeks",
    totalLessons: 48,
    completedLessons: 12,
    difficulty: "A1-A2" as const,
    rating: 4.9,
    enrolledCount: 2450,
    price: 99,
    category: "Complete Course",
    topics: ["Grammar", "Vocabulary", "Speaking", "Listening", "Reading", "Writing"],
    thumbnail: "/images/courses/beginner-turkish.jpg",
    isEnrolled: true,
    progress: 25,
    nextLesson: "Lesson 13: Past Tense"
  },
  {
    id: "business-turkish",
    title: "Turkish for Business",
    description: "Professional Turkish language skills for business communication and workplace scenarios",
    instructor: "Prof. Mehmet Özkan",
    duration: "8 weeks",
    totalLessons: 32,
    completedLessons: 0,
    difficulty: "B1-B2" as const,
    rating: 4.7,
    enrolledCount: 890,
    price: 149,
    category: "Specialized",
    topics: ["Business Vocabulary", "Formal Communication", "Presentations", "Negotiations"],
    thumbnail: "/images/courses/business-turkish.jpg",
    isEnrolled: false,
    progress: 0
  },
  {
    id: "turkish-culture",
    title: "Turkish Culture & Language",
    description: "Explore Turkish culture while learning the language through authentic materials and cultural contexts",
    instructor: "Zeynep Kaya",
    duration: "10 weeks",
    totalLessons: 40,
    completedLessons: 40,
    difficulty: "A2-B1" as const,
    rating: 4.8,
    enrolledCount: 1560,
    price: 79,
    category: "Cultural",
    topics: ["Culture", "History", "Traditions", "Daily Life", "Food", "Travel"],
    thumbnail: "/images/courses/turkish-culture.jpg",
    isEnrolled: true,
    progress: 100
  },
  {
    id: "conversation-practice",
    title: "Turkish Conversation Mastery",
    description: "Intensive speaking practice with native speakers and interactive conversation scenarios",
    instructor: "Emre Yılmaz",
    duration: "6 weeks",
    totalLessons: 24,
    completedLessons: 8,
    difficulty: "B1-C1" as const,
    rating: 4.6,
    enrolledCount: 720,
    price: 129,
    category: "Speaking",
    topics: ["Conversation", "Pronunciation", "Fluency", "Confidence"],
    thumbnail: "/images/courses/conversation.jpg",
    isEnrolled: true,
    progress: 33
  },
  {
    id: "grammar-intensive",
    title: "Turkish Grammar Intensive",
    description: "Deep dive into Turkish grammar structures with comprehensive exercises and explanations",
    instructor: "Dr. Fatma Şen",
    duration: "14 weeks",
    totalLessons: 56,
    completedLessons: 0,
    difficulty: "A1-C1" as const,
    rating: 4.5,
    enrolledCount: 1200,
    price: 119,
    category: "Grammar",
    topics: ["Grammar Rules", "Sentence Structure", "Verb Conjugation", "Cases"],
    thumbnail: "/images/courses/grammar.jpg",
    isEnrolled: false,
    progress: 0
  },
  {
    id: "exam-preparation",
    title: "Turkish Proficiency Exam Prep",
    description: "Comprehensive preparation for Turkish proficiency exams with practice tests and strategies",
    instructor: "Ahmet Kılıç",
    duration: "16 weeks",
    totalLessons: 64,
    completedLessons: 0,
    difficulty: "B2-C2" as const,
    rating: 4.4,
    enrolledCount: 650,
    price: 199,
    category: "Exam Prep",
    topics: ["Test Strategies", "Practice Tests", "Time Management", "All Skills"],
    thumbnail: "/images/courses/exam-prep.jpg",
    isEnrolled: false,
    progress: 0
  }
]

const categories = ["All", "Complete Course", "Specialized", "Cultural", "Speaking", "Grammar", "Exam Prep"]
const difficulties = ["All", "A1", "A2", "B1", "B2", "C1", "C2"]
const priceRanges = ["All", "Free", "$1-50", "$51-100", "$101-150", "$151+"]

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [selectedPriceRange, setSelectedPriceRange] = useState("All")
  const [sortBy, setSortBy] = useState("popularity") // popularity, rating, price, newest
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false)

  const handleEnrollCourse = (courseId: string) => {
    console.log("Enrolling in course:", courseId)
    // Handle course enrollment
  }

  const handleContinueCourse = (courseId: string) => {
    window.location.href = `/course/${courseId}`
  }

  const filteredCourses = mockCourses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory
      
      const matchesDifficulty = selectedDifficulty === "All" || 
                               course.difficulty.includes(selectedDifficulty)
      
      const matchesPriceRange = selectedPriceRange === "All" || 
                               (selectedPriceRange === "Free" && course.price === 0) ||
                               (selectedPriceRange === "$1-50" && course.price > 0 && course.price <= 50) ||
                               (selectedPriceRange === "$51-100" && course.price > 50 && course.price <= 100) ||
                               (selectedPriceRange === "$101-150" && course.price > 100 && course.price <= 150) ||
                               (selectedPriceRange === "$151+" && course.price > 150)
      
      const matchesEnrollment = !showEnrolledOnly || course.isEnrolled
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesPriceRange && matchesEnrollment
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return b.enrolledCount - a.enrolledCount
        case "rating":
          return b.rating - a.rating
        case "price":
          return a.price - b.price
        case "newest":
          return a.title.localeCompare(b.title) // Mock sorting by newest
        default:
          return 0
      }
    })

  const stats = {
    totalCourses: mockCourses.length,
    enrolledCourses: mockCourses.filter(c => c.isEnrolled).length,
    completedCourses: mockCourses.filter(c => c.progress === 100).length,
    averageProgress: Math.round(mockCourses.filter(c => c.isEnrolled).reduce((sum, c) => sum + c.progress, 0) / mockCourses.filter(c => c.isEnrolled).length)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-turkish-red to-red-600 bg-clip-text text-transparent">
            Turkish Courses
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive Turkish language courses for every level and goal
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                <div className="text-sm text-muted-foreground">Available Courses</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Play className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
                <div className="text-sm text-muted-foreground">Enrolled</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{stats.completedCourses}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold">{stats.averageProgress}%</div>
                <div className="text-sm text-muted-foreground">Avg Progress</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Search & Filter Courses</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map(range => (
                    <Button
                      key={range}
                      variant={selectedPriceRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPriceRange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "popularity", label: "Popular" },
                    { value: "rating", label: "Rating" },
                    { value: "price", label: "Price" },
                    { value: "newest", label: "Newest" }
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

            {/* Additional Filters */}
            <div className="flex items-center space-x-4">
              <Button
                variant={showEnrolledOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowEnrolledOnly(!showEnrolledOnly)}
              >
                My Courses Only
              </Button>
              {(searchQuery || selectedCategory !== "All" || selectedDifficulty !== "All" || selectedPriceRange !== "All" || showEnrolledOnly) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("All")
                    setSelectedDifficulty("All")
                    setSelectedPriceRange("All")
                    setShowEnrolledOnly(false)
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              Courses ({filteredCourses.length})
            </h2>
          </div>

          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                        <p className="text-sm font-medium text-primary">
                          by {course.instructor}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="secondary">{course.difficulty}</Badge>
                        {course.isEnrolled && course.progress === 100 && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.isEnrolled && course.progress > 0 && course.progress < 100 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Next: {course.nextLesson}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.totalLessons} lessons</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{course.enrolledCount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        ${course.price}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {course.topics.slice(0, 3).map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {course.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{course.topics.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {course.isEnrolled ? (
                      <Button 
                        onClick={() => handleContinueCourse(course.id)} 
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {course.progress === 100 ? "Review Course" : "Continue Learning"}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleEnrollCourse(course.id)} 
                        variant="outline" 
                        className="w-full"
                      >
                        Enroll Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
