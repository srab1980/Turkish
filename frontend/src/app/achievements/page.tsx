"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Target, Zap, BookOpen, Calendar, Award, Lock } from "lucide-react"

const achievements = [
  {
    id: 1,
    title: "First Steps",
    description: "Complete your first Turkish lesson",
    icon: BookOpen,
    progress: 100,
    unlocked: true,
    category: "Learning",
    points: 50,
    unlockedDate: "2024-01-15"
  },
  {
    id: 2,
    title: "Week Warrior",
    description: "Study for 7 consecutive days",
    icon: Calendar,
    progress: 100,
    unlocked: true,
    category: "Consistency",
    points: 100,
    unlockedDate: "2024-01-22"
  },
  {
    id: 3,
    title: "Vocabulary Master",
    description: "Learn 100 new Turkish words",
    icon: Star,
    progress: 75,
    unlocked: false,
    category: "Vocabulary",
    points: 200,
    current: 75,
    target: 100
  },
  {
    id: 4,
    title: "Grammar Guru",
    description: "Complete all grammar exercises in Level A1",
    icon: Target,
    progress: 60,
    unlocked: false,
    category: "Grammar",
    points: 150,
    current: 12,
    target: 20
  },
  {
    id: 5,
    title: "Speed Learner",
    description: "Complete 5 lessons in one day",
    icon: Zap,
    progress: 40,
    unlocked: false,
    category: "Speed",
    points: 75,
    current: 2,
    target: 5
  },
  {
    id: 6,
    title: "Turkish Scholar",
    description: "Reach Level B1 proficiency",
    icon: Award,
    progress: 0,
    unlocked: false,
    category: "Proficiency",
    points: 500,
    current: 0,
    target: 1
  }
]

const categories = ["All", "Learning", "Consistency", "Vocabulary", "Grammar", "Speed", "Proficiency"]

export default function AchievementsPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
            <p className="text-muted-foreground">
              Track your progress and unlock rewards as you learn Turkish
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Trophy className="h-3 w-3" />
              <span>4 Unlocked</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>425 Points</span>
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-sm text-muted-foreground">Unlocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">425</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">67%</p>
                  <p className="text-sm text-muted-foreground">Completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === "All" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            return (
              <Card key={achievement.id} className={`relative ${achievement.unlocked ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${achievement.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {achievement.unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-600">{achievement.points} pts</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    {achievement.description}
                  </p>
                  
                  {achievement.unlocked ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.current || 0}/{achievement.target || 100}</span>
                      </div>
                      <Progress value={achievement.progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </MainLayout>
  )
}
