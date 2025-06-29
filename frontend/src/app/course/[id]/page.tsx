"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle, 
  Lock,
  Download,
  Share2,
  Heart,
  Award,
  Target,
  TrendingUp
} from "lucide-react"

// Mock course data
const mockCourseData = {
  "beginner-turkish": {
    id: "beginner-turkish",
    title: "Complete Turkish for Beginners",
    description: "Master the fundamentals of Turkish language with our comprehensive beginner course based on Istanbul Book A1-A2 curriculum. This course covers all essential aspects of Turkish language learning including grammar, vocabulary, pronunciation, and cultural context.",
    instructor: {
      name: "Dr. Ayşe Demir",
      bio: "PhD in Turkish Linguistics, 15+ years teaching experience",
      avatar: "/images/instructors/ayse-demir.jpg",
      rating: 4.9,
      students: 12500
    },
    duration: "12 weeks",
    totalLessons: 48,
    completedLessons: 12,
    difficulty: "A1-A2" as const,
    rating: 4.9,
    reviewCount: 1250,
    enrolledCount: 2450,
    price: 99,
    originalPrice: 149,
    category: "Complete Course",
    language: "Turkish",
    subtitles: ["English", "Turkish"],
    lastUpdated: "2024-01-15",
    certificate: true,
    downloadable: true,
    lifetime: true,
    isEnrolled: true,
    progress: 25,
    nextLesson: "Lesson 13: Past Tense",
    topics: ["Grammar", "Vocabulary", "Speaking", "Listening", "Reading", "Writing"],
    learningOutcomes: [
      "Understand and use basic Turkish phrases and expressions",
      "Introduce yourself and others in Turkish",
      "Ask and answer questions about personal details",
      "Interact in simple conversations about familiar topics",
      "Read and understand simple texts in Turkish",
      "Write short, simple texts about yourself and your interests"
    ],
    requirements: [
      "No prior Turkish language experience required",
      "Computer or mobile device with internet connection",
      "Willingness to practice speaking and listening",
      "Dedication to study 30-60 minutes per day"
    ],
    curriculum: [
      {
        module: "Module 1: Getting Started",
        lessons: [
          { id: 1, title: "Turkish Alphabet and Pronunciation", duration: "15 min", completed: true, locked: false },
          { id: 2, title: "Basic Greetings and Introductions", duration: "20 min", completed: true, locked: false },
          { id: 3, title: "Numbers 1-100", duration: "18 min", completed: true, locked: false },
          { id: 4, title: "Days, Months, and Time", duration: "22 min", completed: true, locked: false }
        ]
      },
      {
        module: "Module 2: Personal Information",
        lessons: [
          { id: 5, title: "Family Members", duration: "25 min", completed: true, locked: false },
          { id: 6, title: "Occupations and Workplaces", duration: "20 min", completed: true, locked: false },
          { id: 7, title: "Countries and Nationalities", duration: "18 min", completed: true, locked: false },
          { id: 8, title: "Personal Descriptions", duration: "30 min", completed: true, locked: false }
        ]
      },
      {
        module: "Module 3: Daily Life",
        lessons: [
          { id: 9, title: "Daily Routines", duration: "28 min", completed: true, locked: false },
          { id: 10, title: "Food and Drinks", duration: "25 min", completed: true, locked: false },
          { id: 11, title: "Shopping and Prices", duration: "22 min", completed: true, locked: false },
          { id: 12, title: "Transportation", duration: "20 min", completed: true, locked: false }
        ]
      },
      {
        module: "Module 4: Grammar Foundations",
        lessons: [
          { id: 13, title: "Past Tense", duration: "35 min", completed: false, locked: false },
          { id: 14, title: "Future Tense", duration: "30 min", completed: false, locked: false },
          { id: 15, title: "Question Formation", duration: "25 min", completed: false, locked: true },
          { id: 16, title: "Possessive Forms", duration: "28 min", completed: false, locked: true }
        ]
      }
    ]
  }
}

