"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Volume2, 
  MessageSquare, 
  PenTool, 
  Brain,
  Globe,
  CheckCircle,
  Clock,
  Target,
  Play,
  Pause
} from "lucide-react"

export enum SubLessonType {
  PREPARATION = 'preparation',
  READING = 'reading',
  GRAMMAR = 'grammar',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  WRITING = 'writing',
  VOCABULARY = 'vocabulary',
  CULTURE = 'culture',
  INTERACTIVE = 'interactive',
  CLASSROOM = 'classroom',
  FUN_LEARNING = 'fun_learning',
  REVIEW = 'review',
  ASSESSMENT = 'assessment'
}

interface SubLesson {
  id: string
  lessonId: string
  title: string
  description: string
  type: SubLessonType
  content: any
  learningObjectives: string[]
  estimatedDuration: number
  difficultyLevel: number
  orderIndex: number
  isPublished: boolean
  isRequired: boolean
  audioUrl?: string
  videoUrl?: string
  imageUrls?: string[]
  exercises: any[]
  vocabularyItems: any[]
  grammarRules: any[]
  metadata?: any
  isCompleted?: boolean
  progress?: number
}

interface UnifiedLessonProps {
  lesson: {
    id: string
    title: string
    description: string
    unitTitle: string
    courseTitle: string
    level: string
    subLessons: SubLesson[]
    totalEstimatedTime: number
    overallProgress: number
  }
  onSubLessonComplete: (subLessonId: string) => void
  onLessonComplete: () => void
}

const getSubLessonIcon = (type: SubLessonType) => {
  switch (type) {
    case SubLessonType.PREPARATION: return "🎯"
    case SubLessonType.READING: return "📖"
    case SubLessonType.GRAMMAR: return "📝"
    case SubLessonType.LISTENING: return "🎧"
    case SubLessonType.SPEAKING: return "🗣️"
    case SubLessonType.WRITING: return "✍️"
    case SubLessonType.VOCABULARY: return "📚"
    case SubLessonType.CULTURE: return "🏛️"
    case SubLessonType.INTERACTIVE: return "💬"
    case SubLessonType.CLASSROOM: return "🏫"
    case SubLessonType.FUN_LEARNING: return "🎮"
    case SubLessonType.REVIEW: return "🔄"
    case SubLessonType.ASSESSMENT: return "✅"
    default: return "📄"
  }
}

