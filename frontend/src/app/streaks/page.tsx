"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Flame, Target, TrendingUp, Clock, Star } from "lucide-react"
import { useState, useEffect } from "react"

const streakData = {
  current: 7,
  longest: 15,
  total: 45,
  weekGoal: 5,
  monthGoal: 20
}

const weeklyActivity = [
  { day: 'Mon', date: '2024-01-15', completed: true, lessons: 3 },
  { day: 'Tue', date: '2024-01-16', completed: true, lessons: 2 },
  { day: 'Wed', date: '2024-01-17', completed: true, lessons: 4 },
  { day: 'Thu', date: '2024-01-18', completed: true, lessons: 1 },
  { day: 'Fri', date: '2024-01-19', completed: true, lessons: 2 },
  { day: 'Sat', date: '2024-01-20', completed: true, lessons: 3 },
  { day: 'Sun', date: '2024-01-21', completed: true, lessons: 2 }
]

// Fixed calendar data to prevent hydration mismatch
const generateMonthlyCalendar = () => {
  return Array.from({ length: 31 }, (_, i) => {
    const day = i + 1
    // Use deterministic pattern based on day number to avoid hydration mismatch
    const hasActivity = (day % 3) !== 0 // Every 3rd day has no activity
    const intensity = hasActivity ? ((day % 4) + 1) : 0 // Cycle through intensities 1-4
    return { day, hasActivity, intensity }
  })
}

export default function StreaksPage() {
  const [monthlyCalendar, setMonthlyCalendar] = useState<Array<{day: number, hasActivity: boolean, intensity: number}>>([])

  useEffect(() => {
    // Generate calendar data on client side to prevent hydration mismatch
    setMonthlyCalendar(generateMonthlyCalendar())
  }, [])

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Learning Streaks</h1>
            <p className="text-muted-foreground">
              Keep your momentum going with daily Turkish practice
            </p>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Flame className="h-3 w-3 text-orange-500" />
            <span>{streakData.current} Day Streak</span>
          </Badge>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Flame className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="text-3xl font-bold text-orange-600">{streakData.current}</p>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-3xl font-bold">{streakData.longest}</p>
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-3xl font-bold">{streakData.total}</p>
                  <p className="text-sm text-muted-foreground">Total Days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-purple-500" />
                <div>
                  <p className="text-3xl font-bold">85%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* This Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>This Week</span>
              <Badge variant="secondary">{weeklyActivity.filter(d => d.completed).length}/{weeklyActivity.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {weeklyActivity.map((day) => (
                <div key={day.day} className="text-center">
                  <p className="text-sm font-medium mb-2">{day.day}</p>
                  <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center ${
                    day.completed 
                      ? 'bg-green-100 border-2 border-green-300' 
                      : 'bg-gray-100 border-2 border-gray-200'
                  }`}>
                    {day.completed ? (
                      <div className="text-center">
                        <Flame className="h-4 w-4 text-orange-500 mx-auto" />
                        <p className="text-xs text-green-600 font-medium">{day.lessons}</p>
                      </div>
                    ) : (
                      <div className="w-3 h-3 bg-gray-300 rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(day.date).getDate()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>January 2024</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthlyCalendar.length > 0 ? monthlyCalendar.map((day) => (
                <div key={day.day} className="aspect-square">
                  <div className={`w-full h-full rounded-lg flex items-center justify-center text-sm ${
                    day.hasActivity
                      ? day.intensity === 1 ? 'bg-green-100 text-green-800'
                      : day.intensity === 2 ? 'bg-green-200 text-green-800'
                      : day.intensity === 3 ? 'bg-green-300 text-green-800'
                      : 'bg-green-400 text-green-900'
                      : 'bg-gray-50 text-gray-400'
                  }`}>
                    {day.day}
                  </div>
                </div>
              )) : (
                // Loading placeholder
                Array.from({ length: 31 }, (_, i) => (
                  <div key={i + 1} className="aspect-square">
                    <div className="w-full h-full rounded-lg flex items-center justify-center text-sm bg-gray-50 text-gray-400">
                      {i + 1}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <span>Less</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-100 rounded-sm" />
                <div className="w-3 h-3 bg-green-100 rounded-sm" />
                <div className="w-3 h-3 bg-green-200 rounded-sm" />
                <div className="w-3 h-3 bg-green-300 rounded-sm" />
                <div className="w-3 h-3 bg-green-400 rounded-sm" />
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Weekly Goal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Study {streakData.weekGoal} days this week</span>
                  <Badge variant="secondary">7/{streakData.weekGoal}</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((7 / streakData.weekGoal) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-green-600 font-medium">Goal achieved! 🎉</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Monthly Goal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Study {streakData.monthGoal} days this month</span>
                  <Badge variant="outline">15/{streakData.monthGoal}</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(15 / streakData.monthGoal) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">5 more days to reach your goal</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
