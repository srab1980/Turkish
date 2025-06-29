'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  BookOpenIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { User, UserRole } from '@/types';
import apiClient from '@/lib/api';
import { clsx } from 'clsx';

interface UserProfileProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function UserProfile({ user, isOpen, onClose, onEdit }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'activity'>('overview');

  const { data: userStatsResponse } = useQuery({
    queryKey: ['user-stats', user.id],
    queryFn: () => apiClient.getUserStats(user.id),
    enabled: isOpen,
  });

  const { data: userProgressResponse } = useQuery({
    queryKey: ['user-progress', user.id],
    queryFn: () => apiClient.getUserProgress(user.id),
    enabled: isOpen && activeTab === 'progress',
  });

  const { data: userActivityResponse } = useQuery({
    queryKey: ['user-activity', user.id],
    queryFn: () => apiClient.getUserActivity(user.id),
    enabled: isOpen && activeTab === 'activity',
  });

  const userStats = userStatsResponse?.data;
  const userProgress = userProgressResponse?.data;
  const userActivity = userActivityResponse?.data;

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.ADMIN]: 'bg-error-100 text-error-800',
      [UserRole.INSTRUCTOR]: 'bg-warning-100 text-warning-800',
      [UserRole.STUDENT]: 'bg-primary-100 text-primary-800',
    };
    return colors[role] || 'bg-secondary-100 text-secondary-800';
  };

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      [UserRole.ADMIN]: UserIcon,
      [UserRole.INSTRUCTOR]: AcademicCapIcon,
      [UserRole.STUDENT]: BookOpenIcon,
    };
    return icons[role] || UserIcon;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'progress', name: 'Progress', icon: ChartBarIcon },
    { id: 'activity', name: 'Activity', icon: ClockIcon },
  ];

  if (!isOpen) return null;

  const RoleIcon = getRoleIcon(user.role);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-25"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="border-b border-secondary-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-200">
                      <span className="text-xl font-medium text-secondary-600">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-semibold text-secondary-900">
                      {user.fullName}
                    </h2>
                    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', getRoleColor(user.role))}>
                      <RoleIcon className="mr-1 h-3 w-3" />
                      {user.role}
                    </span>
                    {user.isActive ? (
                      <CheckCircleIcon className="h-5 w-5 text-success-500" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-error-500" />
                    )}
                  </div>
                  <p className="text-sm text-secondary-600">{user.email}</p>
                  {user.lastLoginAt && (
                    <p className="text-xs text-secondary-500">
                      Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onEdit}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Edit User
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-4">
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={clsx(
                        'flex items-center space-x-2 border-b-2 py-2 text-sm font-medium transition-colors',
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
                      )}
                    >
                      <TabIcon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6">
                {/* Stats Cards */}
                {userStats && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-secondary-200 bg-white p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <BookOpenIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-secondary-600">Courses Enrolled</p>
                          <p className="text-2xl font-semibold text-secondary-900">
                            {userStats.coursesEnrolled || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-secondary-200 bg-white p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <TrophyIcon className="h-8 w-8 text-warning-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-secondary-600">Lessons Completed</p>
                          <p className="text-2xl font-semibold text-secondary-900">
                            {userStats.lessonsCompleted || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-secondary-200 bg-white p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ClockIcon className="h-8 w-8 text-success-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-secondary-600">Study Time</p>
                          <p className="text-2xl font-semibold text-secondary-900">
                            {userStats.totalStudyTime || '0h'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-secondary-200 bg-white p-6">
                    <h3 className="text-lg font-medium text-secondary-900 mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <EnvelopeIcon className="h-5 w-5 text-secondary-400" />
                        <span className="text-sm text-secondary-900">{user.email}</span>
                      </div>
                      
                      {user.phoneNumber && (
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5 text-secondary-400" />
                          <span className="text-sm text-secondary-900">{user.phoneNumber}</span>
                        </div>
                      )}
                      
                      {user.dateOfBirth && (
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="h-5 w-5 text-secondary-400" />
                          <span className="text-sm text-secondary-900">
                            {new Date(user.dateOfBirth).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {user.nativeLanguage && (
                        <div className="flex items-center space-x-3">
                          <GlobeAltIcon className="h-5 w-5 text-secondary-400" />
                          <span className="text-sm text-secondary-900">{user.nativeLanguage}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-secondary-200 bg-white p-6">
                    <h3 className="text-lg font-medium text-secondary-900 mb-4">Account Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-secondary-600">Status: </span>
                        <span className={clsx(
                          'text-sm font-medium',
                          user.isActive ? 'text-success-600' : 'text-error-600'
                        )}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-secondary-600">Member since: </span>
                        <span className="text-sm text-secondary-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {user.lastLoginAt && (
                        <div>
                          <span className="text-sm font-medium text-secondary-600">Last login: </span>
                          <span className="text-sm text-secondary-900">
                            {new Date(user.lastLoginAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <div className="rounded-lg border border-secondary-200 bg-white p-6">
                    <h3 className="text-lg font-medium text-secondary-900 mb-4">Bio</h3>
                    <p className="text-sm text-secondary-700">{user.bio}</p>
                  </div>
                )}

                {/* Learning Goals */}
                {user.learningGoals && user.learningGoals.length > 0 && (
                  <div className="rounded-lg border border-secondary-200 bg-white p-6">
                    <h3 className="text-lg font-medium text-secondary-900 mb-4">Learning Goals</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.learningGoals.map((goal, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">Learning Progress</h3>
                {userProgress ? (
                  <div className="space-y-4">
                    {userProgress.courses?.map((course: any) => (
                      <div key={course.id} className="rounded-lg border border-secondary-200 bg-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-secondary-900">{course.title}</h4>
                          <span className="text-sm text-secondary-600">
                            {course.progress}% complete
                          </span>
                        </div>
                        <div className="w-full bg-secondary-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-secondary-600 mt-2">
                          {course.completedLessons} of {course.totalLessons} lessons completed
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-secondary-500">No progress data available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Activity</h3>
                {userActivity ? (
                  <div className="space-y-4">
                    {userActivity.activities?.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border border-secondary-200 bg-white">
                        <div className="flex-shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                            <BookOpenIcon className="h-4 w-4 text-primary-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary-900">
                            {activity.description}
                          </p>
                          <p className="text-sm text-secondary-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-secondary-500">No activity data available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
