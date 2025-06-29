"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Star,
  BookOpen,
  Zap
} from "lucide-react"

interface StatsOverviewProps {
  stats: {
    currentLevel: string
    levelProgress: number
    totalXP: number
    dailyGoal: number
    dailyProgress: number
    streak: number
    lessonsCompleted: number
    totalLessons: number
    averageAccuracy: number
    studyTime: number
    achievements: number
  }
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: "Current Level",
      value: stats.currentLevel,
      subtitle: `${stats.levelProgress}% to next level`,
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      progress: stats.levelProgress
    },
    {
      title: "Daily Goal",
      value: `${stats.dailyProgress}/${stats.dailyGoal} XP`,
      subtitle: `${Math.round((stats.dailyProgress / stats.dailyGoal) * 100)}% complete`,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      progress: (stats.dailyProgress / stats.dailyGoal) * 100
    },
    {
      title: "Study Streak",
      value: `${stats.streak} days`,
      subtitle: "Keep it up!",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Lessons Completed",
      value: `${stats.lessonsCompleted}/${stats.totalLessons}`,
      subtitle: `${Math.round((stats.lessonsCompleted / stats.totalLessons) * 100)}% complete`,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      progress: (stats.lessonsCompleted / stats.totalLessons) * 100
    },
    {
      title: "Average Accuracy",
      value: `${stats.averageAccuracy}%`,
      subtitle: "Great job!",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Study Time",
      value: `${Math.floor(stats.studyTime / 60)}h ${stats.studyTime % 60}m`,
      subtitle: "This week",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Progress</h2>
          <p className="text-muted-foreground">
            Track your Turkish learning journey
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Star className="h-3 w-3" />
            <span>{stats.totalXP.toLocaleString()} XP</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Trophy className="h-3 w-3" />
            <span>{stats.achievements} Achievements</span>
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.subtitle}
                </p>
                {stat.progress !== undefined && (
                  <Progress value={stat.progress} className="h-2" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Continue Learning</p>
                <p className="text-xs text-muted-foreground">Resume your lesson</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Practice</p>
                <p className="text-xs text-muted-foreground">Review vocabulary</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-sm">Achievements</p>
                <p className="text-xs text-muted-foreground">View your badges</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-sm">Statistics</p>
                <p className="text-xs text-muted-foreground">Detailed analytics</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
