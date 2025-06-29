"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { LearningChart } from "@/components/dashboard/learning-chart"
import { AchievementsList } from "@/components/dashboard/achievements-list"
import { WeeklyGoals } from "@/components/dashboard/weekly-goals"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { LevelProgress } from "@/components/dashboard/level-progress"
import { StudyStreak } from "@/components/dashboard/study-streak"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar,
  TrendingUp,
  Trophy,
  Target,
  Clock,
  Star,
  BookOpen,
  Zap,
  Award,
  BarChart3,
  Activity
} from "lucide-react"

// Enhanced mock data for comprehensive dashboard
const mockUserStats = {
  currentLevel: "A1",
  levelProgress: 75,
  totalXP: 1250,
  dailyGoal: 200,
  dailyProgress: 120,
  streak: 5,
  longestStreak: 12,
  lessonsCompleted: 12,
  totalLessons: 24,
  averageAccuracy: 87,
  studyTime: 180,
  achievements: 8,
  weeklyGoal: 5,
  weeklyProgress: 3,
  monthlyXP: 4800,
  rank: 156,
  totalUsers: 2500
}

const mockLearningData = [
  { date: "2024-01-01", xp: 50, lessons: 1, time: 25 },
  { date: "2024-01-02", xp: 80, lessons: 2, time: 40 },
  { date: "2024-01-03", xp: 120, lessons: 3, time: 60 },
  { date: "2024-01-04", xp: 90, lessons: 2, time: 45 },
  { date: "2024-01-05", xp: 150, lessons: 4, time: 75 },
  { date: "2024-01-06", xp: 110, lessons: 3, time: 55 },
  { date: "2024-01-07", xp: 200, lessons: 5, time: 90 }
]

const mockAchievements = [
  {
    id: "1",
    title: "First Steps",
    description: "Complete your first lesson",
    icon: "🎯",
    xpReward: 50,
    unlockedAt: new Date("2024-01-01"),
    category: "milestone"
  },
  {
    id: "2",
    title: "Streak Master",
    description: "Study for 5 days in a row",
    icon: "🔥",
    xpReward: 100,
    unlockedAt: new Date("2024-01-05"),
    category: "streak"
  },
  {
    id: "3",
    title: "Quick Learner",
    description: "Complete 10 lessons",
    icon: "⚡",
    xpReward: 150,
    unlockedAt: new Date("2024-01-06"),
    category: "progress"
  },
  {
    id: "4",
    title: "Perfect Score",
    description: "Get 100% on 3 exercises",
    icon: "🏆",
    xpReward: 200,
    unlockedAt: new Date("2024-01-07"),
    category: "performance"
  }
]

const mockRecentActivity = [
  {
    id: "1",
    type: "lesson_completed",
    title: "Basic Greetings",
    description: "Completed with 95% accuracy",
    timestamp: new Date("2024-01-07T10:30:00"),
    xpGained: 50
  },
  {
    id: "2",
    type: "achievement_unlocked",
    title: "Perfect Score",
    description: "Unlocked new achievement",
    timestamp: new Date("2024-01-07T10:25:00"),
    xpGained: 200
  },
  {
    id: "3",
    type: "streak_milestone",
    title: "5 Day Streak",
    description: "Maintained study streak",
    timestamp: new Date("2024-01-07T09:00:00"),
    xpGained: 25
  }
]

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Track your Turkish learning progress and achievements
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Trophy className="h-3 w-3" />
              <span>Rank #{mockUserStats.rank}</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>{mockUserStats.totalXP.toLocaleString()} XP</span>
            </Badge>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <StatsOverview stats={mockUserStats} />

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Progress</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Level Progress */}
              <LevelProgress 
                currentLevel={mockUserStats.currentLevel}
                progress={mockUserStats.levelProgress}
                totalXP={mockUserStats.totalXP}
              />
              
              {/* Study Streak */}
              <StudyStreak 
                currentStreak={mockUserStats.streak}
                longestStreak={mockUserStats.longestStreak}
              />
              
              {/* Weekly Goals */}
              <WeeklyGoals 
                weeklyGoal={mockUserStats.weeklyGoal}
                weeklyProgress={mockUserStats.weeklyProgress}
              />
            </div>
            
            {/* Learning Chart */}
            <LearningChart data={mockLearningData} />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <LearningChart data={mockLearningData} />
            <div className="grid gap-6 md:grid-cols-2">
              <LevelProgress 
                currentLevel={mockUserStats.currentLevel}
                progress={mockUserStats.levelProgress}
                totalXP={mockUserStats.totalXP}
              />
              <WeeklyGoals 
                weeklyGoal={mockUserStats.weeklyGoal}
                weeklyProgress={mockUserStats.weeklyProgress}
              />
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <AchievementsList achievements={mockAchievements} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <RecentActivity activities={mockRecentActivity} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
