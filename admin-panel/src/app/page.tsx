'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Turkish Learning Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive admin panel for managing Turkish language learning content, users, and analytics
          </p>
        </header>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

          {/* Dashboard */}
          <Link href="/dashboard" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-blue-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  📊
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">Dashboard</h3>
              </div>
              <p className="text-gray-600">
                Overview of platform statistics, user activity, and system status
              </p>
            </div>
          </Link>

          {/* Users Management */}
          <Link href="/users" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-green-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  👥
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">Users</h3>
              </div>
              <p className="text-gray-600">
                Manage student accounts, progress tracking, and user permissions
              </p>
            </div>
          </Link>

          {/* Content Management */}
          <Link href="/content" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-purple-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  📚
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">Content</h3>
              </div>
              <p className="text-gray-600">
                Create and manage Turkish lessons, exercises, and learning materials
              </p>
            </div>
          </Link>

          {/* Analytics */}
          <Link href="/analytics" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-orange-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  📈
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">Analytics</h3>
              </div>
              <p className="text-gray-600">
                Detailed reports on learning progress, engagement, and platform usage
              </p>
            </div>
          </Link>

          {/* AI Tools */}
          <Link href="/ai-tools" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-indigo-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  🤖
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">AI Tools</h3>
              </div>
              <p className="text-gray-600">
                AI-powered content generation, translation, and learning assistance
              </p>
            </div>
          </Link>

          {/* System Settings */}
          <Link href="/system" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-red-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  ⚙️
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">System</h3>
              </div>
              <p className="text-gray-600">
                Platform configuration, security settings, and system maintenance
              </p>
            </div>
          </Link>

        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">1,250</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">45</div>
              <div className="text-sm text-gray-600">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">68%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-600">System Uptime</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500">
          <p>Turkish Learning Platform Admin Panel v1.0</p>
        </footer>
      </div>
    </div>
  );
}
