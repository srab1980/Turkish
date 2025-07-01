'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { 
  DocumentMagnifyingGlassIcon, 
  CheckIcon, 
  XMarkIcon,
  PencilIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function ContentReviewPage() {
  const [selectedFilter, setSelectedFilter] = useState('pending');

  // Mock review items
  const reviewItems = [
    {
      id: '1',
      type: 'lesson',
      title: 'Basic Turkish Greetings',
      description: 'Introduction to common Turkish greetings and responses',
      status: 'pending',
      aiConfidence: 92,
      createdAt: new Date('2024-01-20T10:30:00Z'),
      content: {
        vocabulary: ['Merhaba', 'Günaydın', 'İyi akşamlar'],
        exercises: 5,
        grammar: 2
      },
      flags: ['High confidence', 'Complete content']
    },
    {
      id: '2',
      type: 'exercise',
      title: 'Numbers 1-10 Quiz',
      description: 'Multiple choice quiz on Turkish numbers',
      status: 'needs_review',
      aiConfidence: 78,
      createdAt: new Date('2024-01-20T09:15:00Z'),
      content: {
        questions: 10,
        difficulty: 'beginner'
      },
      flags: ['Medium confidence', 'Needs verification'],
      issues: ['Some translations may need review']
    },
    {
      id: '3',
      type: 'vocabulary',
      title: 'Family Members Vocabulary',
      description: 'Turkish words for family relationships',
      status: 'approved',
      aiConfidence: 95,
      createdAt: new Date('2024-01-19T14:20:00Z'),
      approvedAt: new Date('2024-01-20T08:30:00Z'),
      content: {
        words: 15,
        pronunciations: 15,
        examples: 15
      },
      flags: ['High confidence', 'Approved by expert']
    },
    {
      id: '4',
      type: 'grammar',
      title: 'Present Tense Formation',
      description: 'Rules for forming present tense in Turkish',
      status: 'rejected',
      aiConfidence: 65,
      createdAt: new Date('2024-01-19T11:45:00Z'),
      rejectedAt: new Date('2024-01-19T16:20:00Z'),
      content: {
        rules: 3,
        examples: 8,
        exceptions: 2
      },
      flags: ['Low confidence', 'Incomplete examples'],
      issues: ['Missing key grammar rules', 'Examples need correction']
    }
  ];

  const filters = [
    { value: 'all', label: 'All Items', count: reviewItems.length },
    { value: 'pending', label: 'Pending Review', count: reviewItems.filter(item => item.status === 'pending').length },
    { value: 'needs_review', label: 'Needs Review', count: reviewItems.filter(item => item.status === 'needs_review').length },
    { value: 'approved', label: 'Approved', count: reviewItems.filter(item => item.status === 'approved').length },
    { value: 'rejected', label: 'Rejected', count: reviewItems.filter(item => item.status === 'rejected').length }
  ];

  const filteredItems = selectedFilter === 'all' 
    ? reviewItems 
    : reviewItems.filter(item => item.status === selectedFilter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      case 'needs_review':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleApprove = (id: string) => {
      };

  const handleReject = (id: string) => {
      };

  const handleEdit = (id: string) => {
      };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Content Review</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and approve AI-generated content before publishing
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  selectedFilter === filter.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Review Items */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(item.status)}
                    <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                      {item.type}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{item.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">AI Confidence:</span>
                      <span className={`ml-2 font-bold ${getConfidenceColor(item.aiConfidence)}`}>
                        {item.aiConfidence}%
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Created:</span>
                      <span className="ml-2 text-sm text-gray-600">
                        {item.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Content:</span>
                      <span className="ml-2 text-sm text-gray-600">
                        {Object.entries(item.content).map(([key, value]) => `${value} ${key}`).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.flags.map((flag, index) => (
                      <span key={index} className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                        {flag}
                      </span>
                    ))}
                  </div>

                  {item.issues && item.issues.length > 0 && (
                    <div className="mb-4 rounded-lg bg-yellow-50 p-3">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Issues to Review:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {item.issues.map((issue, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.approvedAt && (
                    <div className="text-sm text-green-600">
                      Approved on {item.approvedAt.toLocaleDateString()}
                    </div>
                  )}

                  {item.rejectedAt && (
                    <div className="text-sm text-red-600">
                      Rejected on {item.rejectedAt.toLocaleDateString()}
                    </div>
                  )}
                </div>

                {(item.status === 'pending' || item.status === 'needs_review') && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(item.id)}
                      className="rounded p-2 text-gray-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="rounded p-2 text-gray-400 hover:text-red-600"
                      title="Reject"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="rounded p-2 text-gray-400 hover:text-green-600"
                      title="Approve"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items to review</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedFilter === 'all' 
                ? 'No content items found.'
                : `No ${selectedFilter.replace('_', ' ')} items found.`
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
