"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { MultipleChoice } from "@/components/exercises/multiple-choice"
import { FillBlank } from "@/components/exercises/fill-blank"
import { Matching } from "@/components/exercises/matching"
import { Ordering } from "@/components/exercises/ordering"
import { Speaking } from "@/components/exercises/speaking"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, BookOpen, Volume2, CheckCircle, XCircle } from "lucide-react"

// Mock lesson data
const mockLesson = {
  id: "1",
  title: "Basic Greetings",
  description: "Learn how to say hello, goodbye, and introduce yourself in Turkish",
  difficulty: "A1",
  totalSteps: 11,
  currentStep: 1,
  steps: [
    {
      id: "intro",
      type: "introduction",
      title: "Welcome to Basic Greetings",
      content: "In this lesson, you'll learn essential Turkish greetings and how to introduce yourself. These phrases are fundamental for any conversation in Turkish.",
      audioUrl: undefined // Audio files not yet available
    },
    {
      id: "vocab1",
      type: "vocabulary",
      title: "Common Greetings",
      vocabulary: [
        { turkish: "Merhaba", english: "Hello", pronunciation: "mer-ha-BA", audioUrl: undefined },
        { turkish: "Günaydın", english: "Good morning", pronunciation: "gün-ay-DIN", audioUrl: undefined },
        { turkish: "İyi akşamlar", english: "Good evening", pronunciation: "i-yi ak-sham-LAR", audioUrl: undefined },
        { turkish: "Hoşça kal", english: "Goodbye", pronunciation: "hosh-CHA kal", audioUrl: undefined }
      ]
    },
    {
      id: "exercise1",
      type: "multiple-choice",
      question: {
        id: "mc1",
        text: "How do you say 'Hello' in Turkish?",
        difficulty: "A1",
        audioUrl: undefined, // Audio files not yet available
        options: [
          { id: "a", text: "Merhaba", isCorrect: true },
          { id: "b", text: "Günaydın", isCorrect: false },
          { id: "c", text: "İyi akşamlar", isCorrect: false },
          { id: "d", text: "Hoşça kal", isCorrect: false }
        ],
        explanation: "Merhaba is the most common way to say hello in Turkish, suitable for any time of day."
      }
    },
    {
      id: "vocab2",
      type: "vocabulary",
      title: "Introductions",
      vocabulary: [
        { turkish: "Benim adım...", english: "My name is...", pronunciation: "be-nim a-DIM", audioUrl: undefined },
        { turkish: "Ben...", english: "I am...", pronunciation: "ben", audioUrl: undefined },
        { turkish: "Tanıştığımıza memnun oldum", english: "Nice to meet you", pronunciation: "ta-nish-ti-gi-mi-za mem-NUN ol-dum", audioUrl: undefined }
      ]
    },
    {
      id: "exercise2",
      type: "fill-blank",
      question: {
        id: "fb1",
        text: "Complete the introduction: [BLANK] adım Ahmet.",
        difficulty: "A1",
        audioUrl: undefined, // Audio files not yet available
        blanks: [
          {
            id: "blank1",
            correctAnswer: "Benim",
            alternatives: ["benim"],
            hint: "This word means 'my' in Turkish"
          }
        ],
        explanation: "Benim adım means 'My name is' in Turkish."
      }
    },
    {
      id: "exercise3",
      type: "matching",
      question: {
        id: "match1",
        text: "Match the Turkish greetings with their English meanings:",
        difficulty: "A1",
        audioUrl: undefined,
        pairs: [
          { id: "pair1", left: "Merhaba", right: "Hello" },
          { id: "pair2", left: "Günaydın", right: "Good morning" },
          { id: "pair3", left: "İyi akşamlar", right: "Good evening" },
          { id: "pair4", left: "Hoşça kal", right: "Goodbye" }
        ],
        explanation: "These are the most common Turkish greetings used in daily conversation."
      }
    },
    {
      id: "exercise4",
      type: "ordering",
      question: {
        id: "order1",
        text: "Put these words in the correct order to form: 'My name is Ahmet'",
        difficulty: "A1",
        audioUrl: undefined,
        items: [
          { id: "word1", text: "Benim", correctPosition: 0 },
          { id: "word2", text: "adım", correctPosition: 1 },
          { id: "word3", text: "Ahmet", correctPosition: 2 }
        ],
        explanation: "In Turkish, 'Benim adım Ahmet' means 'My name is Ahmet'."
      }
    },
    {
      id: "exercise5",
      type: "speaking",
      question: {
        id: "speak1",
        text: "Practice saying this Turkish greeting:",
        expectedText: "Merhaba, benim adım Ahmet",
        difficulty: "A1",
        audioUrl: undefined,
        explanation: "This phrase means 'Hello, my name is Ahmet' in Turkish.",
        hints: [
          "Pronounce 'Merhaba' as 'mer-ha-BA' with stress on the last syllable",
          "Say 'benim' as 'be-NIM' with a clear 'n' sound",
          "Pronounce 'adım' as 'a-DIM' with stress on the second syllable"
        ]
      }
    }
  ]
}

