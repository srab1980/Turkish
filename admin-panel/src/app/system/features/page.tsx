'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { 
  FlagIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function FeatureFlagsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState('production');

  // Mock feature flags data
  const [featureFlags, setFeatureFlags] = useState([
    {
      id: '1',
      name: 'ai_content_generation',
      displayName: 'AI Content Generation',
      description: 'Enable AI-powered content generation for lessons and exercises',
      enabled: true,
      environments: {
        development: true,
        staging: true,
        production: true
      },
      rolloutPercentage: 100,
      targetAudience: 'all',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      tags: ['ai', 'content', 'core']
    },
    {
      id: '2',
      name: 'advanced_analytics',
      displayName: 'Advanced Analytics Dashboard',
      description: 'Show detailed analytics and reporting features',
      enabled: true,
      environments: {
        development: true,
        staging: true,
        production: false
      },
      rolloutPercentage: 50,
      targetAudience: 'premium',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      tags: ['analytics', 'premium', 'dashboard']
    },
    {
      id: '3',
      name: 'voice_recognition',
      displayName: 'Voice Recognition Exercises',
      description: 'Enable voice recognition for pronunciation exercises',
      enabled: false,
      environments: {
        development: true,
        staging: false,
        production: false
      },
      rolloutPercentage: 10,
      targetAudience: 'beta',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-16'),
      tags: ['voice', 'experimental', 'exercises']
    },
    {
      id: '4',
      name: 'social_learning',
      displayName: 'Social Learning Features',
      description: 'Enable social features like study groups and peer interactions',
      enabled: false,
      environments: {
        development: false,
        staging: false,
        production: false
      },
      rolloutPercentage: 0,
      targetAudience: 'none',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-12'),
      tags: ['social', 'community', 'future']
    }
  ]);

  const environments = ['development', 'staging', 'production'];
  const audiences = ['all', 'premium', 'beta', 'none'];

  const filteredFlags = featureFlags.filter(flag => 
    flag.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flag.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flag.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleFlag = (flagId: string, environment?: string) => {
    setFeatureFlags(prev => prev.map(flag => {
      if (flag.id === flagId) {
        if (environment) {
          return {
            ...flag,
            environments: {
              ...flag.environments,
              [environment]: !flag.environments[environment as keyof typeof flag.environments]
            },
            updatedAt: new Date()
          };
        } else {
          return {
            ...flag,
            enabled: !flag.enabled,
            updatedAt: new Date()
          };
        }
      }
      return flag;
    }));
  };

  const updateRollout = (flagId: string, percentage: number) => {
    setFeatureFlags(prev => prev.map(flag => 
      flag.id === flagId 
        ? { ...flag, rolloutPercentage: percentage, updatedAt: new Date() }
        : flag
    ));
  };

  const getEnvironmentStatus = (flag: any) => {
    const envStatus = environments.map(env => ({
      env,
      enabled: flag.environments[env as keyof typeof flag.environments]
    }));
    return envStatus;
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage feature rollouts and experimental functionality
              </p>
            </div>
            <button className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Flag
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search feature flags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {environments.map(env => (
                <option key={env} value={env}>
                  {env.charAt(0).toUpperCase() + env.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature Flags List */}
        <div className="space-y-4">
          {filteredFlags.map((flag) => (
            <div key={flag.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FlagIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900">{flag.displayName}</h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{flag.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Rollout:</span>
                      <div className="mt-1 flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={flag.rolloutPercentage}
                          onChange={(e) => updateRollout(flag.id, parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-900 w-12">
                          {flag.rolloutPercentage}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Audience:</span>
                      <span className="ml-2 text-sm text-gray-600 capitalize">{flag.targetAudience}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Created:</span>
                      <span className="ml-2 text-sm text-gray-600">
                        {flag.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Updated:</span>
                      <span className="ml-2 text-sm text-gray-600">
                        {flag.updatedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Environment Status:</span>
                    <div className="flex space-x-4">
                      {getEnvironmentStatus(flag).map(({ env, enabled }) => (
                        <label key={env} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => toggleFlag(flag.id, env)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">{env}</span>
                          {enabled ? (
                            <CheckIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <XMarkIcon className="h-4 w-4 text-red-500" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {flag.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button className="rounded p-2 text-gray-400 hover:text-blue-600">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="rounded p-2 text-gray-400 hover:text-gray-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="rounded p-2 text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={flag.enabled}
                      onChange={() => toggleFlag(flag.id)}
                      className="sr-only"
                    />
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      flag.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        flag.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFlags.length === 0 && (
          <div className="text-center py-12">
            <FlagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No feature flags found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery 
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first feature flag.'
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
