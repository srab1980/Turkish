'use client';

import { useState } from 'react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

  const analyticsData = {
    totalUsers: 1234,
    activeUsers: 890,
    newUsers: 45,
    completionRate: 68,
    totalLessons: 36,
    completedLessons: 2840,
    totalExercises: 75,
    completedExercises: 8920,
    averageSessionTime: 28.5,
    retentionRate: 76.8
  };

  const recentActivity = [
    { id: 1, type: 'user_registered', description: 'New user registered: Sarah Johnson', time: '2 hours ago', icon: '👤' },
    { id: 2, type: 'lesson_completed', description: 'Lesson completed: Basic Greetings', time: '3 hours ago', icon: '✅' },
    { id: 3, type: 'course_enrolled', description: 'User enrolled in Turkish A1 Course', time: '5 hours ago', icon: '📚' },
    { id: 4, type: 'exercise_completed', description: 'Exercise completed: Greeting Vocabulary', time: '6 hours ago', icon: '🎯' },
    { id: 5, type: 'user_login', description: 'User logged in: Ahmet Yılmaz', time: '8 hours ago', icon: '🔐' }
  ];

  const topLessons = [
    { id: 1, title: 'Basic Greetings', completions: 450, rating: 4.8 },
    { id: 2, title: 'Introducing Yourself', completions: 420, rating: 4.7 },
    { id: 3, title: 'Family Members', completions: 380, rating: 4.9 },
    { id: 4, title: 'Personal Information', completions: 350, rating: 4.6 },
    { id: 5, title: 'Polite Expressions', completions: 320, rating: 4.8 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track platform performance and user engagement</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">↗ +12% from last week</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.activeUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">↗ +8% from last week</p>
            </div>
            <div className="text-3xl">🟢</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.completionRate}%</p>
              <p className="text-xs text-green-600 mt-1">↗ +5% from last week</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Session Time</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.averageSessionTime}min</p>
              <p className="text-xs text-green-600 mt-1">↗ +3% from last week</p>
            </div>
            <div className="text-3xl">⏱️</div>
          </div>
        </div>
      </div>

      {/* Content Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Lessons</span>
              <span className="font-semibold">{analyticsData.totalLessons}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Lessons</span>
              <span className="font-semibold">{analyticsData.completedLessons.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Exercises</span>
              <span className="font-semibold">{analyticsData.totalExercises}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Exercises</span>
              <span className="font-semibold">{analyticsData.completedExercises.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Retention Rate</span>
              <span className="font-semibold">{analyticsData.retentionRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Lessons</h3>
          <div className="space-y-3">
            {topLessons.map((lesson, index) => (
              <div key={lesson.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                    <p className="text-xs text-gray-500">{lesson.completions} completions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm font-medium">{lesson.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  activity.type === 'user_registered' ? 'bg-green-100 text-green-700' :
                  activity.type === 'lesson_completed' ? 'bg-blue-100 text-blue-700' :
                  activity.type === 'course_enrolled' ? 'bg-purple-100 text-purple-700' :
                  activity.type === 'exercise_completed' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {activity.type.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Progress Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress Over Time</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-600">Chart visualization would go here</p>
            <p className="text-sm text-gray-500">Integration with charting library needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