export default function LessonPage() {
  const params = useParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [stepResults, setStepResults] = useState<Record<number, boolean>>({})

  const lesson = mockLesson
  const currentStepData = lesson.steps[currentStep]
  const progress = ((currentStep + 1) / lesson.totalSteps) * 100

  const handleNext = () => {
    if (currentStep < lesson.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepComplete = (success: boolean) => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    setStepResults(prev => ({ ...prev, [currentStep]: success }))
    
    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentStep < lesson.steps.length - 1) {
        handleNext()
      }
    }, 1500)
  }

  const renderStep = () => {
    switch (currentStepData.type) {
      case "introduction":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>{currentStepData.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg leading-relaxed">{currentStepData.content}</p>
              {currentStepData.audioUrl && (
                <Button variant="outline" size="sm">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Listen
                </Button>
              )}
              <div className="pt-4">
                <Button onClick={() => handleStepComplete(true)} className="w-full">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case "vocabulary":
        return (
          <Card>
            <CardHeader>
              <CardTitle>{currentStepData.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {currentStepData.vocabulary?.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-xl font-semibold text-turkish-red">{item.turkish}</div>
                        <div className="text-gray-600">{item.english}</div>
                        <div className="text-sm text-gray-500 italic">{item.pronunciation}</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <Button onClick={() => handleStepComplete(true)} className="w-full">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case "multiple-choice":
        return (
          <MultipleChoice
            question={currentStepData.question}
            onAnswer={(optionId: string, isCorrect: boolean) => {
              handleStepComplete(isCorrect)
            }}
          />
        )

      case "fill-blank":
        return (
          <FillBlank
            question={currentStepData.question}
            onAnswer={(answers: Record<string, string>) => {
              // Check if all answers are correct
              const isCorrect = Object.entries(answers).every(([blankId, answer]) => {
                const blank = currentStepData.question.blanks.find(b => b.id === blankId)
                return blank && (
                  answer.toLowerCase().trim() === blank.correctAnswer.toLowerCase().trim() ||
                  blank.alternatives?.some(alt => alt.toLowerCase().trim() === answer.toLowerCase().trim())
                )
              })
              handleStepComplete(isCorrect)
            }}
          />
        )

      case "matching":
        return (
          <Matching
            question={currentStepData.question}
            onAnswer={(matches: Record<string, string>) => {
              // Check if all matches are correct
              const isCorrect = Object.entries(matches).every(([rightItem, leftItem]) => {
                const pair = currentStepData.question.pairs.find(p => p.right === rightItem && p.left === leftItem)
                return !!pair
              }) && Object.keys(matches).length === currentStepData.question.pairs.length
              handleStepComplete(isCorrect)
            }}
          />
        )

      case "ordering":
        return (
          <Ordering
            question={currentStepData.question}
            onAnswer={(orderedItems: string[]) => {
              // Check if all items are in correct order
              const isCorrect = orderedItems.every((itemId, index) => {
                const item = currentStepData.question.items.find(i => i.id === itemId)
                return item && item.correctPosition === index
              })
              handleStepComplete(isCorrect)
            }}
          />
        )

      case "speaking":
        return (
          <Speaking
            question={currentStepData.question}
            onAnswer={async (audioBlob: Blob, transcript?: string) => {
              // For now, simulate speech analysis
              // In production, this would call the AI speech processing service
              try {
                // Mock API call to speech processing service
                const formData = new FormData()
                formData.append('audio', audioBlob)
                formData.append('expected_text', currentStepData.question.expectedText)
                formData.append('exercise_type', 'pronunciation')

                // Simulate processing delay
                await new Promise(resolve => setTimeout(resolve, 2000))

                // Mock result - in production this would come from the AI service
                const mockScore = Math.floor(Math.random() * 30) + 70 // 70-100%
                const isCorrect = mockScore >= 70

                handleStepComplete(isCorrect)
              } catch (error) {
                console.error('Speech analysis failed:', error)
                // Still allow progression on error
                handleStepComplete(true)
              }
            }}
          />
        )

      default:
        return <div>Unknown step type</div>
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Lesson Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lessons
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              <p className="text-muted-foreground">{lesson.description}</p>
            </div>
          </div>
          <Badge variant="secondary">{lesson.difficulty}</Badge>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{currentStep + 1} of {lesson.totalSteps}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {lesson.steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentStep
                    ? "bg-primary"
                    : completedSteps.has(index)
                    ? stepResults[index]
                      ? "bg-green-500"
                      : "bg-red-500"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <Button 
            onClick={handleNext}
            disabled={currentStep === lesson.steps.length - 1}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Completion Status */}
        {currentStep === lesson.steps.length - 1 && completedSteps.has(currentStep) && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-xl font-semibold text-green-800">Lesson Complete!</h3>
                <p className="text-green-700">Great job! You've completed the Basic Greetings lesson.</p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline">Review Lesson</Button>
                  <Button>Next Lesson</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