const getSubLessonColor = (type: SubLessonType) => {
  switch (type) {
    case SubLessonType.PREPARATION: return "bg-blue-100 text-blue-800"
    case SubLessonType.READING: return "bg-green-100 text-green-800"
    case SubLessonType.GRAMMAR: return "bg-purple-100 text-purple-800"
    case SubLessonType.LISTENING: return "bg-orange-100 text-orange-800"
    case SubLessonType.SPEAKING: return "bg-red-100 text-red-800"
    case SubLessonType.WRITING: return "bg-indigo-100 text-indigo-800"
    case SubLessonType.VOCABULARY: return "bg-yellow-100 text-yellow-800"
    case SubLessonType.CULTURE: return "bg-pink-100 text-pink-800"
    case SubLessonType.INTERACTIVE: return "bg-cyan-100 text-cyan-800"
    case SubLessonType.REVIEW: return "bg-gray-100 text-gray-800"
    case SubLessonType.ASSESSMENT: return "bg-emerald-100 text-emerald-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

export function UnifiedLessonView({ lesson, onSubLessonComplete, onLessonComplete }: UnifiedLessonProps) {
  const [activeSubLesson, setActiveSubLesson] = useState<string>(lesson.subLessons[0]?.id || "")
  const [completedSubLessons, setCompletedSubLessons] = useState<Set<string>>(new Set())

  const currentSubLesson = lesson.subLessons.find(sl => sl.id === activeSubLesson)
  const completedCount = completedSubLessons.size
  const totalCount = lesson.subLessons.length
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleSubLessonComplete = (subLessonId: string) => {
    setCompletedSubLessons(prev => new Set([...prev, subLessonId]))
    onSubLessonComplete(subLessonId)
    
    // Auto-advance to next sub-lesson
    const currentIndex = lesson.subLessons.findIndex(sl => sl.id === subLessonId)
    if (currentIndex < lesson.subLessons.length - 1) {
      setActiveSubLesson(lesson.subLessons[currentIndex + 1].id)
    } else {
      // All sub-lessons completed
      onLessonComplete()
    }
  }

  const renderSubLessonContent = (subLesson: SubLesson) => {
    switch (subLesson.type) {
      case SubLessonType.PREPARATION:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Hazırlık Çalışmaları</h4>
              <p className="text-sm text-gray-600 mb-4">{subLesson.description}</p>
              {subLesson.learningObjectives.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Bu bölümde öğreneceğiniz:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {subLesson.learningObjectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button onClick={() => handleSubLessonComplete(subLesson.id)} className="w-full">
              Hazırlık Tamamlandı
            </Button>
          </div>
        )

      case SubLessonType.READING:
        return (
          <div className="space-y-4">
            <div className="prose max-w-none">
              <h4 className="font-semibold mb-4">📖 Okuma</h4>
              {subLesson.content?.text && (
                <div className="bg-white p-6 rounded-lg border">
                  <div dangerouslySetInnerHTML={{ __html: subLesson.content.text }} />
                </div>
              )}
              {subLesson.audioUrl && (
                <Button variant="outline" size="sm" className="mt-4">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Metni Dinle
                </Button>
              )}
            </div>
            {subLesson.exercises.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium">Okuma Alıştırmaları</h5>
                <div className="grid gap-2">
                  {subLesson.exercises.map((exercise, index) => (
                    <Button key={index} variant="outline" size="sm">
                      Alıştırma {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <Button onClick={() => handleSubLessonComplete(subLesson.id)} className="w-full">
              Okuma Tamamlandı
            </Button>
          </div>
        )

      case SubLessonType.VOCABULARY:
        return (
          <div className="space-y-4">
            <h4 className="font-semibold mb-4">📚 Kelime Listesi</h4>
            {subLesson.vocabularyItems.length > 0 ? (
              <div className="grid gap-3">
                {subLesson.vocabularyItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <span className="font-medium">{item.turkish}</span>
                      <span className="text-gray-600 ml-2">- {item.english}</span>
                    </div>
                    {item.audioUrl && (
                      <Button variant="ghost" size="sm">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Bu bölüm için kelime listesi hazırlanıyor...</p>
            )}
            <Button onClick={() => handleSubLessonComplete(subLesson.id)} className="w-full">
              Kelimeler Öğrenildi
            </Button>
          </div>
        )

      case SubLessonType.GRAMMAR:
        return (
          <div className="space-y-4">
            <h4 className="font-semibold mb-4">📝 Dilbilgisi</h4>
            {subLesson.grammarRules.length > 0 ? (
              <div className="space-y-4">
                {subLesson.grammarRules.map((rule, index) => (
                  <div key={index} className="bg-purple-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">{rule.title}</h5>
                    <p className="text-sm text-gray-700 mb-3">{rule.explanation}</p>
                    {rule.examples && (
                      <div className="space-y-1">
                        <h6 className="text-sm font-medium">Örnekler:</h6>
                        {rule.examples.map((example: string, exIndex: number) => (
                          <p key={exIndex} className="text-sm italic">• {example}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Bu bölüm için dilbilgisi kuralları hazırlanıyor...</p>
            )}
            <Button onClick={() => handleSubLessonComplete(subLesson.id)} className="w-full">
              Dilbilgisi Öğrenildi
            </Button>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">{getSubLessonIcon(subLesson.type)}</div>
              <h4 className="font-semibold mb-2">{subLesson.title}</h4>
              <p className="text-gray-600 mb-4">{subLesson.description}</p>
              <p className="text-sm text-gray-500">Bu bölüm içeriği hazırlanıyor...</p>
            </div>
            <Button onClick={() => handleSubLessonComplete(subLesson.id)} className="w-full">
              Bölümü Tamamla
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Lesson Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span>{lesson.courseTitle}</span>
                <span>•</span>
                <span>{lesson.unitTitle}</span>
                <Badge variant="outline">{lesson.level}</Badge>
              </div>
              <CardTitle className="text-2xl">{lesson.title}</CardTitle>
              <p className="text-gray-600 mt-2">{lesson.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                {completedCount} / {totalCount} bölüm tamamlandı
              </div>
              <Progress value={overallProgress} className="w-32" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sub-lesson Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ders Bölümleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lesson.subLessons.map((subLesson) => (
                <button
                  key={subLesson.id}
                  onClick={() => setActiveSubLesson(subLesson.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    activeSubLesson === subLesson.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : completedSubLessons.has(subLesson.id)
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getSubLessonIcon(subLesson.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{subLesson.title}</div>
                      <div className="text-xs opacity-75 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{subLesson.estimatedDuration} dk</span>
                      </div>
                    </div>
                    {completedSubLessons.has(subLesson.id) && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sub-lesson Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentSubLesson ? getSubLessonColor(currentSubLesson.type) : ""
                  }`}>
                    {currentSubLesson ? getSubLessonIcon(currentSubLesson.type) : ""} {currentSubLesson?.title}
                  </div>
                  {currentSubLesson?.isRequired && (
                    <Badge variant="outline" className="text-xs">Zorunlu</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{currentSubLesson?.estimatedDuration} dakika</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentSubLesson ? renderSubLessonContent(currentSubLesson) : (
                <div className="text-center py-8 text-gray-500">
                  Bir bölüm seçin
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
