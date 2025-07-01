'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Clock, 
  Award,
  Download,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalLessons: 36,
    completedLessons: 28450,
    averageProgress: 67,
    totalExercises: 240,
    completedExercises: 15680,
    averageScore: 78
  };

  const recentActivity = [
    { user: 'Ahmet Yılmaz', action: 'Completed Lesson 5', time: '2 hours ago' },
    { user: 'Fatma Demir', action: 'Started Unit 3', time: '3 hours ago' },
    { user: 'John Smith', action: 'Completed Exercise Set', time: '5 hours ago' },
    { user: 'Maria Garcia', action: 'Achieved 80% in Unit 2', time: '1 day ago' },
    { user: 'Ali Hassan', action: 'Completed Turkish Alphabet', time: '1 day ago' }
  ];

  const topPerformers = [
    { name: 'Ayşe Kaya', progress: 95, score: 92 },
    { name: 'Mehmet Öz', progress: 88, score: 89 },
    { name: 'Sarah Johnson', progress: 85, score: 87 },
    { name: 'David Wilson', progress: 82, score: 85 },
    { name: 'Emma Brown', progress: 80, score: 83 }
  ];

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    trend?: string;
    trendUp?: boolean;
  }> = ({ title, value, icon, trend, trendUp }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={`text-sm flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-3 w-3 ${!trendUp && 'rotate-180'}`} />
                {trend}
              </p>
            )}
          </div>
          <div className="text-blue-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics & Reports
          </h1>
          <p className="text-gray-600 mt-2">Track learning progress and system performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={<Users className="h-6 w-6" />}
              trend="+12% from last month"
              trendUp={true}
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers.toLocaleString()}
              icon={<Activity className="h-6 w-6" />}
              trend="+8% from last month"
              trendUp={true}
            />
            <StatCard
              title="Lessons Completed"
              value={stats.completedLessons.toLocaleString()}
              icon={<BookOpen className="h-6 w-6" />}
              trend="+25% from last month"
              trendUp={true}
            />
            <StatCard
              title="Average Progress"
              value={`${stats.averageProgress}%`}
              icon={<Target className="h-6 w-6" />}
              trend="+5% from last month"
              trendUp={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{activity.user}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-sm text-gray-600">Progress: {performer.progress}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{performer.score}%</p>
                        <p className="text-xs text-gray-500">Avg Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="New Registrations"
              value="156"
              icon={<Users className="h-6 w-6" />}
              trend="+23% this month"
              trendUp={true}
            />
            <StatCard
              title="Daily Active Users"
              value="342"
              icon={<Activity className="h-6 w-6" />}
              trend="+15% this week"
              trendUp={true}
            />
            <StatCard
              title="User Retention"
              value="78%"
              icon={<Target className="h-6 w-6" />}
              trend="+3% this month"
              trendUp={true}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Average Session Duration</span>
                  <span className="font-bold">24 minutes</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Lessons per Session</span>
                  <span className="font-bold">2.3</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Weekly Active Users</span>
                  <span className="font-bold">1,089</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Course Completion Rate</span>
                  <span className="font-bold">67%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Lessons"
              value={stats.totalLessons}
              icon={<BookOpen className="h-6 w-6" />}
            />
            <StatCard
              title="Total Exercises"
              value={stats.totalExercises}
              icon={<Target className="h-6 w-6" />}
            />
            <StatCard
              title="Avg Completion Time"
              value="18 min"
              icon={<Clock className="h-6 w-6" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Most Popular Unit</span>
                  <span className="font-bold">Unit 1: MERHABA (Hello)</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Highest Completion Rate</span>
                  <span className="font-bold">Unit 2: NEREDE? (Where?) - 89%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Most Challenging Unit</span>
                  <span className="font-bold">Unit 9: GEÇMİŞ (Past) - 45%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span>Average Exercise Score</span>
                  <span className="font-bold">{stats.averageScore}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span>Average Response Time</span>
                    <span className="font-bold text-green-600">245ms</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span>Uptime</span>
                    <span className="font-bold text-green-600">99.8%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span>Error Rate</span>
                    <span className="font-bold text-green-600">0.02%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span>Students Achieving A1 Level</span>
                    <span className="font-bold">234</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span>Average Time to Complete</span>
                    <span className="font-bold">8.5 weeks</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span>Student Satisfaction</span>
                    <span className="font-bold">4.7/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
