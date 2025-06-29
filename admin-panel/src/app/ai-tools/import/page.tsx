'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { apiClient } from '@/lib/api';
import { ContentImportJob } from '@/types';
import { toast } from 'react-hot-toast';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

export default function ContentImportPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map());
  const queryClient = useQueryClient();

  // Fetch import jobs from API
  const { data: importJobsResponse, isLoading } = useQuery({
    queryKey: ['import-jobs'],
    queryFn: () => apiClient.getImportJobs(),
    refetchInterval: 5000, // Refetch every 5 seconds to get real-time updates
  });

  const importJobs = importJobsResponse?.data?.data || [];

  // Import content mutation
  const importMutation = useMutation({
    mutationFn: (file: File) => apiClient.importContent(file),
    onSuccess: (data, file) => {
      toast.success(`Started importing ${file.name}`);
      // Remove from uploading files
      setUploadingFiles(prev => {
        const newMap = new Map(prev);
        newMap.delete(file.name);
        return newMap;
      });
      // Refetch import jobs
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
    },
    onError: (error: any, file) => {
      toast.error(`Failed to import ${file.name}: ${error.message}`);
      // Remove from uploading files
      setUploadingFiles(prev => {
        const newMap = new Map(prev);
        newMap.delete(file.name);
        return newMap;
      });
    },
  });

  // Retry import job mutation
  const retryMutation = useMutation({
    mutationFn: (jobId: string) => apiClient.retryImportJob(jobId),
    onSuccess: () => {
      toast.success('Import job restarted');
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to retry import: ${error.message}`);
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    // Filter for PDF files only
    const pdfFiles = files.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length !== files.length) {
      toast.error('Only PDF files are supported');
    }

    if (pdfFiles.length === 0) {
      return;
    }

    // Process each PDF file
    for (const file of pdfFiles) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      // Add to uploading files with progress
      setUploadingFiles(prev => new Map(prev).set(file.name, 0));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          const currentProgress = newMap.get(file.name) || 0;
          if (currentProgress < 90) {
            newMap.set(file.name, currentProgress + 10);
          }
          return newMap;
        });
      }, 200);

      try {
        // Start the import
        await importMutation.mutateAsync(file);
        clearInterval(progressInterval);
      } catch (error) {
        clearInterval(progressInterval);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Content Import</h1>
          <p className="mt-1 text-sm text-gray-600">
            Import content from Istanbul Book PDFs using AI extraction
          </p>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <div
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Upload Istanbul Book PDFs
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your PDF files here, or click to browse
            </p>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileInput}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <button className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
              Choose Files
            </button>
          </div>
        </div>

        {/* Uploading Files */}
        {uploadingFiles.size > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Uploading Files</h2>
            <div className="space-y-4">
              {Array.from(uploadingFiles.entries()).map(([fileName, progress]) => (
                <div key={fileName} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="font-medium text-gray-900">{fileName}</h3>
                        <p className="text-sm text-gray-500">Uploading...</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                      uploading
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-gray-600">{progress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import Jobs */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Import History</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Loading import jobs...</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {importJobs.map((job: ContentImportJob) => (
              <div key={job.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{job.filename}</h3>
                      <p className="text-sm text-gray-500">
                        Started {new Date(job.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                {job.status === 'processing' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Processing...</span>
                      <span className="text-gray-600">{job.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {job.status === 'completed' && job.result && (
                  <div className="mt-4">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{job.result.lessonsCreated}</div>
                        <div className="text-sm text-gray-600">Lessons</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{job.result.vocabularyCreated}</div>
                        <div className="text-sm text-gray-600">Vocabulary</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{job.result.exercisesCreated}</div>
                        <div className="text-sm text-gray-600">Exercises</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{job.result.coursesCreated}</div>
                        <div className="text-sm text-gray-600">Courses</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.location.href = '/content/courses'}
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                      >
                        View Courses
                      </button>
                      <button
                        onClick={() => window.location.href = '/content/vocabulary'}
                        className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                      >
                        View Vocabulary
                      </button>
                    </div>
                  </div>
                )}

                {job.status === 'failed' && job.errors.length > 0 && (
                  <div className="mt-4 rounded-lg bg-red-50 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-red-700">Errors:</p>
                        <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                          {job.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => retryMutation.mutate(job.id)}
                        disabled={retryMutation.isPending}
                        className="ml-3 inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
                      >
                        {retryMutation.isPending ? 'Retrying...' : 'Retry'}
                      </button>
                    </div>
                  </div>
                )}

                {job.completedAt && (
                  <div className="mt-4 text-sm text-gray-500">
                    Completed {new Date(job.completedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))}

            {importJobs.length === 0 && uploadingFiles.size === 0 && (
              <div className="text-center py-12">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No import jobs yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upload your first PDF to get started with AI content extraction.
                </p>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
