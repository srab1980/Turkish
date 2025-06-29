'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { ContentImportJob } from '@/types';
import apiClient from '@/lib/api';
import { clsx } from 'clsx';

export default function ContentImport() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<ContentImportJob | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);

  const { data: jobsResponse, isLoading } = useQuery({
    queryKey: ['import-jobs'],
    queryFn: () => apiClient.getImportJobs(),
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const importContentMutation = useMutation({
    mutationFn: (file: File) => apiClient.importContent(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      toast.success('Content import started successfully');
    },
    onError: () => {
      toast.error('Failed to start content import');
    },
  });

  const retryJobMutation = useMutation({
    mutationFn: (jobId: string) => apiClient.retryImportJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      toast.success('Import job restarted');
    },
    onError: () => {
      toast.error('Failed to retry import job');
    },
  });

  const jobs = jobsResponse?.data || [];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are supported');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('File size must be less than 50MB');
        return;
      }
      importContentMutation.mutate(file);
    }
  }, [importContentMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const getStatusIcon = (status: ContentImportJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-error-500" />;
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-primary-500 animate-spin" />;
      default:
        return <ClockIcon className="h-5 w-5 text-secondary-400" />;
    }
  };

  const getStatusColor = (status: ContentImportJob['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'failed':
        return 'bg-error-100 text-error-800';
      case 'processing':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const handleViewJob = (job: ContentImportJob) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-secondary-900">Content Import</h2>
        <p className="mt-1 text-sm text-secondary-600">
          Import content from Istanbul Book PDFs using AI-powered extraction
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-secondary-300 hover:border-secondary-400'
        )}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-secondary-400" />
        <div className="mt-4">
          <p className="text-sm font-medium text-secondary-900">
            {isDragActive ? 'Drop the PDF file here' : 'Upload Istanbul Book PDF'}
          </p>
          <p className="text-sm text-secondary-500 mt-1">
            Drag and drop a PDF file here, or click to select
          </p>
          <p className="text-xs text-secondary-400 mt-2">
            Supports PDF files up to 50MB
          </p>
        </div>
        {importContentMutation.isPending && (
          <div className="mt-4">
            <div className="inline-flex items-center text-sm text-primary-600">
              <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
              Starting import...
            </div>
          </div>
        )}
      </div>

      {/* Import Jobs */}
      <div>
        <h3 className="text-lg font-medium text-secondary-900 mb-4">Import History</h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-secondary-400" />
            <h3 className="mt-2 text-sm font-medium text-secondary-900">No import jobs</h3>
            <p className="mt-1 text-sm text-secondary-500">
              Upload a PDF file to start importing content.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job: ContentImportJob) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-secondary-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                        <DocumentTextIcon className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-secondary-900">{job.filename}</h4>
                        <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(job.status))}>
                          {getStatusIcon(job.status)}
                          <span className="ml-1 capitalize">{job.status}</span>
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-secondary-500">
                        <span>Started {new Date(job.createdAt).toLocaleString()}</span>
                        {job.completedAt && (
                          <span>Completed {new Date(job.completedAt).toLocaleString()}</span>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      {job.status === 'processing' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-secondary-600 mb-1">
                            <span>Processing...</span>
                            <span>{job.processedItems} / {job.totalItems}</span>
                          </div>
                          <div className="w-full bg-secondary-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Results Summary */}
                      {job.status === 'completed' && job.result && (
                        <div className="mt-2 flex items-center space-x-4 text-xs text-secondary-600">
                          <span>{job.result.coursesCreated} courses</span>
                          <span>{job.result.lessonsCreated} lessons</span>
                          <span>{job.result.exercisesCreated} exercises</span>
                          <span>{job.result.vocabularyCreated} vocabulary items</span>
                        </div>
                      )}

                      {/* Errors */}
                      {job.errors && job.errors.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-error-600">
                            {job.errors.length} error(s) occurred
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewJob(job)}
                      className="inline-flex items-center rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      <EyeIcon className="mr-1 h-4 w-4" />
                      View Details
                    </button>
                    {job.status === 'failed' && (
                      <button
                        onClick={() => retryJobMutation.mutate(job.id)}
                        disabled={retryJobMutation.isPending}
                        className="inline-flex items-center rounded-lg bg-warning-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-warning-700 disabled:opacity-50"
                      >
                        <ArrowPathIcon className="mr-1 h-4 w-4" />
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      <AnimatePresence>
        {showJobDetails && selectedJob && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-25"
                onClick={() => setShowJobDetails(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-secondary-900">Import Job Details</h3>
                      <p className="text-sm text-secondary-600">{selectedJob.filename}</p>
                    </div>
                    <button
                      onClick={() => setShowJobDetails(false)}
                      className="rounded-lg p-2 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Status and Progress */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-sm font-medium', getStatusColor(selectedJob.status))}>
                        {getStatusIcon(selectedJob.status)}
                        <span className="ml-2 capitalize">{selectedJob.status}</span>
                      </span>
                      <span className="text-sm text-secondary-600">
                        {selectedJob.progress}% complete
                      </span>
                    </div>
                    
                    {selectedJob.status === 'processing' && (
                      <div className="w-full bg-secondary-200 rounded-full h-3">
                        <div
                          className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${selectedJob.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Results */}
                  {selectedJob.result && (
                    <div className="mb-6">
                      <h4 className="font-medium text-secondary-900 mb-3">Import Results</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-primary-50 rounded-lg p-3">
                          <div className="text-2xl font-semibold text-primary-900">
                            {selectedJob.result.coursesCreated}
                          </div>
                          <div className="text-sm text-primary-600">Courses Created</div>
                        </div>
                        <div className="bg-success-50 rounded-lg p-3">
                          <div className="text-2xl font-semibold text-success-900">
                            {selectedJob.result.lessonsCreated}
                          </div>
                          <div className="text-sm text-success-600">Lessons Created</div>
                        </div>
                        <div className="bg-warning-50 rounded-lg p-3">
                          <div className="text-2xl font-semibold text-warning-900">
                            {selectedJob.result.exercisesCreated}
                          </div>
                          <div className="text-sm text-warning-600">Exercises Created</div>
                        </div>
                        <div className="bg-secondary-50 rounded-lg p-3">
                          <div className="text-2xl font-semibold text-secondary-900">
                            {selectedJob.result.vocabularyCreated}
                          </div>
                          <div className="text-sm text-secondary-600">Vocabulary Items</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {selectedJob.errors && selectedJob.errors.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-secondary-900 mb-3">Errors</h4>
                      <div className="bg-error-50 rounded-lg p-4">
                        <ul className="space-y-1">
                          {selectedJob.errors.map((error, index) => (
                            <li key={index} className="text-sm text-error-700">
                              • {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="border-t border-secondary-200 pt-4">
                    <div className="grid grid-cols-1 gap-2 text-sm text-secondary-600">
                      <div>
                        <span className="font-medium">Started:</span> {new Date(selectedJob.createdAt).toLocaleString()}
                      </div>
                      {selectedJob.completedAt && (
                        <div>
                          <span className="font-medium">Completed:</span> {new Date(selectedJob.completedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
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
