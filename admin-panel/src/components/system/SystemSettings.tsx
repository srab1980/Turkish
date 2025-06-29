'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CogIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import apiClient from '@/lib/api';
import { clsx } from 'clsx';

interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  isPublic: boolean;
  isRequired: boolean;
  defaultValue?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  updatedAt: string;
  updatedBy: string;
}

interface ConfigCategory {
  name: string;
  description: string;
  configs: SystemConfig[];
}

export default function SystemSettings() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    key: '',
    value: '',
    description: '',
    category: 'general',
    type: 'string' as const,
    isPublic: false,
    isRequired: false,
  });

  const { data: configResponse, isLoading } = useQuery({
    queryKey: ['system-config'],
    queryFn: () => apiClient.getSystemConfig(),
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      apiClient.updateSystemConfig(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      setEditingConfig(null);
      setEditValue('');
      toast.success('Configuration updated successfully');
    },
    onError: () => {
      toast.error('Failed to update configuration');
    },
  });

  const createConfigMutation = useMutation({
    mutationFn: (config: typeof newConfig) => apiClient.createSystemConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      setShowAddForm(false);
      setNewConfig({
        key: '',
        value: '',
        description: '',
        category: 'general',
        type: 'string',
        isPublic: false,
        isRequired: false,
      });
      toast.success('Configuration created successfully');
    },
    onError: () => {
      toast.error('Failed to create configuration');
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (key: string) => apiClient.deleteSystemConfig(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      toast.success('Configuration deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete configuration');
    },
  });

  const configs = configResponse?.data || [];

  // Group configs by category
  const configsByCategory = configs.reduce((acc: Record<string, SystemConfig[]>, config: SystemConfig) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {});

  const categories = Object.keys(configsByCategory).map(category => ({
    id: category,
    name: category.charAt(0).toUpperCase() + category.slice(1),
    count: configsByCategory[category].length,
  }));

  const handleEdit = (config: SystemConfig) => {
    setEditingConfig(config);
    setEditValue(config.value);
  };

  const handleSave = () => {
    if (!editingConfig) return;
    
    // Validate based on type
    let validatedValue = editValue;
    if (editingConfig.type === 'number') {
      const num = parseFloat(editValue);
      if (isNaN(num)) {
        toast.error('Invalid number value');
        return;
      }
      validatedValue = num.toString();
    } else if (editingConfig.type === 'boolean') {
      validatedValue = editValue.toLowerCase() === 'true' ? 'true' : 'false';
    } else if (editingConfig.type === 'json') {
      try {
        JSON.parse(editValue);
      } catch {
        toast.error('Invalid JSON format');
        return;
      }
    }

    updateConfigMutation.mutate({
      key: editingConfig.key,
      value: validatedValue,
    });
  };

  const handleDelete = (config: SystemConfig) => {
    if (config.isRequired) {
      toast.error('Cannot delete required configuration');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${config.key}"?`)) {
      deleteConfigMutation.mutate(config.key);
    }
  };

  const handleAddConfig = () => {
    if (!newConfig.key || !newConfig.description) {
      toast.error('Key and description are required');
      return;
    }

    createConfigMutation.mutate(newConfig);
  };

  const renderConfigValue = (config: SystemConfig) => {
    if (editingConfig?.id === config.id) {
      if (config.type === 'boolean') {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      } else if (config.validation?.options) {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {config.validation.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      } else if (config.type === 'json') {
        return (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={4}
            className="block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        );
      } else {
        return (
          <input
            type={config.type === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        );
      }
    }

    // Display value
    if (config.type === 'boolean') {
      return (
        <span className={clsx(
          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
          config.value === 'true' ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
        )}>
          {config.value === 'true' ? (
            <>
              <CheckIcon className="mr-1 h-3 w-3" />
              Enabled
            </>
          ) : (
            <>
              <XMarkIcon className="mr-1 h-3 w-3" />
              Disabled
            </>
          )}
        </span>
      );
    } else if (config.type === 'json') {
      return (
        <pre className="text-xs bg-secondary-50 p-2 rounded overflow-x-auto">
          {JSON.stringify(JSON.parse(config.value || '{}'), null, 2)}
        </pre>
      );
    } else {
      return (
        <span className="text-sm text-secondary-900 font-mono">
          {config.value || <span className="text-secondary-400 italic">Not set</span>}
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-secondary-900">System Configuration</h2>
          <p className="mt-1 text-sm text-secondary-600">
            Manage application settings and configuration parameters
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <CogIcon className="mr-2 h-4 w-4" />
          Add Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={clsx(
                  'w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  selectedCategory === category.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                )}
              >
                <span>{category.name}</span>
                <span className="rounded-full bg-secondary-200 px-2 py-0.5 text-xs">
                  {category.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Configuration List */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg border border-secondary-200 bg-white p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                    <div className="h-3 bg-secondary-200 rounded w-3/4"></div>
                    <div className="h-8 bg-secondary-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : configsByCategory[selectedCategory]?.length === 0 ? (
            <div className="text-center py-12">
              <CogIcon className="mx-auto h-12 w-12 text-secondary-400" />
              <h3 className="mt-2 text-sm font-medium text-secondary-900">No configurations</h3>
              <p className="mt-1 text-sm text-secondary-500">
                No configurations found in this category.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {configsByCategory[selectedCategory]?.map((config) => (
                <motion.div
                  key={config.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-secondary-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-sm font-medium text-secondary-900">{config.key}</h3>
                        <span className="text-xs text-secondary-500">({config.type})</span>
                        {config.isRequired && (
                          <span className="inline-flex items-center rounded-full bg-error-100 px-2 py-0.5 text-xs font-medium text-error-800">
                            <ExclamationTriangleIcon className="mr-1 h-3 w-3" />
                            Required
                          </span>
                        )}
                        {config.isPublic && (
                          <span className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800">
                            <InformationCircleIcon className="mr-1 h-3 w-3" />
                            Public
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary-600 mb-3">{config.description}</p>
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-secondary-700">Value:</label>
                        {renderConfigValue(config)}
                      </div>
                      <p className="text-xs text-secondary-500 mt-2">
                        Last updated: {new Date(config.updatedAt).toLocaleString()} by {config.updatedBy}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {editingConfig?.id === config.id ? (
                        <>
                          <button
                            onClick={handleSave}
                            disabled={updateConfigMutation.isPending}
                            className="inline-flex items-center rounded-lg bg-success-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-success-700 disabled:opacity-50"
                          >
                            <CheckIcon className="mr-1 h-4 w-4" />
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingConfig(null);
                              setEditValue('');
                            }}
                            className="inline-flex items-center rounded-lg bg-secondary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-secondary-700"
                          >
                            <XMarkIcon className="mr-1 h-4 w-4" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(config)}
                            className="rounded-lg p-2 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          {!config.isRequired && (
                            <button
                              onClick={() => handleDelete(config)}
                              className="rounded-lg p-2 text-error-400 hover:bg-error-50 hover:text-error-600"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Configuration Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={() => setShowAddForm(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-lg rounded-lg bg-white shadow-xl"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">
                  Add New Configuration
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700">Key *</label>
                    <input
                      type="text"
                      value={newConfig.key}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, key: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="e.g., app.max_upload_size"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700">Description *</label>
                    <textarea
                      value={newConfig.description}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Describe what this configuration controls"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Category</label>
                      <select
                        value={newConfig.category}
                        onChange={(e) => setNewConfig(prev => ({ ...prev, category: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Type</label>
                      <select
                        value={newConfig.type}
                        onChange={(e) => setNewConfig(prev => ({ ...prev, type: e.target.value as any }))}
                        className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700">Default Value</label>
                    <input
                      type="text"
                      value={newConfig.value}
                      onChange={(e) => setNewConfig(prev => ({ ...prev, value: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newConfig.isPublic}
                        onChange={(e) => setNewConfig(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-secondary-700">Public (visible to frontend)</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newConfig.isRequired}
                        onChange={(e) => setNewConfig(prev => ({ ...prev, isRequired: e.target.checked }))}
                        className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-secondary-700">Required</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="rounded-lg border border-secondary-300 bg-white px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddConfig}
                    disabled={createConfigMutation.isPending}
                    className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    {createConfigMutation.isPending ? 'Creating...' : 'Create Configuration'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
