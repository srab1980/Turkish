"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  Award, 
  Star,
  Calendar,
  Target,
  Zap,
  Filter
} from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  unlockedAt?: Date
  category: "milestone" | "streak" | "progress" | "performance"
}

interface AchievementsListProps {
  achievements: Achievement[]
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "milestone": return Target
      case "streak": return Calendar
      case "progress": return Zap
      case "performance": return Trophy
      default: return Award
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "milestone": return "bg-blue-50 text-blue-600 border-blue-200"
      case "streak": return "bg-orange-50 text-orange-600 border-orange-200"
      case "progress": return "bg-green-50 text-green-600 border-green-200"
      case "performance": return "bg-purple-50 text-purple-600 border-purple-200"
      default: return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const totalXP = achievements.reduce((sum, achievement) => sum + achievement.xpReward, 0)
  const categories = [...new Set(achievements.map(a => a.category))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Achievements</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Your learning milestones and accomplishments
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Award className="h-3 w-3" />
                <span>{achievements.length} Unlocked</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>{totalXP} XP Earned</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const categoryAchievements = achievements.filter(a => a.category === category)
              const CategoryIcon = getCategoryIcon(category)
              return (
                <div key={category} className="text-center space-y-2">
                  <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${getCategoryColor(category)}`}>
                    <CategoryIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{categoryAchievements.length}</div>
                    <div className="text-xs text-muted-foreground capitalize">{category}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => {
          const CategoryIcon = getCategoryIcon(achievement.category)
          return (
            <Card key={achievement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getCategoryColor(achievement.category)}`}
                      >
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {achievement.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{achievement.xpReward} XP</span>
                      </Badge>
                      {achievement.unlockedAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(achievement.unlockedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Achievement Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Next Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🎓</div>
                <div>
                  <h4 className="font-medium">Level Up</h4>
                  <p className="text-sm text-muted-foreground">Reach A2 level</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">75% Complete</div>
                <div className="text-xs text-muted-foreground">250 XP reward</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📚</div>
                <div>
                  <h4 className="font-medium">Bookworm</h4>
                  <p className="text-sm text-muted-foreground">Complete 25 lessons</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">48% Complete</div>
                <div className="text-xs text-muted-foreground">300 XP reward</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <h4 className="font-medium">Speed Demon</h4>
                  <p className="text-sm text-muted-foreground">Complete 5 lessons in one day</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">0% Complete</div>
                <div className="text-xs text-muted-foreground">400 XP reward</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
