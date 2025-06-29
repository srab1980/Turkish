'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  DocumentTextIcon,
  SparklesIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import apiClient from '@/lib/api';
import { clsx } from 'clsx';

interface AIGeneratedContent {
  id: string;
  type: 'lesson' | 'exercise' | 'vocabulary' | 'grammar';
  title: string;
  content: any;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  aiConfidence: number;
  generatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  sourceDocument?: string;
  metadata: {
    cefrLevel?: string;
    difficulty?: number;
    estimatedTime?: number;
    topics?: string[];
  };
}

interface ReviewFilters {
  status: string;
  type: string;
  cefrLevel: string;
  sortBy: 'newest' | 'oldest' | 'confidence' | 'priority';
}

export default function ContentReviewDashboard() {
  const queryClient = useQueryClient();
  const [selectedContent, setSelectedContent] = useState<AIGeneratedContent | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filters, setFilters] = useState<ReviewFilters>({
    status: 'all',
    type: 'all',
    cefrLevel: 'all',
    sortBy: 'newest',
  });

  const { data: contentResponse, isLoading } = useQuery({
    queryKey: ['ai-content-review', filters],
    queryFn: () => apiClient.getAIGeneratedContent(filters),
  });

  const { data: reviewStatsResponse } = useQuery({
    queryKey: ['ai-review-stats'],
    queryFn: () => apiClient.getAIReviewStats(),
  });

  const approveContentMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      apiClient.approveAIContent(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-content-review'] });
      queryClient.invalidateQueries({ queryKey: ['ai-review-stats'] });
      setShowReviewModal(false);
      setSelectedContent(null);
      setReviewNotes('');
      toast.success('Content approved successfully');
    },
    onError: () => {
      toast.error('Failed to approve content');
    },
  });

  const rejectContentMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      apiClient.rejectAIContent(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-content-review'] });
      queryClient.invalidateQueries({ queryKey: ['ai-review-stats'] });
      setShowReviewModal(false);
      setSelectedContent(null);
      setReviewNotes('');
      toast.success('Content rejected');
    },
    onError: () => {
      toast.error('Failed to reject content');
    },
  });

  const requestRevisionMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      apiClient.requestAIContentRevision(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-content-review'] });
      queryClient.invalidateQueries({ queryKey: ['ai-review-stats'] });
      setShowReviewModal(false);
      setSelectedContent(null);
      setReviewNotes('');
      toast.success('Revision requested');
    },
    onError: () => {
      toast.error('Failed to request revision');
    },
  });

  const content = contentResponse?.data?.data || [];
  const stats = reviewStatsResponse?.data;

  const getStatusIcon = (status: AIGeneratedContent['status']) => {
    switch (status) {
      case 'approved':
        return <CheckIcon className="h-5 w-5 text-success-500" />;
      case 'rejected':
        return <XMarkIcon className="h-5 w-5 text-error-500" />;
      case 'needs_revision':
        return <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-secondary-400" />;
    }
  };

  const getStatusColor = (status: AIGeneratedContent['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800';
      case 'rejected':
        return 'bg-error-100 text-error-800';
      case 'needs_revision':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getTypeIcon = (type: AIGeneratedContent['type']) => {
    switch (type) {
      case 'lesson':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'exercise':
        return <PencilIcon className="h-5 w-5" />;
      case 'vocabulary':
        return <SparklesIcon className="h-5 w-5" />;
      case 'grammar':
        return <DocumentTextIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success-600';
    if (confidence >= 0.6) return 'text-warning-600';
    return 'text-error-600';
  };

  const handleReview = (content: AIGeneratedContent) => {
    setSelectedContent(content);
    setReviewNotes(content.reviewNotes || '');
    setShowReviewModal(true);
  };

  const handleApprove = () => {
    if (!selectedContent) return;
    approveContentMutation.mutate({
      id: selectedContent.id,
      notes: reviewNotes.trim() || undefined,
    });
  };

  const handleReject = () => {
    if (!selectedContent || !reviewNotes.trim()) {
      toast.error('Please provide rejection notes');
      return;
    }
    rejectContentMutation.mutate({
      id: selectedContent.id,
      notes: reviewNotes.trim(),
    });
  };

  const handleRequestRevision = () => {
    if (!selectedContent || !reviewNotes.trim()) {
      toast.error('Please provide revision notes');
      return;
    }
    requestRevisionMutation.mutate({
      id: selectedContent.id,
      notes: reviewNotes.trim(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">AI Content Review</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Review and approve AI-generated content before publication
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-secondary-200 bg-white p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-warning-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Pending Review</p>
                <p className="text-2xl font-semibold text-secondary-900">{stats.pending || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-secondary-200 bg-white p-4">
            <div className="flex items-center">
              <CheckIcon className="h-8 w-8 text-success-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Approved</p>
                <p className="text-2xl font-semibold text-secondary-900">{stats.approved || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-secondary-200 bg-white p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-warning-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Needs Revision</p>
                <p className="text-2xl font-semibold text-secondary-900">{stats.needsRevision || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-secondary-200 bg-white p-4">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Avg. Confidence</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {stats.avgConfidence ? `${(stats.avgConfidence * 100).toFixed(0)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-secondary-200 bg-white p-4">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-secondary-400" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 flex-1">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs_revision">Needs Revision</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="lesson">Lessons</option>
              <option value="exercise">Exercises</option>
              <option value="vocabulary">Vocabulary</option>
              <option value="grammar">Grammar</option>
            </select>

            <select
              value={filters.cefrLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, cefrLevel: e.target.value }))}
              className="rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Levels</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="confidence">By Confidence</option>
              <option value="priority">By Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content List */}
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
      ) : content.length === 0 ? (
        <div className="text-center py-12">
          <SparklesIcon className="mx-auto h-12 w-12 text-secondary-400" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No content to review</h3>
          <p className="mt-1 text-sm text-secondary-500">
            AI-generated content will appear here for review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {content.map((item: AIGeneratedContent) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-secondary-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                      {getTypeIcon(item.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-secondary-900">{item.title}</h3>
                      <span className="text-xs text-secondary-500 capitalize">({item.type})</span>
                      {item.metadata.cefrLevel && (
                        <span className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800">
                          {item.metadata.cefrLevel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(item.status))}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1 capitalize">{item.status.replace('_', ' ')}</span>
                      </span>
                      <span className={clsx('text-xs font-medium', getConfidenceColor(item.aiConfidence))}>
                        {(item.aiConfidence * 100).toFixed(0)}% confidence
                      </span>
                      <span className="text-xs text-secondary-500">
                        Generated {new Date(item.generatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {item.metadata.topics && item.metadata.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.metadata.topics.slice(0, 3).map((topic, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-secondary-100 px-2 py-0.5 text-xs text-secondary-700"
                          >
                            {topic}
                          </span>
                        ))}
                        {item.metadata.topics.length > 3 && (
                          <span className="text-xs text-secondary-500">
                            +{item.metadata.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReview(item)}
                    className="inline-flex items-center rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    <EyeIcon className="mr-1 h-4 w-4" />
                    Review
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedContent && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-25"
                onClick={() => setShowReviewModal(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-secondary-900">
                        Review AI-Generated Content
                      </h3>
                      <p className="text-sm text-secondary-600">{selectedContent.title}</p>
                    </div>
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="rounded-lg p-2 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Content Preview */}
                  <div className="mb-6 rounded-lg border border-secondary-200 bg-secondary-50 p-4">
                    <h4 className="font-medium text-secondary-900 mb-2">Generated Content</h4>
                    <div className="bg-white rounded p-4 text-sm">
                      <pre className="whitespace-pre-wrap font-sans">
                        {JSON.stringify(selectedContent.content, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">AI Confidence</label>
                      <p className={clsx('text-lg font-semibold', getConfidenceColor(selectedContent.aiConfidence))}>
                        {(selectedContent.aiConfidence * 100).toFixed(0)}%
                      </p>
                    </div>
                    {selectedContent.metadata.cefrLevel && (
                      <div>
                        <label className="block text-sm font-medium text-secondary-700">CEFR Level</label>
                        <p className="text-lg font-semibold text-secondary-900">{selectedContent.metadata.cefrLevel}</p>
                      </div>
                    )}
                    {selectedContent.metadata.estimatedTime && (
                      <div>
                        <label className="block text-sm font-medium text-secondary-700">Estimated Time</label>
                        <p className="text-lg font-semibold text-secondary-900">{selectedContent.metadata.estimatedTime} min</p>
                      </div>
                    )}
                  </div>

                  {/* Review Notes */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Review Notes
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={4}
                      className="block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Add your review notes here..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="rounded-lg border border-secondary-300 bg-white px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={rejectContentMutation.isPending}
                      className="inline-flex items-center rounded-lg bg-error-600 px-4 py-2 text-sm font-medium text-white hover:bg-error-700 disabled:opacity-50"
                    >
                      {rejectContentMutation.isPending ? 'Rejecting...' : 'Reject'}
                    </button>
                    <button
                      onClick={handleRequestRevision}
                      disabled={requestRevisionMutation.isPending}
                      className="inline-flex items-center rounded-lg bg-warning-600 px-4 py-2 text-sm font-medium text-white hover:bg-warning-700 disabled:opacity-50"
                    >
                      {requestRevisionMutation.isPending ? 'Requesting...' : 'Request Revision'}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={approveContentMutation.isPending}
                      className="inline-flex items-center rounded-lg bg-success-600 px-4 py-2 text-sm font-medium text-white hover:bg-success-700 disabled:opacity-50"
                    >
                      {approveContentMutation.isPending ? 'Approving...' : 'Approve'}
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
