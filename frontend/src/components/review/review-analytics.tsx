'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock, 
  Brain, 
  Star,
  BarChart3,
  Activity
} from 'lucide-react'
import { SpacedRepetitionService, SpacedRepetitionStats, ReviewSession } from '@/lib/spaced-repetition'

interface ReviewAnalyticsProps {
  className?: string
}

export function ReviewAnalytics({ className }: ReviewAnalyticsProps) {
  const [stats, setStats] = useState<SpacedRepetitionStats | null>(null)
  const [recentSessions, setRecentSessions] = useState<ReviewSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = () => {
    try {
      const currentStats = SpacedRepetitionService.getStats()
      const sessions = SpacedRepetitionService.getReviewSessions()
      
      setStats(currentStats)
      setRecentSessions(sessions.slice(-7)) // Last 7 sessions
      setLoading(false)
    } catch (error) {
      console.error('Error loading analytics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No review data available yet.</p>
      </div>
    )
  }

  const progressPercentage = Math.min((stats.dailyProgress / stats.dailyGoal) * 100, 100)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.itemsLearned}</div>
                <div className="text-sm text-muted-foreground">Items Learned</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.averageAccuracy}%</div>
                <div className="text-sm text-muted-foreground">Avg Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.streakDays}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalReviews}</div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Daily Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Today's Goal</span>
              <Badge variant={progressPercentage >= 100 ? "default" : "secondary"}>
                {stats.dailyProgress} / {stats.dailyGoal} items
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{stats.dailyGoal} items</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Due Items */}
      {stats.itemsDue > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>Items Due for Review</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">{stats.itemsDue}</div>
                <div className="text-sm text-muted-foreground">
                  {stats.itemsDue === 1 ? 'item needs' : 'items need'} your attention
                </div>
              </div>
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Review Now
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Review */}
      {stats.nextReviewTime && stats.itemsDue === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Next Review Session</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-lg font-medium text-muted-foreground">
                {stats.nextReviewTime.toLocaleDateString()} at{' '}
                {stats.nextReviewTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {Math.ceil((stats.nextReviewTime.getTime() - Date.now()) / (1000 * 60 * 60))} hours from now
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Recent Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.slice(-5).reverse().map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm">
                      <div className="font-medium">
                        {session.startTime.toLocaleDateString()}
                      </div>
                      <div className="text-muted-foreground">
                        {session.timeSpent} min • {session.itemsReviewed} items
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={session.accuracy >= 80 ? "default" : session.accuracy >= 60 ? "secondary" : "destructive"}>
                      {session.accuracy}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Performance Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.averageAccuracy >= 85 && (
              <div className="flex items-center space-x-2 text-green-600">
                <Star className="h-4 w-4" />
                <span className="text-sm">Excellent accuracy! You're mastering the material.</span>
              </div>
            )}
            
            {stats.streakDays >= 7 && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Great consistency! {stats.streakDays} days in a row.</span>
              </div>
            )}
            
            {stats.itemsLearned >= 50 && (
              <div className="flex items-center space-x-2 text-purple-600">
                <Target className="h-4 w-4" />
                <span className="text-sm">Impressive progress! {stats.itemsLearned} items learned.</span>
              </div>
            )}
            
            {stats.itemsDue > 10 && (
              <div className="flex items-center space-x-2 text-orange-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Consider reviewing more frequently to stay on track.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
