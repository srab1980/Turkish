"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Volume2, RotateCcw, Link } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'

interface MatchingPair {
  id: string
  left: string
  right: string
}

interface MatchingProps {
  question: {
    id: string
    text: string
    pairs: MatchingPair[]
    audioUrl?: string
    difficulty: "easy" | "medium" | "hard"
    explanation?: string
  }
  onAnswer: (matches: Record<string, string>) => void
  showResult?: boolean
  userMatches?: Record<string, string>
}

interface DraggableItemProps {
  id: string
  text: string
  isMatched?: boolean
  isCorrect?: boolean
  showResult?: boolean
}

interface DroppableZoneProps {
  id: string
  text: string
  matchedItem?: string
  isCorrect?: boolean
  showResult?: boolean
}

function DraggableItem({ id, text, isMatched, isCorrect, showResult }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: isMatched && showResult,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 bg-background border rounded-lg cursor-move transition-all text-sm font-medium",
        isDragging && "opacity-50 shadow-lg z-50",
        isMatched && !showResult && "opacity-50 cursor-not-allowed",
        showResult && isCorrect && "border-green-500 bg-green-50",
        showResult && isCorrect === false && "border-red-500 bg-red-50",
        !isMatched && !showResult && "hover:shadow-md hover:border-primary/50"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between">
        <span>{text}</span>
        {showResult && isMatched && (
          <div className="ml-2">
            {isCorrect ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DroppableZone({ id, text, matchedItem, isCorrect, showResult }: DroppableZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-4 border-2 border-dashed rounded-lg min-h-[60px] transition-all",
        isOver && "border-primary bg-primary/5",
        !matchedItem && !isOver && "border-muted-foreground/30",
        matchedItem && !showResult && "border-primary bg-primary/5",
        showResult && isCorrect && "border-green-500 bg-green-50",
        showResult && isCorrect === false && "border-red-500 bg-red-50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{text}</div>
        {matchedItem && (
          <div className="flex items-center space-x-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{matchedItem}</span>
            {showResult && (
              <div className="ml-1">
                {isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function Matching({ 
  question, 
  onAnswer, 
  showResult = false, 
  userMatches = {} 
}: MatchingProps) {
  const [matches, setMatches] = useState<Record<string, string>>(userMatches)
  const [rightItems, setRightItems] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    // Shuffle right items initially
    const shuffled = [...question.pairs.map(pair => pair.right)].sort(() => Math.random() - 0.5)
    setRightItems(shuffled)
  }, [question.pairs])

  useEffect(() => {
    if (userMatches) {
      setMatches(userMatches)
    } else {
      setMatches({})
    }
  }, [userMatches])

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const draggedItem = active.id as string
    const dropZone = over.id as string

    // Check if dropping on a left item (drop zone)
    const leftItem = question.pairs.find(pair => pair.left === dropZone)
    if (leftItem) {
      const newMatches = { ...matches }
      
      // Remove any existing match for this drop zone
      Object.keys(newMatches).forEach(key => {
        if (newMatches[key] === dropZone) {
          delete newMatches[key]
        }
      })
      
      // Add new match
      newMatches[draggedItem] = dropZone
      
      setMatches(newMatches)
      
      if (!showResult) {
        onAnswer(newMatches)
      }
    }
  }

  const resetMatches = () => {
    setMatches({})
    const shuffled = [...question.pairs.map(pair => pair.right)].sort(() => Math.random() - 0.5)
    setRightItems(shuffled)
    if (!showResult) {
      onAnswer({})
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "hard": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const isMatchCorrect = (rightItem: string, leftItem: string) => {
    const pair = question.pairs.find(p => p.right === rightItem && p.left === leftItem)
    return !!pair
  }

  const getScore = () => {
    let correct = 0
    Object.entries(matches).forEach(([rightItem, leftItem]) => {
      if (isMatchCorrect(rightItem, leftItem)) correct++
    })
    return { correct, total: question.pairs.length }
  }

  const getMatchedRightItem = (leftItem: string) => {
    return Object.keys(matches).find(rightItem => matches[rightItem] === leftItem)
  }

  const isRightItemMatched = (rightItem: string) => {
    return rightItem in matches
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Matching Exercise</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
            {showResult && (
              <Badge variant="outline" className="text-sm">
                Score: {getScore().correct}/{getScore().total}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <p className="text-lg font-medium leading-relaxed">
              {question.text}
            </p>
            <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
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
              {!showResult && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetMatches}
                  title="Reset matches"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong> Drag items from the right column and drop them onto the matching items in the left column.
          </p>
        </div>

        {/* Matching Interface */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Drop Zones */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground mb-3">Match with:</h3>
              {question.pairs.map((pair) => {
                const matchedItem = getMatchedRightItem(pair.left)
                const isCorrect = showResult && matchedItem ? isMatchCorrect(matchedItem, pair.left) : undefined
                
                return (
                  <DroppableZone
                    key={pair.left}
                    id={pair.left}
                    text={pair.left}
                    matchedItem={matchedItem}
                    isCorrect={isCorrect}
                    showResult={showResult}
                  />
                )
              })}
            </div>

            {/* Right Column - Draggable Items */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground mb-3">Drag from here:</h3>
              {rightItems.map((item) => {
                const isMatched = isRightItemMatched(item)
                const matchedWith = matches[item]
                const isCorrect = showResult && isMatched ? isMatchCorrect(item, matchedWith) : undefined
                
                return (
                  <DraggableItem
                    key={item}
                    id={item}
                    text={item}
                    isMatched={isMatched}
                    isCorrect={isCorrect}
                    showResult={showResult}
                  />
                )
              })}
            </div>
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="p-3 bg-background border rounded-lg shadow-lg text-sm font-medium">
                {activeId}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Result and Explanation */}
        {showResult && question.explanation && (
          <div className="p-4 bg-accent/50 rounded-lg border">
            <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Explanation</span>
            </h4>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
