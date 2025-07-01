'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Course, CEFRLevel, QueryParams } from '@/types';
import apiClient from '@/lib/api';
import { clsx } from 'clsx';

interface CourseListProps {
  onCreateCourse: () => void;
  onEditCourse: (course: Course) => void;
  onViewCourse: (course: Course) => void;
}

export default function CourseList({ onCreateCourse, onEditCourse, onViewCourse }: CourseListProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const queryParams: QueryParams = useMemo(() => ({
    search: searchQuery || undefined,
    filters: {
      level: selectedLevel !== 'all' ? selectedLevel : undefined,
      isPublished: selectedStatus === 'published' ? true : selectedStatus === 'draft' ? false : undefined,
    },
  }), [searchQuery, selectedLevel, selectedStatus]);

  const { data: coursesResponse, isLoading, error } = useQuery({
    queryKey: ['courses', queryParams],
    queryFn: () => apiClient.getCourses(queryParams),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete course');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => apiClient.duplicateCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course duplicated successfully');
    },
    onError: () => {
      toast.error('Failed to duplicate course');
    },
  });

  const courses = coursesResponse?.data?.items || [];
  const totalCourses = coursesResponse?.data?.total || 0;

  const handleDeleteCourse = async (course: Course) => {
    if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      deleteMutation.mutate(course.id);
    }
  };

  const handleDuplicateCourse = (course: Course) => {
    duplicateMutation.mutate(course.id);
  };

  const handleBulkDelete = async () => {
    if (selectedCourses.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedCourses.length} courses?`)) {
      try {
        await Promise.all(selectedCourses.map(id => apiClient.deleteCourse(id)));
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        setSelectedCourses([]);
        toast.success(`${selectedCourses.length} courses deleted successfully`);
      } catch (error) {
        toast.error('Failed to delete some courses');
      }
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const selectAllCourses = () => {
    setSelectedCourses(courses.map(course => course.id));
  };

  const clearSelection = () => {
    setSelectedCourses([]);
  };

  const getLevelColor = (level: CEFRLevel) => {
    const colors = {
      A1: 'bg-green-100 text-green-800',
      A2: 'bg-green-200 text-green-900',
      B1: 'bg-yellow-100 text-yellow-800',
      B2: 'bg-yellow-200 text-yellow-900',
      C1: 'bg-red-100 text-red-800',
      C2: 'bg-red-200 text-red-900',
    };
    return colors[level] || 'bg-secondary-100 text-secondary-800';
  };

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-error-600">Failed to load courses</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['courses'] })}
            className="mt-2 text-sm text-primary-600 hover:text-primary-500"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Courses</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage your Turkish language courses and curriculum
          </p>
        </div>
        <button
          onClick={onCreateCourse}
          className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Course
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-1 items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="block w-full rounded-lg border border-secondary-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-secondary-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              showFilters
                ? 'border-primary-300 bg-primary-50 text-primary-700'
                : 'border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50'
            )}
          >
            <FunnelIcon className="mr-2 h-4 w-4" />
            Filters
          </button>
        </div>

        {selectedCourses.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-secondary-600">
              {selectedCourses.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center rounded-lg bg-error-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-error-700"
            >
              <TrashIcon className="mr-1 h-4 w-4" />
              Delete
            </button>
            <button
              onClick={clearSelection}
              className="text-sm text-secondary-600 hover:text-secondary-900"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-secondary-200 bg-white p-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as CEFRLevel | 'all')}
                  className="mt-1 block w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Levels</option>
                  {Object.values(CEFRLevel).map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'published' | 'draft')}
                  className="mt-1 block w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary-600">
          Showing {courses.length} of {totalCourses} courses
        </p>
        {courses.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={selectedCourses.length === courses.length ? clearSelection : selectAllCourses}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              {selectedCourses.length === courses.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        )}
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-secondary-200 bg-white p-6">
              <div className="h-4 bg-secondary-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-secondary-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-secondary-200 rounded w-2/3 mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-secondary-200 rounded w-12"></div>
                <div className="h-6 bg-secondary-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-secondary-500">No courses found</p>
          <button
            onClick={onCreateCourse}
            className="mt-4 inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            Create your first course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isSelected={selectedCourses.includes(course.id)}
              onSelect={() => toggleCourseSelection(course.id)}
              onEdit={() => onEditCourse(course)}
              onView={() => onViewCourse(course)}
              onDelete={() => handleDeleteCourse(course)}
              onDuplicate={() => handleDuplicateCourse(course)}
              getLevelColor={getLevelColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  getLevelColor: (level: CEFRLevel) => string;
}

function CourseCard({
  course,
  isSelected,
  onSelect,
  onEdit,
  onView,
  onDelete,
  onDuplicate,
  getLevelColor,
}: CourseCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={clsx(
        'relative rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md',
        isSelected ? 'border-primary-300 ring-2 ring-primary-100' : 'border-secondary-200'
      )}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
        />
      </div>

      {/* Menu */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 z-10 mt-1 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
              >
                <div className="py-1">
                  <button
                    onClick={() => { onView(); setShowMenu(false); }}
                    className="flex w-full items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    <EyeIcon className="mr-3 h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => { onEdit(); setShowMenu(false); }}
                    className="flex w-full items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    <PencilIcon className="mr-3 h-4 w-4" />
                    Edit Course
                  </button>
                  <button
                    onClick={() => { onDuplicate(); setShowMenu(false); }}
                    className="flex w-full items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                  >
                    <DocumentDuplicateIcon className="mr-3 h-4 w-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => { onDelete(); setShowMenu(false); }}
                    className="flex w-full items-center px-4 py-2 text-sm text-error-700 hover:bg-error-50"
                  >
                    <TrashIcon className="mr-3 h-4 w-4" />
                    Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Course Image */}
      <div className="mb-4 mt-6">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="h-32 w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-32 items-center justify-center rounded-lg bg-secondary-100">
            <span className="text-secondary-400">No image</span>
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-secondary-900 line-clamp-2">{course.title}</h3>
          <p className="mt-1 text-sm text-secondary-600 line-clamp-2">{course.description}</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', getLevelColor(course.level))}>
            {course.level}
          </span>
          <span className={clsx(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            course.isPublished
              ? 'bg-success-100 text-success-800'
              : 'bg-warning-100 text-warning-800'
          )}>
            {course.isPublished ? (
              <>
                <CheckCircleIcon className="mr-1 h-3 w-3" />
                Published
              </>
            ) : (
              <>
                <XCircleIcon className="mr-1 h-3 w-3" />
                Draft
              </>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-secondary-500">
          <span>{course.totalLessons} lessons</span>
          <span>{course.estimatedHours}h</span>
        </div>
      </div>
    </motion.div>
  );
}
