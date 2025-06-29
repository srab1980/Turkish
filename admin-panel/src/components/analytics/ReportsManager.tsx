'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import apiClient from '@/lib/api';
import { clsx } from 'clsx';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'user_progress' | 'course_analytics' | 'engagement' | 'custom';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  parameters: Record<string, any>;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  parameters: Array<{
    name: string;
    label: string;
    type: 'text' | 'date' | 'select' | 'multiselect';
    options?: string[];
    required: boolean;
  }>;
}

export default function ReportsManager() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportParameters, setReportParameters] = useState<Record<string, any>>({});

  const { data: reportsResponse, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => apiClient.getReports(),
  });

  const { data: templatesResponse } = useQuery({
    queryKey: ['report-templates'],
    queryFn: () => apiClient.getReportTemplates(),
  });

  const createReportMutation = useMutation({
    mutationFn: (data: { templateId: string; parameters: Record<string, any> }) =>
      apiClient.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setShowCreateForm(false);
      setSelectedTemplate(null);
      setReportParameters({});
      toast.success('Report generation started');
    },
    onError: () => {
      toast.error('Failed to create report');
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete report');
    },
  });

  const reports = reportsResponse?.data?.data || [];
  const templates = templatesResponse?.data || [];

  const handleCreateReport = () => {
    if (!selectedTemplate) return;

    // Validate required parameters
    const missingParams = selectedTemplate.parameters
      .filter(param => param.required && !reportParameters[param.name])
      .map(param => param.label);

    if (missingParams.length > 0) {
      toast.error(`Missing required parameters: ${missingParams.join(', ')}`);
      return;
    }

    createReportMutation.mutate({
      templateId: selectedTemplate.id,
      parameters: reportParameters,
    });
  };

  const handleDownloadReport = async (report: Report) => {
    if (!report.downloadUrl) return;

    try {
      const response = await fetch(report.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'generating':
        return <ClockIcon className="h-5 w-5 text-warning-500 animate-spin" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-error-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-secondary-400" />;
    }
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'generating':
        return 'bg-warning-100 text-warning-800';
      case 'failed':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-secondary-900">Reports</h2>
          <p className="mt-1 text-sm text-secondary-600">
            Generate and manage analytics reports
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Generate Report
        </button>
      </div>

      {/* Reports List */}
      {reportsLoading ? (
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
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-secondary-400" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No reports</h3>
          <p className="mt-1 text-sm text-secondary-500">Get started by generating your first report.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            Generate report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <motion.div
              key={report.id}
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
                  <div>
                    <h3 className="text-sm font-medium text-secondary-900">{report.name}</h3>
                    <p className="text-sm text-secondary-500">{report.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(report.status))}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1 capitalize">{report.status}</span>
                      </span>
                      <span className="text-xs text-secondary-500">
                        Created {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      {report.completedAt && (
                        <span className="text-xs text-secondary-500">
                          Completed {new Date(report.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {report.status === 'completed' && report.downloadUrl && (
                    <button
                      onClick={() => handleDownloadReport(report)}
                      className="inline-flex items-center rounded-lg bg-success-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-success-700"
                    >
                      <ArrowDownTrayIcon className="mr-1 h-4 w-4" />
                      Download
                    </button>
                  )}
                  <button
                    onClick={() => deleteReportMutation.mutate(report.id)}
                    className="rounded-lg p-2 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Report Modal */}
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
                    Generate New Report
                  </h3>

                  {!selectedTemplate ? (
                    <div className="space-y-3">
                      <p className="text-sm text-secondary-600">Select a report template:</p>
                      {templates.map((template: ReportTemplate) => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template)}
                          className="w-full text-left rounded-lg border border-secondary-200 p-4 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <h4 className="font-medium text-secondary-900">{template.name}</h4>
                          <p className="text-sm text-secondary-600">{template.description}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-secondary-900">{selectedTemplate.name}</h4>
                        <button
                          onClick={() => {
                            setSelectedTemplate(null);
                            setReportParameters({});
                          }}
                          className="text-sm text-primary-600 hover:text-primary-500"
                        >
                          Change template
                        </button>
                      </div>

                      <div className="space-y-3">
                        {selectedTemplate.parameters.map((param) => (
                          <div key={param.name}>
                            <label className="block text-sm font-medium text-secondary-700">
                              {param.label} {param.required && '*'}
                            </label>
                            {param.type === 'text' && (
                              <input
                                type="text"
                                value={reportParameters[param.name] || ''}
                                onChange={(e) => setReportParameters(prev => ({
                                  ...prev,
                                  [param.name]: e.target.value
                                }))}
                                className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                            )}
                            {param.type === 'date' && (
                              <input
                                type="date"
                                value={reportParameters[param.name] || ''}
                                onChange={(e) => setReportParameters(prev => ({
                                  ...prev,
                                  [param.name]: e.target.value
                                }))}
                                className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                            )}
                            {param.type === 'select' && (
                              <select
                                value={reportParameters[param.name] || ''}
                                onChange={(e) => setReportParameters(prev => ({
                                  ...prev,
                                  [param.name]: e.target.value
                                }))}
                                className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                              >
                                <option value="">Select an option</option>
                                {param.options?.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setSelectedTemplate(null);
                        setReportParameters({});
                      }}
                      className="rounded-lg border border-secondary-300 bg-white px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
                    >
                      Cancel
                    </button>
                    {selectedTemplate && (
                      <button
                        onClick={handleCreateReport}
                        disabled={createReportMutation.isPending}
                        className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                      >
                        {createReportMutation.isPending ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Generating...
                          </>
                        ) : (
                          'Generate Report'
                        )}
                      </button>
                    )}
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
