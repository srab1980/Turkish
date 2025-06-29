'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Turkish Learning Admin Dashboard
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">React Test</h2>
          <p className="text-gray-600 mb-4">
            This is a simple test to verify React is working properly.
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCount(count + 1)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Count: {count}
            </button>
            <button
              onClick={() => setCount(0)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">1,250</p>
            <p className="text-sm text-gray-500">+12% from last month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Courses</h3>
            <p className="text-3xl font-bold text-green-600">45</p>
            <p className="text-sm text-gray-500">+3 new this week</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-purple-600">68%</p>
            <p className="text-sm text-gray-500">+5% improvement</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-center">
              <div className="text-sm font-medium">Add Course</div>
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg text-center">
              <div className="text-sm font-medium">Manage Users</div>
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg text-center">
              <div className="text-sm font-medium">View Analytics</div>
            </button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg text-center">
              <div className="text-sm font-medium">AI Tools</div>
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-900">Frontend Application</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-900">Backend API</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ⚠ Development Mode
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">AI Services</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                ℹ Mock Data
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
