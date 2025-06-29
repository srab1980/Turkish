'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { PlusIcon, PuzzlePieceIcon, PlayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Mock exercises data
  const exercises = [
    {
      id: '1',
      title: 'Greeting Vocabulary Quiz',
      description: 'Multiple choice quiz on basic Turkish greetings',
      type: 'multiple_choice',
      difficulty: 'beginner',
      lessonId: '1',
      lessonName: 'Basic Greetings',
      questions: 10,
      averageScore: 85,
      completions: 42,
      isPublished: true
    },
    {
      id: '2',
      title: 'Number Pronunciation',
      description: 'Listen and repeat Turkish numbers 1-20',
      type: 'audio_repeat',
      difficulty: 'beginner',
      lessonId: '2',
      lessonName: 'Numbers 1-20',
      questions: 20,
      averageScore: 78,
      completions: 35,
      isPublished: true
    },
    {
      id: '3',
      title: 'Fill in the Blanks - Conversations',
      description: 'Complete the missing words in daily conversations',
      type: 'fill_blanks',
      difficulty: 'intermediate',
      lessonId: '3',
      lessonName: 'Daily Conversations',
      questions: 15,
      averageScore: 72,
      completions: 28,
      isPublished: true
    },
    {
      id: '4',
      title: 'Grammar Structure Matching',
      description: 'Match sentence parts to form correct grammar structures',
      type: 'matching',
      difficulty: 'advanced',
      lessonId: '4',
      lessonName: 'Advanced Grammar',
      questions: 12,
      averageScore: 0,
      completions: 0,
      isPublished: false
    }
  ];

  const exerciseTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'fill_blanks', label: 'Fill in the Blanks' },
    { value: 'matching', label: 'Matching' },
    { value: 'audio_repeat', label: 'Audio Repeat' },
    { value: 'drag_drop', label: 'Drag & Drop' }
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || exercise.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice': return '✅';
      case 'fill_blanks': return '📝';
      case 'matching': return '🔗';
      case 'audio_repeat': return '🎤';
      case 'drag_drop': return '🎯';
      default: return '❓';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Exercises</h1>
              <p className="mt-1 text-sm text-gray-600">
                Create and manage interactive learning exercises
              </p>
            </div>
            <button className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Exercise
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {exerciseTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <span className="text-lg">{getTypeIcon(exercise.type)}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{exercise.title}</h3>
                    <p className="text-sm text-gray-500">{exercise.lessonName}</p>
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

              <p className="mt-3 text-sm text-gray-600">{exercise.description}</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">
                    {exercise.questions} questions
                  </span>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  exercise.isPublished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {exercise.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Completions:</span>
                  <span className="ml-1 font-medium">{exercise.completions}</span>
                </div>
                <div>
                  <span className="text-gray-500">Avg Score:</span>
                  <span className="ml-1 font-medium">{exercise.averageScore}%</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500 capitalize">
                  {exercise.type.replace('_', ' ')}
                </span>
                <button className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  <PlayIcon className="mr-1 h-4 w-4" />
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <PuzzlePieceIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No exercises found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedType !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first exercise.'
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
