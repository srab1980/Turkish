"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Trophy,
  Target,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  Award,
  GraduationCap
} from "lucide-react"

const sidebarItems = [
  {
    title: "Learn",
    items: [
      {
        title: "Courses",
        href: "/courses",
        icon: GraduationCap,
        badge: "6 Available"
      },
      {
        title: "Lessons",
        href: "/lessons",
        icon: BookOpen,
        badge: "12 New"
      },
      {
        title: "Practice",
        href: "/practice",
        icon: Target,
      },
      {
        title: "Review",
        href: "/review",
        icon: Clock,
        badge: "5"
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
      },
      {
        title: "Statistics",
        href: "/stats",
        icon: TrendingUp,
      },
      {
        title: "Streak",
        href: "/streak",
        icon: Calendar,
      }
    ]
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

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
              <Badge variant="success" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                5 Day Streak
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">XP Today</span>
                <span className="font-medium">120 / 200</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        {sidebarItems.map((section) => (
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
        ))}

        {/* Current Level Info */}
        <div className="px-3 py-2">
          <div className="rounded-lg bg-gradient-to-r from-turkish-primary to-red-600 p-4 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-5 w-5" />
              <span className="font-semibold">Current Level</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>A1 Beginner</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2 bg-white/20" />
              <p className="text-xs opacity-90">
                Complete 5 more lessons to reach A2!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
