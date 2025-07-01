"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  BookOpen, 
  Brain, 
  Zap,
  Calendar,
  Award,
  Users
} from "lucide-react"

const stats = {
  totalLessons: 45,
  completedLessons: 32,
  totalTime: 2340, // minutes
  averageScore: 87,
  wordsLearned: 234,
  streakDays: 7,
  level: "A2",
  nextLevel: "B1",
  levelProgress: 65
}

const weeklyProgress = [
  { day: 'Mon', lessons: 3, time: 45 },
  { day: 'Tue', lessons: 2, time: 30 },
  { day: 'Wed', lessons: 4, time: 60 },
  { day: 'Thu', lessons: 1, time: 15 },
  { day: 'Fri', lessons: 2, time: 30 },
  { day: 'Sat', lessons: 3, time: 45 },
  { day: 'Sun', lessons: 2, time: 30 }
]

const skillBreakdown = [
  { skill: 'Vocabulary', progress: 85, level: 'Advanced' },
  { skill: 'Grammar', progress: 72, level: 'Intermediate' },
  { skill: 'Listening', progress: 68, level: 'Intermediate' },
  { skill: 'Speaking', progress: 45, level: 'Beginner' },
  { skill: 'Reading', progress: 78, level: 'Intermediate' },
  { skill: 'Writing', progress: 52, level: 'Beginner' }
]

const recentAchievements = [
  { title: 'Week Warrior', date: '2024-01-21', points: 100 },
  { title: 'Grammar Master', date: '2024-01-18', points: 150 },
  { title: 'Speed Learner', date: '2024-01-15', points: 75 }
]

export default function StatisticsPage() {
  const completionRate = Math.round((stats.completedLessons / stats.totalLessons) * 100)
  const hoursStudied = Math.floor(stats.totalTime / 60)
  const minutesStudied = stats.totalTime % 60

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Learning Statistics</h1>
            <p className="text-muted-foreground">
              Track your Turkish learning progress and performance
            </p>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Award className="h-3 w-3" />
            <span>Level {stats.level}</span>
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.completedLessons}</p>
                  <p className="text-sm text-muted-foreground">Lessons Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{hoursStudied}h {minutesStudied}m</p>
                  <p className="text-sm text-muted-foreground">Time Studied</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.wordsLearned}</p>
                  <p className="text-sm text-muted-foreground">Words Learned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.averageScore}%</p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Course Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Overall Completion</span>
                <span className="text-sm font-medium">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-3" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Level Progress ({stats.level} → {stats.nextLevel})</span>
                <span className="text-sm font-medium">{stats.levelProgress}%</span>
              </div>
              <Progress value={stats.levelProgress} className="h-3" />
              
              <div className="pt-2 text-sm text-muted-foreground">
                {stats.totalLessons - stats.completedLessons} lessons remaining to complete the course
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyProgress.map((day) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium w-8">{day.day}</span>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-3 w-3 text-blue-500" />
                        <span className="text-sm">{day.lessons} lessons</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-green-500" />
                      <span className="text-sm">{day.time}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Skills Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillBreakdown.map((skill) => (
                <div key={skill.skill} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{skill.skill}</span>
                    <Badge variant="outline">{skill.level}</Badge>
                  </div>
                  <Progress value={skill.progress} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{skill.progress}%</span>
                    <span>Progress</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Recent Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">+{achievement.points} pts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Leaderboard Position</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div>
                  <p className="text-4xl font-bold text-blue-600">#12</p>
                  <p className="text-muted-foreground">This Week</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">#8</p>
                    <p className="text-sm text-muted-foreground">All Time</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">#15</p>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                </div>
                <Badge variant="outline" className="mt-4">
                  Top 5% of learners
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
