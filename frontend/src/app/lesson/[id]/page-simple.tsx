'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { curriculumService } from '@/lib/curriculum-service';

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id as string;
  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      const curriculumData = await curriculumService.getCurriculumData();
      const lesson = curriculumData.lessons.find(l => l.id === lessonId);
      setLessonData(lesson);
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!lessonData) {
    return <div>Lesson not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{lessonData.title}</h1>
      <p className="text-gray-600 mb-4">{lessonData.description}</p>
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Lesson Details</h2>
        <p><strong>Type:</strong> {lessonData.lessonType}</p>
        <p><strong>Duration:</strong> {lessonData.estimatedDuration} minutes</p>
        <p><strong>Difficulty:</strong> Level {lessonData.difficultyLevel}</p>
      </div>
    </div>
  );
}
