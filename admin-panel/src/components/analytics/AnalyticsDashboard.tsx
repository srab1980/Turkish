'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-hot-toast';
import apiClient from '@/lib/api';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  loading?: boolean;
}

function MetricCard({ title, value, change, changeType, icon: Icon, color, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-lg border border-secondary-200 bg-white p-6">
        <div className="flex items-center">
          <div className={clsx('flex-shrink-0 p-3 rounded-lg', color)}>
            <div className="h-6 w-6 bg-white/30 rounded"></div>
          </div>
          <div className="ml-4 flex-1 space-y-2">
            <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
            <div className="h-6 bg-secondary-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-secondary-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center">
        <div className={clsx('flex-shrink-0 p-3 rounded-lg', color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-2xl font-semibold text-secondary-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-1">
              {changeType === 'increase' ? (
                <ArrowUpIcon className="h-4 w-4 mr-1 text-success-500" />
              ) : changeType === 'decrease' ? (
                <ArrowDownIcon className="h-4 w-4 mr-1 text-error-500" />
              ) : (
                <div className="h-4 w-4 mr-1" />
              )}
              <span
                className={clsx(
                  'text-sm font-medium',
                  changeType === 'increase' ? 'text-success-600' : 
                  changeType === 'decrease' ? 'text-error-600' : 'text-secondary-600'
                )}
              >
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'courses' | 'engagement'>('users');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => apiClient.getAnalytics(),
  });

  const { data: userMetricsData } = useQuery({
    queryKey: ['user-metrics', dateRange],
    queryFn: () => apiClient.getUserAnalytics('all'),
  });

  const analytics = analyticsData?.data;
  

  const metrics = useMemo(() => [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      change: analytics?.metrics?.userGrowth || 0,
      changeType: (analytics?.metrics?.userGrowth || 0) >= 0 ? 'increase' as const : 'decrease' as const,
      icon: UserGroupIcon,
      color: 'bg-primary-500',
    },
    {
      title: 'Active Learners',
      value: analytics?.activeUsers || 0,
      change: analytics?.metrics?.activeUserGrowth || 0,
      changeType: (analytics?.metrics?.activeUserGrowth || 0) >= 0 ? 'increase' as const : 'decrease' as const,
      icon: UserGroupIcon,
      color: 'bg-success-500',
    },
    {
      title: 'Total Courses',
      value: analytics?.totalCourses || 0,
      change: analytics?.metrics?.courseGrowth || 0,
      changeType: (analytics?.metrics?.courseGrowth || 0) >= 0 ? 'increase' as const : 'decrease' as const,
      icon: BookOpenIcon,
      color: 'bg-warning-500',
    },
    {
      title: 'Completion Rate',
      value: analytics?.metrics?.completionRate ? `${analytics?.completionRate}%` : '0%',
      change: analytics?.metrics?.completionRateChange || 0,
      changeType: (analytics?.metrics?.completionRateChange || 0) >= 0 ? 'increase' as const : 'decrease' as const,
      icon: ChartBarIcon,
      color: 'bg-error-500',
    },
  ], [analytics]);

  const chartData = useMemo(() => {
    if (!analytics?.metrics?.chartData) return [];
    return analytics?.chartData.map((item: any) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString(),
    }));
  }, [analytics]);

  const pieData = useMemo(() => [
    { name: 'Beginner (A1-A2)', value: analytics?.metrics?.levelDistribution?.beginner || 0, color: '#3B82F6' },
    { name: 'Intermediate (B1-B2)', value: analytics?.metrics?.levelDistribution?.intermediate || 0, color: '#10B981' },
    { name: 'Advanced (C1-C2)', value: analytics?.metrics?.levelDistribution?.advanced || 0, color: '#F59E0B' },
  ], [analytics]);

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateRange, format: 'csv' }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${dateRange}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Analytics data exported successfully');
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Monitor learning progress, user engagement, and platform performance
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportData}
            className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricCard {...metric} loading={isLoading} />
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg border border-secondary-200 bg-white p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-secondary-900">User Growth</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedMetric('users')}
                className={clsx(
                  'rounded-lg px-3 py-1 text-sm font-medium',
                  selectedMetric === 'users'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-600 hover:text-secondary-900'
                )}
              >
                Users
              </button>
              <button
                onClick={() => setSelectedMetric('courses')}
                className={clsx(
                  'rounded-lg px-3 py-1 text-sm font-medium',
                  selectedMetric === 'courses'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-600 hover:text-secondary-900'
                )}
              >
                Courses
              </button>
              <button
                onClick={() => setSelectedMetric('engagement')}
                className={clsx(
                  'rounded-lg px-3 py-1 text-sm font-medium',
                  selectedMetric === 'engagement'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-600 hover:text-secondary-900'
                )}
              >
                Engagement
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Level Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg border border-secondary-200 bg-white p-6"
        >
          <h3 className="mb-4 text-lg font-medium text-secondary-900">Proficiency Level Distribution</h3>
          
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-lg border border-secondary-200 bg-white p-6"
      >
        <h3 className="mb-4 text-lg font-medium text-secondary-900">Learning Progress Overview</h3>
        
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="lessonsCompleted" fill="#3B82F6" name="Lessons Completed" />
              <Bar dataKey="exercisesCompleted" fill="#10B981" name="Exercises Completed" />
              <Bar dataKey="studyTime" fill="#F59E0B" name="Study Time (hours)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-lg border border-secondary-200 bg-white p-6"
      >
        <h3 className="mb-4 text-lg font-medium text-secondary-900">Recent Platform Activity</h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-secondary-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : analytics?.recentActivity ? (
          <div className="space-y-4">
            {analytics.recentActivity.map((activity: any, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                    <CalendarIcon className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900">
                    {activity.description}
                  </p>
                  <p className="text-sm text-secondary-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-secondary-500">No recent activity data available</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
