"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, BookOpen, Clock, Users, Star, Play, CheckCircle, Loader2 } from "lucide-react"
import { curriculumService, type Course, type Unit, type Lesson, type Exercise } from "@/lib/curriculum-service"
import { apiService } from "@/lib/api-service"
import { useToast } from "@/components/ui/toast"

// Extended course interface for display
interface DisplayCourse extends Course {
  instructor: string;
  duration: string;
  totalLessons: number;
  completedLessons: number;
  difficulty: string;
  rating: number;
  enrolledCount: number;
  price: number;
  category: string;
  topics: string[];
  thumbnail: string;
  isEnrolled: boolean;
  progress: number;
  nextLesson?: string;
}

const categories = ["All", "Complete Course", "Specialized", "Cultural", "Speaking", "Grammar", "Exam Prep"]
const difficulties = ["All", "A1", "A2", "B1", "B2", "C1", "C2"]
const priceRanges = ["All", "Free", "$1-50", "$51-100", "$101-150", "$151+"]

export default function CoursesPage() {
  const { showToast, ToastContainer } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [selectedPriceRange, setSelectedPriceRange] = useState("All")
  const [sortBy, setSortBy] = useState("popularity") // popularity, rating, price, newest
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false)

  // Real curriculum data state
  const [courses, setCourses] = useState<DisplayCourse[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null)

  // Load curriculum data on component mount
  useEffect(() => {
    loadCurriculumData()
  }, [])

  const loadCurriculumData = async () => {
    try {
      setLoading(true)
      setError(null)

      const curriculumData = await curriculumService.getCurriculumData()

      // Transform curriculum data to display format
      const displayCourses: DisplayCourse[] = curriculumData.courses.map(course => {
        const courseUnits = curriculumService.getUnitsByCourse(curriculumData.units, course.id)
        const totalLessons = courseUnits.reduce((total, unit) => {
          return total + curriculumService.getLessonsByUnit(curriculumData.lessons, unit.id).length
        }, 0)

        return {
          ...course,
          instructor: "Turkish Language Institute",
          duration: `${course.estimatedHours} hours`,
          totalLessons,
          completedLessons: 0, // This would come from user progress
          difficulty: course.level,
          rating: 4.8,
          enrolledCount: 1250,
          price: course.level === 'A1' ? 99 : 149,
          category: "Complete Course",
          topics: ["Grammar", "Vocabulary", "Speaking", "Listening", "Reading", "Writing"],
          thumbnail: "/images/courses/turkish-a1.jpg",
          isEnrolled: false, // This would come from user enrollment status
          progress: 0, // This would come from user progress
          nextLesson: undefined
        }
      })

      setCourses(displayCourses)
      setUnits(curriculumData.units)
      setLessons(curriculumData.lessons)
      setExercises(curriculumData.exercises)
    } catch (err) {
      console.error('Error loading curriculum data:', err)
      setError('Failed to load courses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollCourse = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId)
      console.log("Enrolling in course:", courseId)

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update the course state to show as enrolled
      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.id === courseId
            ? {
                ...course,
                isEnrolled: true,
                progress: 0,
                nextLesson: "Basic Greetings" // First lesson
              }
            : course
        )
      )

      // In a real app, you would make an API call here:
      // await apiService.enrollInCourse(courseId)

      // Show success message with toast notification
      showToast({
        type: 'success',
        title: 'Successfully Enrolled!',
        description: 'You can now start learning. Click "Continue Learning" to begin.',
        duration: 5000
      })

      // Optionally navigate to the course content
      // window.location.href = `/course/${courseId}`

    } catch (error) {
      console.error('Error enrolling in course:', error)
      showToast({
        type: 'error',
        title: 'Enrollment Failed',
        description: 'Failed to enroll in course. Please try again.',
        duration: 5000
      })
    } finally {
      setEnrollingCourseId(null)
    }
  }

  const handleContinueCourse = (courseId: string) => {
    // Navigate to the course content page with real curriculum data
    window.location.href = `/course/${courseId}`
  }

  const filteredCourses = courses
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
    totalCourses: courses.length,
    enrolledCourses: courses.filter(c => c.isEnrolled).length,
    completedCourses: courses.filter(c => c.progress === 100).length,
    averageProgress: courses.filter(c => c.isEnrolled).length > 0
      ? Math.round(courses.filter(c => c.isEnrolled).reduce((sum, c) => sum + c.progress, 0) / courses.filter(c => c.isEnrolled).length)
      : 0
  }

  // Show loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Show error state
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-red-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold">Error Loading Courses</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={loadCurriculumData}>
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
      <ToastContainer />
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
                        disabled={enrollingCourseId === course.id}
                      >
                        {enrollingCourseId === course.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          'Enroll Now'
                        )}
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
