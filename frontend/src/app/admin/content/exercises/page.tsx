'use client';

import { useState } from 'react';

const sampleExercises = [
  // Unit 1 Exercises
  { id: '1', lessonId: '1', lessonTitle: 'Basic Greetings', title: 'Greeting Vocabulary Match', description: 'Match Turkish greetings with their meanings', type: 'matching', estimatedMinutes: 10, difficultyLevel: 'A1', isPublished: true },
  { id: '2', lessonId: '1', lessonTitle: 'Basic Greetings', title: 'Greeting Pronunciation', description: 'Practice pronouncing Turkish greetings correctly', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1', isPublished: true },
  { id: '3', lessonId: '1', lessonTitle: 'Basic Greetings', title: 'Greeting Listening', description: 'Listen and identify different greetings', type: 'listening', estimatedMinutes: 12, difficultyLevel: 'A1', isPublished: true },
  
  { id: '4', lessonId: '2', lessonTitle: 'Introducing Yourself', title: 'Self Introduction Practice', description: 'Practice introducing yourself using Ben... Adım...', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1', isPublished: true },
  { id: '5', lessonId: '2', lessonTitle: 'Introducing Yourself', title: 'Introduction Fill-in-Blanks', description: 'Complete introduction sentences', type: 'fill-in-blanks', estimatedMinutes: 10, difficultyLevel: 'A1', isPublished: true },
  { id: '6', lessonId: '2', lessonTitle: 'Introducing Yourself', title: 'Introduction Dialogue', description: 'Role-play introduction conversations', type: 'dialogue', estimatedMinutes: 20, difficultyLevel: 'A1', isPublished: true },
  
  { id: '7', lessonId: '3', lessonTitle: 'Polite Expressions', title: 'Polite Expressions Quiz', description: 'Choose the correct polite expression', type: 'multiple-choice', estimatedMinutes: 8, difficultyLevel: 'A1', isPublished: true },
  { id: '8', lessonId: '3', lessonTitle: 'Polite Expressions', title: 'Courtesy Conversation', description: 'Practice using polite expressions in context', type: 'conversation', estimatedMinutes: 18, difficultyLevel: 'A1', isPublished: true },
];

export default function ExercisesPage() {
  const [selectedType, setSelectedType] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');

  const filteredExercises = sampleExercises.filter(exercise => {
    if (selectedType && exercise.type !== selectedType) return false;
    if (selectedLesson && exercise.lessonId !== selectedLesson) return false;
    return true;
  });

  const exerciseTypes = [...new Set(sampleExercises.map(e => e.type))];

  // Create unique lessons array properly
  const lessonsMap = new Map();
  sampleExercises.forEach(e => {
    if (!lessonsMap.has(e.lessonId)) {
      lessonsMap.set(e.lessonId, { id: e.lessonId, title: e.lessonTitle });
    }
  });
  const lessons = Array.from(lessonsMap.values());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercise Management</h1>
          <p className="text-gray-600 mt-1">Create and manage interactive exercises and activities</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Create New Exercise
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              {exerciseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Lesson</label>
            <select 
              value={selectedLesson} 
              onChange={(e) => setSelectedLesson(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All Lessons</option>
              {lessons.map(lesson => (
                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Exercises ({filteredExercises.length})</h3>
          <div className="space-y-3">
            {filteredExercises.map(exercise => (
              <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{exercise.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        exercise.type === 'matching' ? 'bg-blue-100 text-blue-700' :
                        exercise.type === 'speaking' ? 'bg-green-100 text-green-700' :
                        exercise.type === 'listening' ? 'bg-purple-100 text-purple-700' :
                        exercise.type === 'multiple-choice' ? 'bg-orange-100 text-orange-700' :
                        exercise.type === 'fill-in-blanks' ? 'bg-pink-100 text-pink-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {exercise.type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{exercise.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>📝 Lesson: {exercise.lessonTitle}</span>
                      <span>⏱️ {exercise.estimatedMinutes} minutes</span>
                      <span>📊 Level: {exercise.difficultyLevel}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs ${exercise.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {exercise.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                      ▶️ Preview
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Total Exercises</h3>
          <p className="text-2xl font-bold text-gray-900">75</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Published</h3>
          <p className="text-2xl font-bold text-green-600">75</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Interactive Types</h3>
          <p className="text-2xl font-bold text-blue-600">10</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Avg Duration</h3>
          <p className="text-2xl font-bold text-purple-600">15min</p>
        </div>
      </div>

      {/* Exercise Types Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">🎯 Available Exercise Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1"><span>🔗</span> Matching</div>
          <div className="flex items-center gap-1"><span>🗣️</span> Speaking</div>
          <div className="flex items-center gap-1"><span>🎧</span> Listening</div>
          <div className="flex items-center gap-1"><span>❓</span> Multiple Choice</div>
          <div className="flex items-center gap-1"><span>📝</span> Fill-in-Blanks</div>
          <div className="flex items-center gap-1"><span>🎭</span> Dialogue</div>
          <div className="flex items-center gap-1"><span>💬</span> Conversation</div>
          <div className="flex items-center gap-1"><span>📚</span> Vocabulary</div>
          <div className="flex items-center gap-1"><span>📖</span> Reading</div>
          <div className="flex items-center gap-1"><span>✍️</span> Writing</div>
        </div>
      </div>
    </div>
  );
}
