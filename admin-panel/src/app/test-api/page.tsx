'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getUsers({});
      setResult(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getCourses({});
      setResult(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getAnalytics();
      setResult(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          API Test Page
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test API Endpoints</h2>
          
          <div className="space-x-4 mb-6">
            <button
              onClick={testUsers}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test Users API
            </button>
            <button
              onClick={testCourses}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test Courses API
            </button>
            <button
              onClick={testAnalytics}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test Analytics API
            </button>
          </div>

          {loading && (
            <div className="text-blue-600">Loading...</div>
          )}

          {error && (
            <div className="text-red-600 mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
