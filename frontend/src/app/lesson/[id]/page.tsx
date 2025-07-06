'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { curriculumApi } from '@/lib/curriculum-api';
import InteractiveLessonRouter from '@/components/lessons/InteractiveLessonRouter';
import { UserProgressProvider } from '@/contexts/UserProgressContext';
import { AppError, handleError, LessonError } from '@/lib/error-handler';
import { LessonErrorBoundary } from '@/components/ErrorBoundary';
import { Lesson, Exercise, ExerciseType, VocabularyItem, Question } from '@/types/lesson.types';

interface LessonPageProps {
  params: { id: string };
}

const LessonPage: React.FC<LessonPageProps> = ({ params }) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadLesson = async () => {
      try {
        console.log('🔄 Loading lesson from curriculum:', params.id);
        setLoading(true);
        setError(null);

        // Get lesson from real curriculum
        const allLessons = curriculumApi.getAllLessons();
        console.log('🔍 Looking for lesson ID:', params.id);
        console.log('📚 Available lesson IDs:', allLessons.map(l => l.id));
        
        const lessonData = curriculumApi.getLesson(params.id);
        
        if (!lessonData) {
          console.error('❌ Lesson not found. Looking for ID:', params.id);
          console.error('📋 Available lessons:', allLessons);
          throw new LessonError(
            'LESSON_NOT_FOUND',
            `Lesson with ID ${params.id} not found in curriculum`,
            'Lesson loading'
          );
        }

        console.log('✅ Lesson loaded successfully:', {
          id: lessonData.id,
          title: lessonData.title,
          unitId: lessonData.unitId,
          exerciseCount: lessonData.exercises.length
        });

        setLesson(lessonData);
      } catch (error) {
        console.error('❌ Failed to load lesson:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load lesson';
        setError(errorMessage);
        handleError(error, `Loading lesson ${params.id}`);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadLesson();
    }
  }, [params.id]);

  const handleLessonComplete = async (lessonId: string, score: number, timeSpent: number) => {
    try {
      console.log('🎉 Lesson completed:', { lessonId, score, timeSpent });
      // TODO: Save progress to backend/local storage
      
      // Navigate to next lesson or unit overview
      const allLessons = curriculumApi.getAllLessons();
      const currentIndex = allLessons.findIndex(l => l.id === lessonId);
      
      if (currentIndex < allLessons.length - 1) {
        const nextLesson = allLessons[currentIndex + 1];
        router.push(`/lesson/${nextLesson.id}`);
      } else {
        router.push('/lessons'); // Go to lessons overview
      }
    } catch (error) {
      handleError(error, 'Lesson completion');
    }
  };

  const handleExerciseComplete = async (exerciseId: string, score: number, timeSpent: number) => {
    try {
      console.log('✅ Exercise completed:', { exerciseId, score, timeSpent });
      // TODO: Save exercise progress
    } catch (error) {
      handleError(error, 'Exercise completion');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Lesson Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/lessons')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Lessons
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No lesson data available</p>
        </div>
      </div>
    );
  }

  return (
    <LessonErrorBoundary>
      <UserProgressProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Lesson Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
                  <p className="text-gray-600 mt-1">{lesson.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>📚 Unit {lesson.unitId.split('-')[1]}</span>
                    <span>⏱️ {lesson.estimatedMinutes} minutes</span>
                    <span>🎯 {lesson.difficultyLevel}</span>
                    <span>🎮 {lesson.exercises.length} exercises</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/lessons')}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ← Back to Lessons
                </button>
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <InteractiveLessonRouter
              lesson={lesson}
              userProgress={{}}
              onLessonComplete={handleLessonComplete}
              onExerciseComplete={handleExerciseComplete}
            />
          </div>
        </div>
      </UserProgressProvider>
    </LessonErrorBoundary>
  );
};

export default LessonPage;
