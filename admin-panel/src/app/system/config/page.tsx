'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { 
  CogIcon, 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function SystemConfigPage() {
  const [configs, setConfigs] = useState({
    // General Settings
    siteName: 'Turkish Learning Platform',
    siteDescription: 'Learn Turkish with AI-powered lessons and exercises',
    defaultLanguage: 'en',
    timezone: 'UTC',
    
    // Learning Settings
    maxLessonsPerDay: 10,
    defaultDifficulty: 'beginner',
    enableAudioPronunciation: true,
    enableProgressTracking: true,
    
    // AI Settings
    aiProvider: 'openai',
    aiModel: 'gpt-4',
    aiTemperature: 0.7,
    maxTokens: 2000,
    enableContentGeneration: true,
    enableAutoTranslation: true,
    
    // Security Settings
    enableTwoFactor: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    
    // Email Settings
    emailProvider: 'smtp',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    enableEmailNotifications: true,
    
    // Storage Settings
    storageProvider: 'local',
    maxFileSize: 10,
    allowedFileTypes: 'pdf,mp3,mp4,jpg,png',
    
    // Analytics Settings
    enableAnalytics: true,
    analyticsProvider: 'google',
    retentionDays: 90
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleConfigChange = (key: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setHasChanges(false);
      alert('Configuration saved successfully!');
    }, 1500);
  };

  const handleReset = () => {
    // Reset to default values
    setHasChanges(false);
  };

  const configSections = [
    {
      title: 'General Settings',
      description: 'Basic platform configuration',
      icon: CogIcon,
      fields: [
        { key: 'siteName', label: 'Site Name', type: 'text', description: 'The name of your learning platform' },
        { key: 'siteDescription', label: 'Site Description', type: 'textarea', description: 'Brief description of your platform' },
        { key: 'defaultLanguage', label: 'Default Language', type: 'select', options: [
          { value: 'en', label: 'English' },
          { value: 'tr', label: 'Turkish' },
          { value: 'es', label: 'Spanish' }
        ]},
        { key: 'timezone', label: 'Timezone', type: 'select', options: [
          { value: 'UTC', label: 'UTC' },
          { value: 'Europe/Istanbul', label: 'Europe/Istanbul' },
          { value: 'America/New_York', label: 'America/New_York' }
        ]}
      ]
    },
    {
      title: 'Learning Settings',
      description: 'Configure learning experience',
      icon: InformationCircleIcon,
      fields: [
        { key: 'maxLessonsPerDay', label: 'Max Lessons Per Day', type: 'number', min: 1, max: 50 },
        { key: 'defaultDifficulty', label: 'Default Difficulty', type: 'select', options: [
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' }
        ]},
        { key: 'enableAudioPronunciation', label: 'Enable Audio Pronunciation', type: 'boolean' },
        { key: 'enableProgressTracking', label: 'Enable Progress Tracking', type: 'boolean' }
      ]
    },
    {
      title: 'AI Settings',
      description: 'Configure AI-powered features',
      icon: ExclamationTriangleIcon,
      fields: [
        { key: 'aiProvider', label: 'AI Provider', type: 'select', options: [
          { value: 'openai', label: 'OpenAI' },
          { value: 'anthropic', label: 'Anthropic' },
          { value: 'google', label: 'Google AI' }
        ]},
        { key: 'aiModel', label: 'AI Model', type: 'text' },
        { key: 'aiTemperature', label: 'AI Temperature', type: 'number', min: 0, max: 1, step: 0.1 },
        { key: 'maxTokens', label: 'Max Tokens', type: 'number', min: 100, max: 4000 },
        { key: 'enableContentGeneration', label: 'Enable Content Generation', type: 'boolean' },
        { key: 'enableAutoTranslation', label: 'Enable Auto Translation', type: 'boolean' }
      ]
    }
  ];

  const renderField = (field: any) => {
    const value = configs[field.key as keyof typeof configs];

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => handleConfigChange(field.key, parseFloat(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );
      
      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => handleConfigChange(field.key, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        );
      
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
              <p className="mt-1 text-sm text-gray-600">
                Configure platform settings and preferences
              </p>
            </div>
            {hasChanges && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  <XMarkIcon className="mr-2 h-4 w-4" />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Sections */}
        <div className="space-y-8">
          {configSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <div key={section.title} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-6 w-6 text-gray-600" />
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">{section.title}</h2>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {section.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                        </label>
                        {renderField(field)}
                        {field.description && (
                          <p className="mt-1 text-xs text-gray-500">{field.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
