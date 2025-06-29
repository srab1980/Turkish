'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { FeatureFlag } from '@/types';
import apiClient from '@/lib/api';
import { clsx } from 'clsx';

export default function FeatureFlags() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [newFlag, setNewFlag] = useState({
    name: '',
    key: '',
    description: '',
    isEnabled: false,
    rolloutPercentage: 0,
    conditions: {},
  });

  const { data: flagsResponse, isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => apiClient.getFeatureFlags(),
  });

  const updateFlagMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FeatureFlag> }) =>
      apiClient.updateFeatureFlag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      setEditingFlag(null);
      toast.success('Feature flag updated successfully');
    },
    onError: () => {
      toast.error('Failed to update feature flag');
    },
  });

  const createFlagMutation = useMutation({
    mutationFn: (data: typeof newFlag) => apiClient.createFeatureFlag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      setShowCreateForm(false);
      setNewFlag({
        name: '',
        key: '',
        description: '',
        isEnabled: false,
        rolloutPercentage: 0,
        conditions: {},
      });
      toast.success('Feature flag created successfully');
    },
    onError: () => {
      toast.error('Failed to create feature flag');
    },
  });

  const deleteFlagMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteFeatureFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete feature flag');
    },
  });

  const flags = flagsResponse?.data || [];

  const handleToggleFlag = (flag: FeatureFlag) => {
    updateFlagMutation.mutate({
      id: flag.id,
      data: { isEnabled: !flag.isEnabled },
    });
  };

  const handleUpdateRollout = (flag: FeatureFlag, percentage: number) => {
    updateFlagMutation.mutate({
      id: flag.id,
      data: { rolloutPercentage: percentage },
    });
  };

  const handleDeleteFlag = (flag: FeatureFlag) => {
    if (window.confirm(`Are you sure you want to delete "${flag.name}"?`)) {
      deleteFlagMutation.mutate(flag.id);
    }
  };

  const handleCreateFlag = () => {
    if (!newFlag.name || !newFlag.key || !newFlag.description) {
      toast.error('Name, key, and description are required');
      return;
    }

    createFlagMutation.mutate(newFlag);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-secondary-900">Feature Flags</h2>
          <p className="mt-1 text-sm text-secondary-600">
            Control feature rollouts and A/B testing across the platform
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Flag
        </button>
      </div>

      {/* Feature Flags List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-secondary-200 bg-white p-6">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-lg bg-secondary-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-secondary-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : flags.length === 0 ? (
        <div className="text-center py-12">
          <FlagIcon className="mx-auto h-12 w-12 text-secondary-400" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No feature flags</h3>
          <p className="mt-1 text-sm text-secondary-500">
            Get started by creating your first feature flag.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            Create flag
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {flags.map((flag: FeatureFlag) => (
            <motion.div
              key={flag.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-secondary-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={clsx(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      flag.isEnabled ? 'bg-success-100' : 'bg-secondary-100'
                    )}>
                      <FlagIcon className={clsx(
                        'h-6 w-6',
                        flag.isEnabled ? 'text-success-600' : 'text-secondary-400'
                      )} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-secondary-900">{flag.name}</h3>
                      <span className="text-xs text-secondary-500 font-mono">({flag.key})</span>
                      <span className={clsx(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        flag.isEnabled ? 'bg-success-100 text-success-800' : 'bg-secondary-100 text-secondary-800'
                      )}>
                        {flag.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-600 mt-1">{flag.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-secondary-500">Rollout:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-secondary-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${flag.rolloutPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-secondary-900">
                            {flag.rolloutPercentage}%
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-secondary-500">
                        Updated {new Date(flag.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggleFlag(flag)}
                    className={clsx(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                      flag.isEnabled ? 'bg-primary-600' : 'bg-secondary-200'
                    )}
                  >
                    <span
                      className={clsx(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        flag.isEnabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>

                  {/* Rollout Percentage Input */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={flag.rolloutPercentage}
                    onChange={(e) => handleUpdateRollout(flag, parseInt(e.target.value))}
                    className="w-20 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer"
                  />

                  {/* Actions */}
                  <button
                    onClick={() => setEditingFlag(flag)}
                    className="rounded-lg p-2 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFlag(flag)}
                    className="rounded-lg p-2 text-error-400 hover:bg-error-50 hover:text-error-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Flag Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-25"
                onClick={() => setShowCreateForm(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg rounded-lg bg-white shadow-xl"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium text-secondary-900 mb-4">
                    Create Feature Flag
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Name *</label>
                      <input
                        type="text"
                        value={newFlag.name}
                        onChange={(e) => setNewFlag(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="e.g., New Dashboard"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Key *</label>
                      <input
                        type="text"
                        value={newFlag.key}
                        onChange={(e) => setNewFlag(prev => ({ ...prev, key: e.target.value }))}
                        className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="e.g., new_dashboard"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Description *</label>
                      <textarea
                        value={newFlag.description}
                        onChange={(e) => setNewFlag(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Describe what this feature flag controls"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Initial Rollout Percentage</label>
                      <div className="mt-1 flex items-center space-x-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={newFlag.rolloutPercentage}
                          onChange={(e) => setNewFlag(prev => ({ ...prev, rolloutPercentage: parseInt(e.target.value) }))}
                          className="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-medium text-secondary-900 w-12">
                          {newFlag.rolloutPercentage}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newFlag.isEnabled}
                          onChange={(e) => setNewFlag(prev => ({ ...prev, isEnabled: e.target.checked }))}
                          className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-secondary-700">Enable immediately</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="rounded-lg border border-secondary-300 bg-white px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateFlag}
                      disabled={createFlagMutation.isPending}
                      className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      {createFlagMutation.isPending ? 'Creating...' : 'Create Flag'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Flag Modal */}
      <AnimatePresence>
        {editingFlag && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-25"
                onClick={() => setEditingFlag(null)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg rounded-lg bg-white shadow-xl"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium text-secondary-900 mb-4">
                    Edit Feature Flag
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Name</label>
                      <input
                        type="text"
                        value={editingFlag.name}
                        onChange={(e) => setEditingFlag(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Description</label>
                      <textarea
                        value={editingFlag.description}
                        onChange={(e) => setEditingFlag(prev => prev ? { ...prev, description: e.target.value } : null)}
                        rows={3}
                        className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Rollout Percentage</label>
                      <div className="mt-1 flex items-center space-x-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={editingFlag.rolloutPercentage}
                          onChange={(e) => setEditingFlag(prev => prev ? { ...prev, rolloutPercentage: parseInt(e.target.value) } : null)}
                          className="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-medium text-secondary-900 w-12">
                          {editingFlag.rolloutPercentage}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingFlag.isEnabled}
                          onChange={(e) => setEditingFlag(prev => prev ? { ...prev, isEnabled: e.target.checked } : null)}
                          className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-secondary-700">Enabled</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setEditingFlag(null)}
                      className="rounded-lg border border-secondary-300 bg-white px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (editingFlag) {
                          updateFlagMutation.mutate({
                            id: editingFlag.id,
                            data: {
                              name: editingFlag.name,
                              description: editingFlag.description,
                              isEnabled: editingFlag.isEnabled,
                              rolloutPercentage: editingFlag.rolloutPercentage,
                            },
                          });
                        }
                      }}
                      disabled={updateFlagMutation.isPending}
                      className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      {updateFlagMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
