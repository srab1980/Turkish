"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Volume2, GripVertical, RotateCcw } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface OrderingItem {
  id: string
  text: string
  correctPosition: number
}

interface OrderingProps {
  question: {
    id: string
    text: string
    items: OrderingItem[]
    audioUrl?: string
    difficulty: "easy" | "medium" | "hard"
    explanation?: string
  }
  onAnswer: (orderedItems: string[]) => void
  showResult?: boolean
  userOrder?: string[]
}

interface SortableItemProps {
  id: string
  text: string
  isCorrect?: boolean
  showResult?: boolean
  index: number
}

function SortableItem({ id, text, isCorrect, showResult, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center space-x-3 p-4 bg-background border rounded-lg cursor-move transition-all",
        isDragging && "opacity-50 shadow-lg z-50",
        showResult && isCorrect && "border-green-500 bg-green-50",
        showResult && isCorrect === false && "border-red-500 bg-red-50",
        !showResult && "hover:shadow-md hover:border-primary/50"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center space-x-2">
        <div className="text-sm font-medium text-muted-foreground min-w-[24px]">
          {index + 1}.
        </div>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 text-sm font-medium">{text}</div>
      {showResult && (
        <div className="flex-shrink-0">
          {isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      )}
    </div>
  )
}

export function Ordering({ 
  question, 
  onAnswer, 
  showResult = false, 
  userOrder = [] 
}: OrderingProps) {
  const [items, setItems] = useState<OrderingItem[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    // Shuffle items initially
    const shuffled = [...question.items].sort(() => Math.random() - 0.5)
    setItems(shuffled)
  }, [question.items])

  useEffect(() => {
    if (userOrder && userOrder.length > 0) {
      // Restore user's previous order
      const orderedItems = userOrder.map(id =>
        question.items.find(item => item.id === id)!
      ).filter(Boolean)
      if (orderedItems.length > 0) {
        setItems(orderedItems)
      }
    }
  }, [userOrder, question.items])

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over?.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Notify parent of the new order
        if (!showResult) {
          onAnswer(newItems.map(item => item.id))
        }
        
        return newItems
      })
    }
  }

  const resetOrder = () => {
    const shuffled = [...question.items].sort(() => Math.random() - 0.5)
    setItems(shuffled)
    if (!showResult) {
      onAnswer(shuffled.map(item => item.id))
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

  const isItemCorrect = (item: OrderingItem, currentIndex: number) => {
    return item.correctPosition === currentIndex
  }

  const getScore = () => {
    let correct = 0
    items.forEach((item, index) => {
      if (isItemCorrect(item, index)) correct++
    })
    return { correct, total: items.length }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Ordering Exercise</CardTitle>
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
                  onClick={resetOrder}
                  title="Shuffle items"
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
            <strong>Instructions:</strong> Drag and drop the items to arrange them in the correct order.
            {!showResult && " You can shuffle the items using the reset button."}
          </p>
        </div>

        {/* Sortable Items */}
        <div className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item, index) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  index={index}
                  isCorrect={showResult ? isItemCorrect(item, index) : undefined}
                  showResult={showResult}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

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
