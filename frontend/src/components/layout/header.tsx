"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  User,
  Settings,
  Trophy,
  Menu,
  X,
  Globe,
  GraduationCap,
  BarChart3,
  ArrowLeftRight,
  Shield,
  ChevronDown
} from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showInterfaceMenu, setShowInterfaceMenu] = useState(false)
  const [currentInterface, setCurrentInterface] = useState<'user' | 'admin'>('user')
  const interfaceMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (interfaceMenuRef.current && !interfaceMenuRef.current.contains(event.target as Node)) {
        setShowInterfaceMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInterfaceSwitch = (mode: 'user' | 'admin') => {
    setCurrentInterface(mode)
    setShowInterfaceMenu(false)

    if (mode === 'admin') {
      // Navigate to admin interface on same port
      window.location.href = '/admin'
    } else {
      // Navigate back to student interface
      window.location.href = '/'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-turkish-red rounded-lg">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            Türkçe Öğren
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/dashboard"
            className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/courses"
            className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Courses</span>
          </Link>
          <Link
            href="/lessons"
            className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span>Lessons</span>
          </Link>
          <Link 
            href="/profile" 
            className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </nav>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Level A1
          </Badge>

          {/* Interface Switcher */}
          <div className="relative hidden md:block" ref={interfaceMenuRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInterfaceMenu(!showInterfaceMenu)}
              className="flex items-center space-x-2 text-sm"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span className="hidden lg:block">
                {currentInterface === 'user' ? 'Student' : 'Admin'}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>

            {showInterfaceMenu && (
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg bg-background border shadow-lg">
                <div className="p-3">
                  <h3 className="text-sm font-medium mb-3">Switch Interface</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleInterfaceSwitch('user')}
                      className={`w-full flex items-start space-x-3 rounded-lg p-3 text-left transition-colors ${
                        currentInterface === 'user'
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted border border-transparent'
                      }`}
                    >
                      <GraduationCap className="h-5 w-5 mt-0.5 text-primary" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Student Interface
                          {currentInterface === 'user' && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Learn Turkish with interactive lessons
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleInterfaceSwitch('admin')}
                      className={`w-full flex items-start space-x-3 rounded-lg p-3 text-left transition-colors ${
                        currentInterface === 'admin'
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted border border-transparent'
                      }`}
                    >
                      <Shield className="h-5 w-5 mt-0.5 text-orange-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Admin Interface
                          {currentInterface === 'admin' && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Manage content, users, and analytics
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container px-4 py-4 space-y-3">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/courses"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Courses</span>
            </Link>
            <Link
              href="/lessons"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen className="h-4 w-4" />
              <span>Lessons</span>
            </Link>
            <Link 
              href="/profile" 
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <div className="pt-2 border-t">
              <Badge variant="secondary" className="mb-2">
                Level A1
              </Badge>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
