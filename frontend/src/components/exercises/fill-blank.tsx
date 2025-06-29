"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Volume2, Lightbulb } from "lucide-react"

interface FillBlankProps {
  question: {
    id: string
    text: string
    blanks: {
      id: string
      correctAnswer: string
      alternatives?: string[]
      hint?: string
    }[]
    audioUrl?: string
    difficulty: "easy" | "medium" | "hard"
    explanation?: string
  }
  onAnswer: (answers: Record<string, string>) => void
  showResult?: boolean
  userAnswers?: Record<string, string>
}

export function FillBlank({ 
  question, 
  onAnswer, 
  showResult = false, 
  userAnswers = {} 
}: FillBlankProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(userAnswers)
  const [showHints, setShowHints] = useState<Record<string, boolean>>({})
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setAnswers(userAnswers)
  }, [JSON.stringify(userAnswers)])

  const playAudio = async () => {
    if (!question.audioUrl) return

    setIsPlaying(true)
    try {
      const audio = new Audio(question.audioUrl)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => {
        console.warn("Audio file not found:", question.audioUrl)
        setIsPlaying(false)
      }
      await audio.play()
    } catch (error) {
      console.warn("Audio playback not available:", error.message)
      setIsPlaying(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "success"
      case "medium": return "warning"
      case "hard": return "destructive"
      default: return "secondary"
    }
  }

  const handleAnswerChange = (blankId: string, value: string) => {
    const newAnswers = { ...answers, [blankId]: value }
    setAnswers(newAnswers)
    if (!showResult) {
      onAnswer(newAnswers)
    }
  }

  const toggleHint = (blankId: string) => {
    setShowHints(prev => ({ ...prev, [blankId]: !prev[blankId] }))
  }

  const isAnswerCorrect = (blankId: string) => {
    const blank = question.blanks.find(b => b.id === blankId)
    if (!blank) return false
    
    const userAnswer = answers[blankId]?.toLowerCase().trim()
    const correctAnswer = blank.correctAnswer.toLowerCase().trim()
    const alternatives = blank.alternatives?.map(alt => alt.toLowerCase().trim()) || []
    
    return userAnswer === correctAnswer || alternatives.includes(userAnswer)
  }

  const renderTextWithBlanks = () => {
    const text = question.text
    let blankIndex = 0
    
    return text.split(/(\[BLANK\])/).map((part, index) => {
      if (part === "[BLANK]") {
        const blank = question.blanks[blankIndex]
        if (!blank) return null
        
        const isCorrect = showResult ? isAnswerCorrect(blank.id) : null
        blankIndex++
        
        return (
          <span key={index} className="inline-flex items-center space-x-2 mx-1">
            <div className="relative">
              <Input
                value={answers[blank.id] || ""}
                onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                disabled={showResult}
                className={cn(
                  "w-32 text-center font-medium",
                  showResult && isCorrect && "border-green-500 bg-green-50",
                  showResult && !isCorrect && "border-red-500 bg-red-50"
                )}
                placeholder="___"
              />
              {showResult && (
                <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {blank.hint && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleHint(blank.id)}
                className="p-1 h-6 w-6"
              >
                <Lightbulb className="h-3 w-3" />
              </Button>
            )}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Fill in the Blanks
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={getDifficultyColor(question.difficulty) as "default"}>
              {question.difficulty}
            </Badge>
            {question.audioUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={playAudio}
                disabled={isPlaying}
              >
                <Volume2 className={cn(
                  "h-4 w-4",
                  isPlaying && "animate-pulse"
                )} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question with blanks */}
        <div className="text-lg leading-relaxed p-4 bg-accent/50 rounded-lg">
          {renderTextWithBlanks()}
        </div>

        {/* Hints */}
        {Object.entries(showHints).some(([, show]) => show) && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Hints:</h4>
            {question.blanks.map((blank) => 
              showHints[blank.id] && blank.hint ? (
                <div key={blank.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    💡 {blank.hint}
                  </p>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Show correct answers if wrong */}
        {showResult && (
          <div className="space-y-4">
            {question.blanks.some(blank => !isAnswerCorrect(blank.id)) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Correct Answers:</h4>
                <div className="space-y-1">
                  {question.blanks.map((blank) => (
                    <div key={blank.id} className="text-sm text-blue-800">
                      <span className="font-medium">Blank {question.blanks.indexOf(blank) + 1}:</span> {blank.correctAnswer}
                      {blank.alternatives && blank.alternatives.length > 0 && (
                        <span className="text-blue-600"> (or: {blank.alternatives.join(", ")})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {question.explanation && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Explanation</h4>
                <p className="text-green-800 text-sm leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
