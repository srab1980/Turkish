"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  BookOpen,
  Trophy,
  Zap,
  Star,
  Clock,
  Calendar,
  ExternalLink
} from "lucide-react"

interface ActivityItem {
  id: string
  type: "lesson_completed" | "achievement_unlocked" | "streak_milestone" | "level_up"
  title: string
  description: string
  timestamp: Date
  xpGained: number
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lesson_completed": return BookOpen
      case "achievement_unlocked": return Trophy
      case "streak_milestone": return Zap
      case "level_up": return Star
      default: return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "lesson_completed": return "text-blue-600 bg-blue-50"
      case "achievement_unlocked": return "text-yellow-600 bg-yellow-50"
      case "streak_milestone": return "text-orange-600 bg-orange-50"
      case "level_up": return "text-purple-600 bg-purple-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return timestamp.toLocaleDateString()
  }

  const totalXP = activities.reduce((sum, activity) => sum + activity.xpGained, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Your latest learning achievements and milestones
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>{totalXP} XP Today</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{activities.length} Activities</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No recent activity</h3>
                <p className="text-sm text-muted-foreground">
                  Start learning to see your progress here!
                </p>
                <Button className="mt-4">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </div>
            ) : (
              activities.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type)
                const colorClasses = getActivityColor(activity.type)
                
                return (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className={`p-2 rounded-full ${colorClasses}`}>
                      <ActivityIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{activity.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            +{activity.xpGained} XP
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {activities.filter(a => a.type === "lesson_completed").length}
                </div>
                <div className="text-sm text-muted-foreground">Lessons Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-yellow-50">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {activities.filter(a => a.type === "achievement_unlocked").length}
                </div>
                <div className="text-sm text-muted-foreground">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalXP}</div>
                <div className="text-sm text-muted-foreground">XP Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Button variant="outline">
          <ExternalLink className="h-4 w-4 mr-2" />
          View All Activity
        </Button>
      </div>
    </div>
  )
}
