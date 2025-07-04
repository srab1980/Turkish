"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { curriculumService, type CurriculumData } from "@/lib/curriculum-service"
import { useUserProgress } from "@/contexts/UserProgressContext"
import {
  BookOpen,
  Trophy,
  Target,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  Award,
  GraduationCap,
  Users,
  MessageCircle,
  Settings,
  HelpCircle,
  Zap,
  Brain,
  Globe
} from "lucide-react"

// Sidebar-specific user progress interface
interface SidebarUserProgress {
  currentStreak: number;
  dailyXP: number;
  dailyGoal: number;
  totalXP: number;
  level: string;
  levelProgress: number;
  completedLessons: number;
  totalLessons: number;
  achievements: number;
}

// Dynamic sidebar data interface
interface SidebarData {
  curriculumData: CurriculumData | null;
  userProgress: SidebarUserProgress;
  loading: boolean;
}

// Generate dynamic sidebar items based on real data
const generateSidebarItems = (data: SidebarData) => {
  const { curriculumData, userProgress } = data;

  const coursesCount = curriculumData?.courses?.length || 0;
  const lessonsCount = curriculumData?.lessons?.length || 0;
  const unitsCount = curriculumData?.units?.length || 0;
  const exercisesCount = curriculumData?.exercises?.length || 0;

  // Calculate new lessons (lessons not completed)
  const newLessonsCount = Math.max(0, lessonsCount - userProgress.completedLessons);

  // Calculate review items (completed lessons that need review)
  const reviewCount = Math.floor(userProgress.completedLessons * 0.3); // 30% need review

  return [
    {
      title: "Learn",
      items: [
        {
          title: "Courses",
          href: "/courses",
          icon: GraduationCap,
          badge: coursesCount > 0 ? `${coursesCount} Available` : "Loading..."
        },
        {
          title: "Lessons",
          href: "/lessons",
          icon: BookOpen,
          badge: newLessonsCount > 0 ? `${newLessonsCount} New` : "All Complete"
        },
        {
          title: "Practice",
          href: "/practice",
          icon: Target,
          badge: exercisesCount > 0 ? `${exercisesCount} Exercises` : undefined
        },
        {
          title: "Review",
          href: "/review",
          icon: Clock,
          badge: reviewCount > 0 ? `${reviewCount}` : undefined
        }
      ]
    },
    {
      title: "Progress",
      items: [
        {
          title: "Achievements",
          href: "/achievements",
          icon: Trophy,
          badge: userProgress.achievements > 0 ? `${userProgress.achievements}` : undefined
        },
        {
          title: "Statistics",
          href: "/statistics",
          icon: TrendingUp,
        },
        {
          title: "Streaks",
          href: "/streaks",
          icon: Calendar,
          badge: userProgress.currentStreak > 0 ? `${userProgress.currentStreak} Days` : undefined
        }
      ]
    },
    {
      title: "Community",
      items: [
        {
          title: "Study Groups",
          href: "/groups",
          icon: Users,
        },
        {
          title: "Discussions",
          href: "/discussions",
          icon: MessageCircle,
          badge: "3 New"
        },
        {
          title: "Turkish Culture",
          href: "/culture",
          icon: Globe,
        }
      ]
    },
    {
      title: "Tools",
      items: [
        {
          title: "Vocabulary",
          href: "/vocabulary",
          icon: Brain,
        },
        {
          title: "Quick Practice",
          href: "/quick-practice",
          icon: Zap,
        },
        {
          title: "Settings",
          href: "/settings",
          icon: Settings,
        },
        {
          title: "Help",
          href: "/help",
          icon: HelpCircle,
        }
      ]
    }
  ];
};

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { userProgress: contextUserProgress, loading: progressLoading } = useUserProgress()
  const [curriculumData, setCurriculumData] = useState<CurriculumData | null>(null)
  const [curriculumLoading, setCurriculumLoading] = useState(true)

  // Load curriculum data on component mount
  useEffect(() => {
    const loadCurriculumData = async () => {
      try {
        setCurriculumLoading(true)
        const data = await curriculumService.getCurriculumData()
        setCurriculumData(data)
      } catch (error) {
        console.error('Failed to load curriculum data:', error)
      } finally {
        setCurriculumLoading(false)
      }
    }

    loadCurriculumData()
  }, [])

  // Create sidebar data from user progress and curriculum
  const sidebarData: SidebarData = {
    curriculumData,
    userProgress: contextUserProgress ? {
      currentStreak: contextUserProgress.currentStreak,
      dailyXP: contextUserProgress.dailyXP,
      dailyGoal: contextUserProgress.dailyGoal,
      totalXP: contextUserProgress.totalXP,
      level: contextUserProgress.level,
      levelProgress: contextUserProgress.levelProgress,
      completedLessons: contextUserProgress.completedLessons.length,
      totalLessons: curriculumData?.lessons.length || contextUserProgress.totalLessons,
      achievements: contextUserProgress.achievements.length
    } : {
      currentStreak: 0,
      dailyXP: 0,
      dailyGoal: 200,
      totalXP: 0,
      level: "A1 Beginner",
      levelProgress: 0,
      completedLessons: 0,
      totalLessons: 0,
      achievements: 0
    },
    loading: progressLoading || curriculumLoading
  }

  const sidebarItems = generateSidebarItems(sidebarData)
  const { userProgress: sidebarUserProgress } = sidebarData

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        {/* User Progress Summary */}
        <div className="px-3 py-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Daily Goal
              </h2>
              <Badge variant="secondary" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                {sidebarUserProgress.currentStreak} Day Streak
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">XP Today</span>
                <span className="font-medium">{sidebarUserProgress.dailyXP} / {sidebarUserProgress.dailyGoal}</span>
              </div>
              <Progress value={(sidebarUserProgress.dailyXP / sidebarUserProgress.dailyGoal) * 100} className="h-2" />
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        {sidebarData.loading ? (
          <div className="px-3 py-2">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-100 rounded"></div>
                    <div className="h-8 bg-gray-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          sidebarItems.map((section) => (
            <div key={section.title} className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Current Level Info */}
        <div className="px-3 py-2">
          <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-5 w-5" />
              <span className="font-semibold">Current Level</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{sidebarUserProgress.level}</span>
                <span>{sidebarUserProgress.levelProgress}%</span>
              </div>
              <Progress value={sidebarUserProgress.levelProgress} className="h-2 bg-white/20" />
              <p className="text-xs opacity-90">
                Complete {sidebarUserProgress.totalLessons - sidebarUserProgress.completedLessons} more lessons to reach A2!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-600">{sidebarUserProgress.completedLessons}</div>
              <div className="text-xs text-green-700">Completed</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-600">{sidebarUserProgress.totalXP}</div>
              <div className="text-xs text-blue-700">Total XP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
