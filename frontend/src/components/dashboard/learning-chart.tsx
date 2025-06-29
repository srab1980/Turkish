"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Clock,
  Star
} from "lucide-react"

interface LearningData {
  date: string
  xp: number
  lessons: number
  time: number
}

interface LearningChartProps {
  data: LearningData[]
}

export function LearningChart({ data }: LearningChartProps) {
  const maxXP = Math.max(...data.map(d => d.xp))
  const totalXP = data.reduce((sum, d) => sum + d.xp, 0)
  const totalLessons = data.reduce((sum, d) => sum + d.lessons, 0)
  const totalTime = data.reduce((sum, d) => sum + d.time, 0)
  const avgXP = Math.round(totalXP / data.length)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Learning Progress</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your learning activity over the past week
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>{totalXP} XP</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{Math.floor(totalTime / 60)}h {totalTime % 60}m</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Chart */}
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {data.map((day, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="text-xs text-muted-foreground font-medium">
                    {formatDate(day.date).split(' ')[0]}
                  </div>
                  <div className="relative w-8 h-32 bg-secondary rounded-sm overflow-hidden">
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-turkish-red to-red-500 rounded-sm transition-all duration-500"
                      style={{ height: `${(day.xp / maxXP) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium">{day.xp}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-turkish-red">{totalXP}</div>
              <div className="text-xs text-muted-foreground">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalLessons}</div>
              <div className="text-xs text-muted-foreground">Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{avgXP}</div>
              <div className="text-xs text-muted-foreground">Avg XP/Day</div>
            </div>
          </div>

          {/* Detailed Data */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Daily Breakdown</h4>
            <div className="space-y-1">
              {data.map((day, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatDate(day.date)}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{day.xp} XP</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-blue-500" />
                      <span>{day.lessons} lessons</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-green-500" />
                      <span>{day.time}m</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
