'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';

export default function DashboardPage() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  const handleSwitchToStudent = () => {
    // Navigate to student interface directly instead of opening new window
    window.location.href = 'http://localhost:3001';
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-secondary-900 mb-8">
            Turkish Learning Admin Dashboard
          </h1>

          {/* Prominent Interface Switcher Card */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Switch to Student Interface</h3>
                <p className="text-primary-100">Experience your Turkish learning app from a student's perspective</p>
              </div>
              <button
                onClick={handleSwitchToStudent}
                className="bg-white text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Open Student Interface
              </button>
            </div>
          </div>

          {/* React Test Section */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">React Test</h2>
            <p className="text-secondary-600 mb-4">
              This is a simple test to verify React is working properly.
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCount(count + 1)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Count: {count}
              </button>
              <button
                onClick={() => setCount(0)}
                className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-primary-600">1,250</p>
              <p className="text-sm text-secondary-500">+12% from last month</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Active Courses</h3>
              <p className="text-3xl font-bold text-success-600">45</p>
              <p className="text-sm text-secondary-500">+3 new this week</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Completion Rate</h3>
              <p className="text-3xl font-bold text-accent-600">68%</p>
              <p className="text-sm text-secondary-500">+5% improvement</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/content/courses')}
                className="bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-lg text-center transition-colors"
              >
                <div className="text-sm font-medium">Add Course</div>
              </button>
              <button
                onClick={() => router.push('/users')}
                className="bg-success-500 hover:bg-success-600 text-white p-4 rounded-lg text-center transition-colors"
              >
                <div className="text-sm font-medium">Manage Users</div>
              </button>
              <button
                onClick={() => router.push('/analytics')}
                className="bg-accent-500 hover:bg-accent-600 text-white p-4 rounded-lg text-center transition-colors"
              >
                <div className="text-sm font-medium">View Analytics</div>
              </button>
              <button
                onClick={() => router.push('/ai-tools')}
                className="bg-warning-500 hover:bg-warning-600 text-white p-4 rounded-lg text-center transition-colors"
              >
                <div className="text-sm font-medium">AI Tools</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
