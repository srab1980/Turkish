"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { curriculumService } from "@/lib/curriculum-service"
// import { useUserProgress, useProgressUpdater } from "@/contexts/UserProgressContext" // Temporarily disabled
import { 
  Target, 
  Brain, 
  Zap, 
  BookOpen, 
  Gamepad2, 
  Clock, 
  Star,
  Trophy,
  RefreshCw,
  Play,
  CheckCircle,
  Circle
} from "lucide-react"

interface PracticeExercise {
  id: string
  title: string
  description: string
  type: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number
  xpReward: number
  category: string
  isCompleted: boolean
}

export default function PracticePage() {
  const [exercises, setExercises] = useState<PracticeExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  
  // Temporarily use mock user progress until context issue is resolved
  const userProgress = {
    dailyXP: 120,
    dailyGoal: 200,
    currentStreak: 5
  }

  // Mock progress updater
  const progressUpdater = {
    completeExercise: (type: string, difficulty: string) => {
      console.log(`Completed ${difficulty} ${type} exercise`)
    }
  }

  useEffect(() => {
    const loadPracticeExercises = async () => {
      try {
        setLoading(true)
        const curriculumData = await curriculumService.getCurriculumData()
        
        // Generate practice exercises from curriculum data
        const practiceExercises: PracticeExercise[] = []
        
        // Add vocabulary practice
        practiceExercises.push({
          id: 'vocab-flashcards',
          title: 'Vocabulary Flashcards',
          description: 'Review Turkish vocabulary with spaced repetition',
          type: 'flashcards',
          difficulty: 'easy',
          estimatedTime: 10,
          xpReward: 20,
          category: 'Vocabulary',
          isCompleted: false
        })
        
        // Add grammar exercises
        practiceExercises.push({
          id: 'grammar-builder',
          title: 'Sentence Builder',
          description: 'Practice Turkish sentence structure and grammar',
          type: 'sentence_builder',
          difficulty: 'medium',
          estimatedTime: 15,
          xpReward: 30,
          category: 'Grammar',
          isCompleted: false
        })
        
        // Add pronunciation practice
        practiceExercises.push({
          id: 'pronunciation',
          title: 'Pronunciation Practice',
          description: 'Improve your Turkish pronunciation with speech recognition',
          type: 'speech_recognition',
          difficulty: 'medium',
          estimatedTime: 12,
          xpReward: 25,
          category: 'Speaking',
          isCompleted: false
        })
        
        // Add picture matching
        practiceExercises.push({
          id: 'picture-match',
          title: 'Picture Matching',
          description: 'Match Turkish words with their corresponding images',
          type: 'picture_matching',
          difficulty: 'easy',
          estimatedTime: 8,
          xpReward: 15,
          category: 'Vocabulary',
          isCompleted: false
        })
        
        // Add word scramble
        practiceExercises.push({
          id: 'word-scramble',
          title: 'Word Scramble',
          description: 'Unscramble Turkish words to test your spelling',
          type: 'word_scramble',
          difficulty: 'medium',
          estimatedTime: 10,
          xpReward: 20,
          category: 'Spelling',
          isCompleted: false
        })
        
        // Add reading comprehension
        practiceExercises.push({
          id: 'reading-comp',
          title: 'Reading Comprehension',
          description: 'Read Turkish texts and answer comprehension questions',
          type: 'interactive_reading',
          difficulty: 'hard',
          estimatedTime: 20,
          xpReward: 40,
          category: 'Reading',
          isCompleted: false
        })
        
        // Add mini games
        practiceExercises.push({
          id: 'memory-game',
          title: 'Memory Match',
          description: 'Match Turkish words in this fun memory game',
          type: 'mini_games',
          difficulty: 'easy',
          estimatedTime: 5,
          xpReward: 10,
          category: 'Games',
          isCompleted: false
        })
        
        // Add error detection
        practiceExercises.push({
          id: 'error-detection',
          title: 'Error Detection',
          description: 'Find and correct errors in Turkish sentences',
          type: 'error_detection',
          difficulty: 'hard',
          estimatedTime: 15,
          xpReward: 35,
          category: 'Grammar',
          isCompleted: false
        })
        
        setExercises(practiceExercises)
      } catch (error) {
        console.error('Failed to load practice exercises:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPracticeExercises()
  }, [])

  const categories = ["All", "Vocabulary", "Grammar", "Speaking", "Reading", "Spelling", "Games"]
  const difficulties = ["All", "easy", "medium", "hard"]

  const filteredExercises = exercises.filter(exercise => {
    const matchesCategory = selectedCategory === "All" || exercise.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "All" || exercise.difficulty === selectedDifficulty
    return matchesCategory && matchesDifficulty
  })

  const handleStartExercise = (exercise: PracticeExercise) => {
    // For now, simulate completing the exercise
    progressUpdater.completeExercise(exercise.type, exercise.difficulty)
    
    // In a real app, you would navigate to the specific exercise
    alert(`Starting ${exercise.title}! You earned ${exercise.xpReward} XP!`)
  }

  const stats = {
    totalExercises: exercises.length,
    completedToday: Math.floor(Math.random() * 5) + 1,
    totalXPAvailable: exercises.reduce((sum, ex) => sum + ex.xpReward, 0),
    averageTime: Math.round(exercises.reduce((sum, ex) => sum + ex.estimatedTime, 0) / exercises.length)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Practice Turkish
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Loading practice exercises...
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-3 text-lg text-gray-600">Preparing exercises...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Practice Turkish
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sharpen your Turkish skills with targeted practice exercises
          </p>
        </div>

        {/* Daily Progress */}
        {userProgress && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Daily Practice Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>XP Progress</span>
                  <span>{userProgress.dailyXP} / {userProgress.dailyGoal} XP</span>
                </div>
                <Progress value={(userProgress.dailyXP / userProgress.dailyGoal) * 100} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
                    <div className="text-sm text-muted-foreground">Completed Today</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{userProgress.currentStreak}</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.totalXPAvailable}</div>
                    <div className="text-sm text-muted-foreground">XP Available</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{stats.averageTime}min</div>
                    <div className="text-sm text-muted-foreground">Avg Time</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{exercise.title}</CardTitle>
                    <CardDescription>{exercise.description}</CardDescription>
                  </div>
                  <Badge variant={exercise.difficulty === 'easy' ? 'secondary' : exercise.difficulty === 'medium' ? 'default' : 'destructive'}>
                    {exercise.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {exercise.estimatedTime} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {exercise.xpReward} XP
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleStartExercise(exercise)}
                    className="w-full"
                    size="lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters to see more exercises
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
