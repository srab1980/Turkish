'use client';

import React, { useState, useEffect } from 'react';
import { curriculumApi } from '@/lib/curriculum-api';
import { Lesson, Unit } from '@/types/lesson.types';

const DebugCurriculumPage: React.FC = () => {
  const [curriculum, setCurriculum] = useState<{
    course: any;
    units: Unit[];
    lessons: Lesson[];
  } | null>(null);

  useEffect(() => {
    try {
      const curriculumData = curriculumApi.getCompleteCurriculum();
      setCurriculum(curriculumData);
    } catch (error) {
      console.error('Failed to load curriculum:', error);
    }
  }, []);

  if (!curriculum) {
    return <div className="p-8">Loading curriculum...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Curriculum Debug Information</h1>
      
      {/* Course Info */}
      <div className="mb-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Course Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><strong>ID:</strong> {curriculum.course.id}</div>
          <div><strong>Title:</strong> {curriculum.course.title}</div>
          <div><strong>Level:</strong> {curriculum.course.difficultyLevel}</div>
          <div><strong>Hours:</strong> {curriculum.course.estimatedHours}</div>
        </div>
      </div>

      {/* Units Info */}
      <div className="mb-8 p-6 bg-green-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Units ({curriculum.units.length})</h2>
        <div className="grid grid-cols-1 gap-4">
          {curriculum.units.map((unit, index) => (
            <div key={unit.id} className="p-4 bg-white rounded border">
              <div className="grid grid-cols-3 gap-4">
                <div><strong>ID:</strong> {unit.id}</div>
                <div><strong>Number:</strong> {unit.unitNumber}</div>
                <div><strong>Title:</strong> {unit.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lessons Info */}
      <div className="mb-8 p-6 bg-yellow-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Lessons ({curriculum.lessons.length})</h2>
        <div className="grid grid-cols-1 gap-2">
          {curriculum.lessons.map((lesson, index) => (
            <div key={lesson.id} className="p-3 bg-white rounded border flex items-center justify-between">
              <div className="grid grid-cols-4 gap-4 flex-1">
                <div><strong>ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">{lesson.id}</code></div>
                <div><strong>Unit:</strong> {lesson.unitId}</div>
                <div><strong>Lesson #:</strong> {lesson.lessonNumber}</div>
                <div><strong>Title:</strong> {lesson.title}</div>
              </div>
              <div className="ml-4">
                <a 
                  href={`/lesson/${lesson.id}`}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Test Lesson
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exercises Info */}
      <div className="mb-8 p-6 bg-purple-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Exercise Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Total Exercises:</strong> {curriculum.lessons.reduce((total, lesson) => total + lesson.exercises.length, 0)}</div>
          <div><strong>Exercises per Lesson:</strong> {curriculum.lessons[0]?.exercises.length || 0}</div>
        </div>
        
        <h3 className="text-lg font-bold mt-4 mb-2">Exercise Types per Lesson:</h3>
        <div className="bg-white p-4 rounded border">
          {curriculum.lessons[0]?.exercises.map((exercise, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</span>
              <span>{exercise.type}</span>
              <span className="text-gray-500">({exercise.title})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Test Links */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Quick Test Links</h2>
        <div className="grid grid-cols-3 gap-4">
          <a href="/lessons" className="bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700">
            📚 Lessons Page
          </a>
          <a href="/lesson/unit-1-lesson-1" className="bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700">
            🎯 First Lesson
          </a>
          <a href="/lesson/unit-6-lesson-3" className="bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700">
            🏁 Last Lesson
          </a>
        </div>
      </div>
    </div>
  );
};

export default DebugCurriculumPage;
