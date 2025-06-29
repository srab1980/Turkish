'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { PlusIcon, BookOpenIcon, PlayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function LessonsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // Mock lessons data
  const lessons = [
    {
      id: '1',
      title: 'Basic Greetings',
      description: 'Learn how to say hello, goodbye, and introduce yourself',
      courseId: '1',
      courseName: 'Turkish for Beginners',
      order: 1,
      duration: 15,
      type: 'video',
      isPublished: true,
      completions: 45
    },
    {
      id: '2',
      title: 'Numbers 1-20',
      description: 'Master Turkish numbers from one to twenty',
      courseId: '1',
      courseName: 'Turkish for Beginners',
      order: 2,
      duration: 12,
      type: 'interactive',
      isPublished: true,
      completions: 38
    },
    {
      id: '3',
      title: 'Daily Conversations',
      description: 'Practice common daily conversation scenarios',
      courseId: '2',
      courseName: 'Intermediate Turkish',
      order: 1,
      duration: 25,
      type: 'audio',
      isPublished: true,
      completions: 23
    },
    {
      id: '4',
      title: 'Advanced Grammar Structures',
      description: 'Complex sentence structures and advanced grammar',
      courseId: '3',
      courseName: 'Advanced Turkish',
      order: 1,
      duration: 30,
      type: 'text',
      isPublished: false,
      completions: 0
    }
  ];

  const courses = [
    { id: '1', name: 'Turkish for Beginners' },
    { id: '2', name: 'Intermediate Turkish' },
    { id: '3', name: 'Advanced Turkish' }
  ];

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || lesson.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'interactive': return '🎮';
      case 'text': return '📖';
      default: return '📄';
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage individual lessons and learning content
              </p>
            </div>
            <button className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Lesson
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredLessons.map((lesson) => (
            <div key={lesson.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <span className="text-lg">{getTypeIcon(lesson.type)}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                    <p className="text-sm text-gray-500">{lesson.courseName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="rounded p-1 text-gray-400 hover:text-gray-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="rounded p-1 text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-600">{lesson.description}</p>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500">Order: {lesson.order}</span>
                  <span className="text-gray-500">{lesson.duration} min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    lesson.isPublished 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lesson.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {lesson.completions} completions
                </span>
                <button className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  <PlayIcon className="mr-1 h-4 w-4" />
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No lessons found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedCourse !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first lesson.'
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
