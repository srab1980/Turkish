'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import ContentImport from '@/components/ai-tools/ContentImport';
import ExerciseGenerator from '@/components/ai-tools/ExerciseGenerator';
import ContentReviewDashboard from '@/components/ai-review/ContentReviewDashboard';
import {
  CloudArrowUpIcon,
  SparklesIcon,
  DocumentMagnifyingGlassIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

type TabType = 'import' | 'generator' | 'review';

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('import');

  const tabs = [
    {
      id: 'import' as const,
      name: 'Content Import',
      icon: CloudArrowUpIcon,
      description: 'Import content from Istanbul Book PDFs',
    },
    {
      id: 'generator' as const,
      name: 'Exercise Generator',
      icon: SparklesIcon,
      description: 'Generate exercises automatically using AI',
    },
    {
      id: 'review' as const,
      name: 'Content Review',
      icon: DocumentMagnifyingGlassIcon,
      description: 'Review and approve AI-generated content',
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
              <BeakerIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">AI-Powered Tools</h1>
              <p className="mt-1 text-sm text-secondary-600">
                Leverage artificial intelligence to create, import, and manage educational content
              </p>
            </div>
          </div>
        </div>

        {/* Feature Overview Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'rounded-lg border p-6 text-left transition-all duration-200 hover:shadow-md',
                  activeTab === tab.id
                    ? 'border-primary-300 bg-primary-50 shadow-sm'
                    : 'border-secondary-200 bg-white hover:border-secondary-300'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={clsx(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    activeTab === tab.id ? 'bg-primary-100' : 'bg-secondary-100'
                  )}>
                    <TabIcon className={clsx(
                      'h-6 w-6',
                      activeTab === tab.id ? 'text-primary-600' : 'text-secondary-600'
                    )} />
                  </div>
                  <div>
                    <h3 className={clsx(
                      'font-medium',
                      activeTab === tab.id ? 'text-primary-900' : 'text-secondary-900'
                    )}>
                      {tab.name}
                    </h3>
                    <p className={clsx(
                      'text-sm',
                      activeTab === tab.id ? 'text-primary-600' : 'text-secondary-600'
                    )}>
                      {tab.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tabs Navigation */}
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
          {activeTab === 'import' && <ContentImport />}
          {activeTab === 'generator' && <ExerciseGenerator />}
          {activeTab === 'review' && <ContentReviewDashboard />}
        </div>
      </div>
    </Layout>
  );
}