export default function CoursePage() {
  const params = useParams()
  const courseId = params.id as string
  const course = mockCourseData[courseId as keyof typeof mockCourseData]
  
  const [activeTab, setActiveTab] = useState("overview")

  if (!course) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist.</p>
          <Button onClick={() => window.location.href = "/courses"}>
            Browse All Courses
          </Button>
        </div>
      </MainLayout>
    )
  }

  const handleStartLesson = (lessonId: number) => {
    window.location.href = `/lesson/${lessonId}`
  }

  const handleEnrollCourse = () => {
    console.log("Enrolling in course:", courseId)
    // Handle course enrollment
  }

  const totalDuration = course.curriculum.reduce((total, module) => 
    total + module.lessons.reduce((moduleTotal, lesson) => 
      moduleTotal + parseInt(lesson.duration), 0), 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Course Header */}
        <div className="bg-gradient-to-r from-turkish-red/10 to-red-600/10 rounded-lg p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{course.difficulty}</Badge>
                <Badge variant="outline">{course.category}</Badge>
              </div>
              
              <h1 className="text-3xl font-bold font-display">
                {course.title}
              </h1>
              
              <p className="text-lg text-muted-foreground">
                {course.description}
              </p>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span>({course.reviewCount.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{course.enrolledCount.toLocaleString()} students</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{Math.round(totalDuration / 60)} hours total</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <img 
                  src={course.instructor.avatar} 
                  alt={course.instructor.name}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.name)}&background=dc2626&color=fff`
                  }}
                />
                <span className="text-sm">
                  Created by <span className="font-medium text-primary">{course.instructor.name}</span>
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        ${course.price}
                      </div>
                      {course.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          ${course.originalPrice}
                        </div>
                      )}
                    </div>

                    {course.isEnrolled ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        <Button onClick={() => handleStartLesson(13)} className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          Next: {course.nextLesson}
                        </p>
                      </div>
                    ) : (
                      <Button onClick={handleEnrollCourse} className="w-full" size="lg">
                        Enroll Now
                      </Button>
                    )}

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration} duration</span>
                      </div>
                      {course.certificate && (
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4" />
                          <span>Certificate included</span>
                        </div>
                      )}
                      {course.lifetime && (
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Lifetime access</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Heart className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <div className="flex space-x-8">
            {[
              { id: "overview", label: "Overview" },
              { id: "curriculum", label: "Curriculum" },
              { id: "instructor", label: "Instructor" },
              { id: "reviews", label: "Reviews" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>What You'll Learn</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "curriculum" && (
              <div className="space-y-4">
                {course.curriculum.map((module, moduleIndex) => (
                  <Card key={moduleIndex}>
                    <CardHeader>
                      <CardTitle className="text-lg">{module.module}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {module.lessons.map((lesson) => (
                          <div 
                            key={lesson.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              lesson.completed 
                                ? "bg-green-50 border-green-200" 
                                : lesson.locked 
                                ? "bg-gray-50 border-gray-200" 
                                : "bg-blue-50 border-blue-200"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {lesson.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : lesson.locked ? (
                                <Lock className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Play className="h-5 w-5 text-blue-500" />
                              )}
                              <div>
                                <div className="font-medium text-sm">{lesson.title}</div>
                                <div className="text-xs text-muted-foreground">{lesson.duration}</div>
                              </div>
                            </div>
                            {!lesson.locked && (
                              <Button 
                                size="sm" 
                                variant={lesson.completed ? "outline" : "default"}
                                onClick={() => handleStartLesson(lesson.id)}
                              >
                                {lesson.completed ? "Review" : "Start"}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "instructor" && (
              <Card>
                <CardHeader>
                  <CardTitle>About the Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <img 
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-16 h-16 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.name)}&background=dc2626&color=fff`
                      }}
                    />
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{course.instructor.name}</h3>
                      <p className="text-muted-foreground">{course.instructor.bio}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{course.instructor.rating} instructor rating</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{course.instructor.students.toLocaleString()} students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "reviews" && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Reviews coming soon</h3>
                    <p className="text-muted-foreground">
                      Student reviews and ratings will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span>{course.totalLessons} lessons</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>{Math.round(totalDuration / 60)} hours of content</span>
                </div>
                {course.downloadable && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Download className="h-4 w-4 text-purple-500" />
                    <span>Downloadable resources</span>
                  </div>
                )}
                {course.certificate && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span>Certificate of completion</span>
                  </div>
                )}
                {course.lifetime && (
                  <div className="flex items-center space-x-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span>Lifetime access</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Topics Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.topics.map((topic, index) => (
                    <Badge key={index} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
