"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Volume2 } from "lucide-react"

interface MultipleChoiceProps {
  question: {
    id: string
    text: string
    audioUrl?: string
    options: {
      id: string
      text: string
      isCorrect: boolean
    }[]
    explanation?: string
    difficulty: "easy" | "medium" | "hard"
  }
  onAnswer: (optionId: string, isCorrect: boolean) => void
  showResult?: boolean
  selectedOption?: string
}

export function MultipleChoice({ 
  question, 
  onAnswer, 
  showResult = false, 
  selectedOption 
}: MultipleChoiceProps) {
  const [isPlaying, setIsPlaying] = useState(false)

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

  const getOptionStatus = (option: { id: string; isCorrect: boolean }) => {
    if (!showResult) return "default"
    if (selectedOption === option.id) {
      return option.isCorrect ? "correct" : "incorrect"
    }
    if (option.isCorrect) return "correct-not-selected"
    return "default"
  }

  const getOptionIcon = (option: { id: string; isCorrect: boolean }) => {
    const status = getOptionStatus(option)
    if (status === "correct" || status === "correct-not-selected") {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    if (status === "incorrect") {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    return null
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Multiple Choice
          </CardTitle>
          <Badge variant={getDifficultyColor(question.difficulty) as "default"}>
            {question.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <p className="text-lg font-medium leading-relaxed">
              {question.text}
            </p>
            {question.audioUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={playAudio}
                disabled={isPlaying}
                className="ml-4 flex-shrink-0"
              >
                <Volume2 className={cn(
                  "h-4 w-4",
                  isPlaying && "animate-pulse"
                )} />
              </Button>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => {
            const status = getOptionStatus(option)
            const isSelected = selectedOption === option.id
            
            return (
              <button
                key={option.id}
                onClick={() => !showResult && onAnswer(option.id, option.isCorrect)}
                disabled={showResult}
                className={cn(
                  "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md",
                  "flex items-center justify-between",
                  !showResult && "hover:border-primary hover:bg-accent",
                  isSelected && !showResult && "border-primary bg-accent",
                  status === "correct" && "border-green-500 bg-green-50",
                  status === "correct-not-selected" && "border-green-300 bg-green-25",
                  status === "incorrect" && "border-red-500 bg-red-50",
                  showResult && "cursor-default"
                )}
              >
                <span className={cn(
                  "font-medium",
                  status === "correct" && "text-green-700",
                  status === "incorrect" && "text-red-700"
                )}>
                  {option.text}
                </span>
                {getOptionIcon(option)}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showResult && question.explanation && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
