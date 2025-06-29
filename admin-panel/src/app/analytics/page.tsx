'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import ReportsManager from '@/components/analytics/ReportsManager';
import { ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

type TabType = 'dashboard' | 'reports';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    {
      id: 'dashboard' as const,
      name: 'Analytics Dashboard',
      icon: ChartBarIcon,
      description: 'View real-time analytics and metrics',
    },
    {
      id: 'reports' as const,
      name: 'Reports',
      icon: DocumentTextIcon,
      description: 'Generate and manage detailed reports',
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">Analytics & Reporting</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Monitor platform performance, user engagement, and learning outcomes
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-secondary-200">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center space-x-2 border-b-2 py-4 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
                  )}
                >
                  <TabIcon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'dashboard' && <AnalyticsDashboard />}
          {activeTab === 'reports' && <ReportsManager />}
        </div>
      </div>
    </Layout>
  );
}
