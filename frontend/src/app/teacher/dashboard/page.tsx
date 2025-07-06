'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Plus, 
  Settings, 
  BarChart3,
  FileText,
  Brain,
  Target,
  Clock,
  Award,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for demonstration
const mockTeacherStats = {
  totalStudents: 45,
  activeLessons: 12,
  completedLessons: 89,
  averageProgress: 73,
  weeklyEngagement: 85,
  totalCourses: 6
};

const mockRecentActivity = [
  { id: 1, type: 'lesson_completed', student: 'Ahmet K.', lesson: 'Turkish Greetings', time: '2 hours ago' },
  { id: 2, type: 'exercise_submitted', student: 'Fatma S.', lesson: 'Basic Grammar', time: '4 hours ago' },
  { id: 3, type: 'question_asked', student: 'Mehmet A.', lesson: 'Vocabulary Building', time: '6 hours ago' },
  { id: 4, type: 'lesson_started', student: 'Ayşe D.', lesson: 'Pronunciation Practice', time: '1 day ago' }
];

const mockLessons = [
  { id: 1, title: 'Turkish Greetings', students: 23, completion: 89, status: 'active' },
  { id: 2, title: 'Basic Grammar Rules', students: 18, completion: 67, status: 'active' },
  { id: 3, title: 'Vocabulary Building', students: 31, completion: 45, status: 'active' },
  { id: 4, title: 'Pronunciation Practice', students: 15, completion: 78, status: 'draft' }
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateLesson = () => {
    // Navigate to lesson creation interface
    window.location.href = '/teacher/create-lesson';
  };

  const handleViewAnalytics = () => {
    // Navigate to detailed analytics
    window.location.href = '/teacher/analytics';
  };

  const handleManageStudents = () => {
    // Navigate to student management
    window.location.href = '/teacher/students';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your Turkish language courses and track student progress</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleCreateLesson} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Lesson
              </Button>
              <Button variant="outline" onClick={handleViewAnalytics}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{mockTeacherStats.totalStudents}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Lessons</p>
                    <p className="text-2xl font-bold text-gray-900">{mockTeacherStats.activeLessons}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{mockTeacherStats.averageProgress}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Engagement</p>
                    <p className="text-2xl font-bold text-gray-900">{mockTeacherStats.weeklyEngagement}%</p>
                  </div>
                  <Award className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="tools">AI Tools</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{activity.student}</p>
                          <p className="text-sm text-gray-600">{activity.lesson}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            {activity.type.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={handleCreateLesson}
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      variant="outline"
                    >
                      <Plus className="w-6 h-6" />
                      <span>Create Lesson</span>
                    </Button>
                    <Button 
                      onClick={() => window.location.href = '/teacher/curriculum'}
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      variant="outline"
                    >
                      <BookOpen className="w-6 h-6" />
                      <span>Build Curriculum</span>
                    </Button>
                    <Button 
                      onClick={() => window.location.href = '/teacher/exercises'}
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      variant="outline"
                    >
                      <FileText className="w-6 h-6" />
                      <span>Generate Exercises</span>
                    </Button>
                    <Button 
                      onClick={handleManageStudents}
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      variant="outline"
                    >
                      <Users className="w-6 h-6" />
                      <span>Manage Students</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Lessons</CardTitle>
                  <Button onClick={handleCreateLesson}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Lesson
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                        <p className="text-sm text-gray-600">{lesson.students} students enrolled</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{lesson.completion}% completed</p>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${lesson.completion}%` }}
                            ></div>
                          </div>
                        </div>
                        <Badge variant={lesson.status === 'active' ? 'default' : 'secondary'}>
                          {lesson.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Student Management</h3>
                  <p className="text-gray-600 mb-4">View detailed student progress, analytics, and manage enrollments</p>
                  <Button onClick={handleManageStudents}>
                    View All Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>AI Content Generation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Use AI to create lessons, exercises, and curriculum content</p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => window.location.href = '/teacher/ai-lesson-creator'}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      AI Lesson Creator
                    </Button>
                    <Button 
                      onClick={() => window.location.href = '/teacher/exercise-generator'}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Exercise Generator
                    </Button>
                    <Button 
                      onClick={() => window.location.href = '/teacher/curriculum-builder'}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Curriculum Builder
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Adaptive Learning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Personalize learning experiences based on student progress</p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => window.location.href = '/teacher/adaptive-lessons'}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Adaptive Lessons
                    </Button>
                    <Button 
                      onClick={() => window.location.href = '/teacher/progress-analysis'}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Progress Analysis
                    </Button>
                    <Button 
                      onClick={() => window.location.href = '/teacher/recommendations'}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      AI Recommendations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
