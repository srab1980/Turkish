'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import SystemSettings from '@/components/system/SystemSettings';
import FeatureFlags from '@/components/system/FeatureFlags';
import { CogIcon, FlagIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

type TabType = 'settings' | 'features';

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState<TabType>('settings');

  const tabs = [
    {
      id: 'settings' as const,
      name: 'System Settings',
      icon: CogIcon,
      description: 'Manage application configuration and settings',
    },
    {
      id: 'features' as const,
      name: 'Feature Flags',
      icon: FlagIcon,
      description: 'Control feature rollouts and A/B testing',
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">System Configuration</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage system settings, feature flags, and application configuration
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
          {activeTab === 'settings' && <SystemSettings />}
          {activeTab === 'features' && <FeatureFlags />}
        </div>
      </div>
    </Layout>
  );
}
