'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  PuzzlePieceIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { CEFRLevel, ExerciseType } from '@/types';
import apiClient from '@/lib/api';
import { clsx } from 'clsx';

interface GenerationOptions {
  lessonId: string;
  exerciseTypes: ExerciseType[];
  count: number;
  difficulty: CEFRLevel;
  focusAreas: string[];
  includeAudio: boolean;
  includeImages: boolean;
}

interface GeneratedExercise {
  id: string;
  type: ExerciseType;
  title: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: CEFRLevel;
  points: number;
  aiConfidence: number;
  metadata: {
    focusArea: string;
    estimatedTime: number;
    keywords: string[];
  };
}

export default function ExerciseGenerator() {
  const queryClient = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>({
    lessonId: '',
    exerciseTypes: [ExerciseType.MULTIPLE_CHOICE],
    count: 5,
    difficulty: CEFRLevel.A1,
    focusAreas: [],
    includeAudio: false,
    includeImages: false,
  });
  const [generatedExercises, setGeneratedExercises] = useState<GeneratedExercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const { data: lessonsResponse } = useQuery({
    queryKey: ['lessons-for-generation'],
    queryFn: () => apiClient.getLessonsForGeneration(),
  });

  const generateExercisesMutation = useMutation({
    mutationFn: (options: GenerationOptions) => apiClient.generateExercises(options),
    onSuccess: (response) => {
      setGeneratedExercises(response.data || []);
      toast.success('Exercises generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate exercises');
    },
  });

  const saveExercisesMutation = useMutation({
    mutationFn: (exercises: GeneratedExercise[]) => apiClient.saveGeneratedExercises(exercises),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setGeneratedExercises([]);
      setSelectedExercises([]);
      toast.success('Exercises saved successfully');
    },
    onError: () => {
      toast.error('Failed to save exercises');
    },
  });

  const lessons = lessonsResponse?.data || [];

  const exerciseTypeOptions = [
    { value: ExerciseType.MULTIPLE_CHOICE, label: 'Multiple Choice' },
    { value: ExerciseType.FILL_IN_BLANK, label: 'Fill in the Blank' },
    { value: ExerciseType.DRAG_DROP, label: 'Drag & Drop' },
    { value: ExerciseType.VOCABULARY_MATCHING, label: 'Vocabulary Matching' },
    { value: ExerciseType.GRAMMAR_CORRECTION, label: 'Grammar Correction' },
    { value: ExerciseType.READING_COMPREHENSION, label: 'Reading Comprehension' },
  ];

  const focusAreaOptions = [
    'Grammar',
    'Vocabulary',
    'Reading Comprehension',
    'Listening',
    'Speaking',
    'Writing',
    'Pronunciation',
    'Cultural Context',
  ];

  const handleGenerateExercises = () => {
    if (!generationOptions.lessonId) {
      toast.error('Please select a lesson');
      return;
    }
    if (generationOptions.exerciseTypes.length === 0) {
      toast.error('Please select at least one exercise type');
      return;
    }

    generateExercisesMutation.mutate(generationOptions);
  };

  const handleSaveSelected = () => {
    const exercisesToSave = generatedExercises.filter(ex => selectedExercises.includes(ex.id));
    if (exercisesToSave.length === 0) {
      toast.error('Please select exercises to save');
      return;
    }

    saveExercisesMutation.mutate(exercisesToSave);
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises(prev =>
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const selectAllExercises = () => {
    setSelectedExercises(generatedExercises.map(ex => ex.id));
  };

  const clearSelection = () => {
    setSelectedExercises([]);
  };

  const getExerciseTypeIcon = (type: ExerciseType) => {
    return <PuzzlePieceIcon className="h-5 w-5" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success-600';
    if (confidence >= 0.6) return 'text-warning-600';
    return 'text-error-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-secondary-900">Exercise Generator</h2>
        <p className="mt-1 text-sm text-secondary-600">
          Generate exercises automatically using AI based on lesson content
        </p>
      </div>

      {/* Generation Form */}
      <div className="rounded-lg border border-secondary-200 bg-white p-6">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">Generation Settings</h3>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700">Select Lesson *</label>
              <select
                value={generationOptions.lessonId}
                onChange={(e) => setGenerationOptions(prev => ({ ...prev, lessonId: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Choose a lesson...</option>
                {lessons.map((lesson: any) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} ({lesson.unit?.course?.title})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700">Exercise Types *</label>
              <div className="mt-2 space-y-2">
                {exerciseTypeOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={generationOptions.exerciseTypes.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setGenerationOptions(prev => ({
                            ...prev,
                            exerciseTypes: [...prev.exerciseTypes, option.value]
                          }));
                        } else {
                          setGenerationOptions(prev => ({
                            ...prev,
                            exerciseTypes: prev.exerciseTypes.filter(type => type !== option.value)
                          }));
                        }
                      }}
                      className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-secondary-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700">Number of Exercises</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={generationOptions.count}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700">Difficulty Level</label>
                <select
                  value={generationOptions.difficulty}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, difficulty: e.target.value as CEFRLevel }))}
                  className="mt-1 block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {Object.values(CEFRLevel).map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700">Focus Areas</label>
              <div className="mt-2 space-y-2">
                {focusAreaOptions.map((area) => (
                  <label key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={generationOptions.focusAreas.includes(area)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setGenerationOptions(prev => ({
                            ...prev,
                            focusAreas: [...prev.focusAreas, area]
                          }));
                        } else {
                          setGenerationOptions(prev => ({
                            ...prev,
                            focusAreas: prev.focusAreas.filter(f => f !== area)
                          }));
                        }
                      }}
                      className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-secondary-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={generationOptions.includeAudio}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, includeAudio: e.target.checked }))}
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">Include audio components</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={generationOptions.includeImages}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">Include image components</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGenerateExercises}
            disabled={generateExercisesMutation.isPending}
            className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {generateExercisesMutation.isPending ? (
              <>
                <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="mr-2 h-4 w-4" />
                Generate Exercises
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Exercises */}
      {generatedExercises.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-secondary-900">
              Generated Exercises ({generatedExercises.length})
            </h3>
            <div className="flex items-center space-x-3">
              {selectedExercises.length > 0 && (
                <>
                  <span className="text-sm text-secondary-600">
                    {selectedExercises.length} selected
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-secondary-600 hover:text-secondary-900"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSaveSelected}
                    disabled={saveExercisesMutation.isPending}
                    className="inline-flex items-center rounded-lg bg-success-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-success-700 disabled:opacity-50"
                  >
                    <CheckIcon className="mr-1 h-4 w-4" />
                    Save Selected
                  </button>
                </>
              )}
              <button
                onClick={selectedExercises.length === generatedExercises.length ? clearSelection : selectAllExercises}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {selectedExercises.length === generatedExercises.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {generatedExercises.map((exercise) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  'rounded-lg border bg-white p-6 transition-all duration-200',
                  selectedExercises.includes(exercise.id)
                    ? 'border-primary-300 ring-2 ring-primary-100'
                    : 'border-secondary-200 hover:border-secondary-300'
                )}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedExercises.includes(exercise.id)}
                    onChange={() => toggleExerciseSelection(exercise.id)}
                    className="mt-1 h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-2">
                        {getExerciseTypeIcon(exercise.type)}
                        <span className="text-sm font-medium text-secondary-900">{exercise.title}</span>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800">
                        {exercise.type.replace('_', ' ')}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-medium text-secondary-800">
                        {exercise.difficulty}
                      </span>
                      <span className={clsx('text-xs font-medium', getConfidenceColor(exercise.aiConfidence))}>
                        {(exercise.aiConfidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-secondary-700">Question:</p>
                        <p className="text-sm text-secondary-900">{exercise.question}</p>
                      </div>

                      {exercise.options && exercise.options.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-secondary-700">Options:</p>
                          <ul className="mt-1 space-y-1">
                            {exercise.options.map((option, index) => (
                              <li
                                key={index}
                                className={clsx(
                                  'text-sm px-2 py-1 rounded',
                                  option === exercise.correctAnswer
                                    ? 'bg-success-100 text-success-800 font-medium'
                                    : 'text-secondary-700'
                                )}
                              >
                                {String.fromCharCode(65 + index)}. {option}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {exercise.explanation && (
                        <div>
                          <p className="text-sm font-medium text-secondary-700">Explanation:</p>
                          <p className="text-sm text-secondary-600">{exercise.explanation}</p>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-secondary-500">
                        <span>Focus: {exercise.metadata.focusArea}</span>
                        <span>Time: {exercise.metadata.estimatedTime} min</span>
                        <span>Points: {exercise.points}</span>
                        {exercise.metadata.keywords.length > 0 && (
                          <span>Keywords: {exercise.metadata.keywords.slice(0, 3).join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
