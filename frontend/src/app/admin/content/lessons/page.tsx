'use client';

import { useState } from 'react';

const sampleLessons = [
  // Unit 1: MERHABA - Hello (3 lessons)
  { id: '1', unitId: '1', unitTitle: 'MERHABA - Hello', title: 'Basic Greetings', lessonNumber: 1, description: 'Learn essential Turkish greetings: Merhaba, Günaydın, İyi akşamlar', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '2', unitId: '1', unitTitle: 'MERHABA - Hello', title: 'Introducing Yourself', lessonNumber: 2, description: 'Learn how to introduce yourself: Ben... Adım...', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'conversation' },
  { id: '3', unitId: '1', unitTitle: 'MERHABA - Hello', title: 'Polite Expressions', lessonNumber: 3, description: 'Learn courtesy expressions: Lütfen, Teşekkürler, Özür dilerim', estimatedMinutes: 40, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  
  // Unit 2: TANIŞMA - Meeting People (3 lessons)
  { id: '4', unitId: '2', unitTitle: 'TANIŞMA - Meeting People', title: 'Personal Information', lessonNumber: 1, description: 'Share personal details: name, age, nationality', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '5', unitId: '2', unitTitle: 'TANIŞMA - Meeting People', title: 'Countries and Nationalities', lessonNumber: 2, description: 'Learn country names and nationalities in Turkish', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '6', unitId: '2', unitTitle: 'TANIŞMA - Meeting People', title: 'Asking Questions', lessonNumber: 3, description: 'Learn to ask personal questions: Adın ne? Nerelisin?', estimatedMinutes: 55, difficultyLevel: 'A1', isPublished: true, lessonType: 'grammar' },
  
  // Unit 3: AİLE - Family (3 lessons)
  { id: '7', unitId: '3', unitTitle: 'AİLE - Family', title: 'Family Members', lessonNumber: 1, description: 'Learn family vocabulary: anne, baba, kardeş, etc.', estimatedMinutes: 45, difficultyLevel: 'A1', isPublished: true, lessonType: 'vocabulary' },
  { id: '8', unitId: '3', unitTitle: 'AİLE - Family', title: 'Describing Family', lessonNumber: 2, description: 'Describe your family members and relationships', estimatedMinutes: 50, difficultyLevel: 'A1', isPublished: true, lessonType: 'conversation' },
  { id: '9', unitId: '3', unitTitle: 'AİLE - Family', title: 'Possessive Pronouns', lessonNumber: 3, description: 'Learn possessive forms: benim, senin, onun', estimatedMinutes: 55, difficultyLevel: 'A1', isPublished: true, lessonType: 'grammar' },
];

export default function LessonsPage() {
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const filteredLessons = sampleLessons.filter(lesson => {
    if (selectedUnit && lesson.unitId !== selectedUnit) return false;
    if (selectedType && lesson.lessonType !== selectedType) return false;
    return true;
  });

  // Create unique units array properly
  const unitsMap = new Map();
  sampleLessons.forEach(l => {
    if (!unitsMap.has(l.unitId)) {
      unitsMap.set(l.unitId, { id: l.unitId, title: l.unitTitle });
    }
  });
  const units = Array.from(unitsMap.values());

  const lessonTypes = [...new Set(sampleLessons.map(l => l.lessonType))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lesson Management</h1>
          <p className="text-gray-600 mt-1">Create and manage individual lessons with unified structure</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Create New Lesson
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Unit</label>
            <select 
              value={selectedUnit} 
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All Units</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              {lessonTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Lessons ({filteredLessons.length})</h3>
          <div className="space-y-3">
            {filteredLessons.map(lesson => (
              <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">Lesson {lesson.lessonNumber}: {lesson.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        lesson.lessonType === 'vocabulary' ? 'bg-blue-100 text-blue-700' :
                        lesson.lessonType === 'grammar' ? 'bg-green-100 text-green-700' :
                        lesson.lessonType === 'conversation' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {lesson.lessonType}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{lesson.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>📖 Unit: {lesson.unitTitle}</span>
                      <span>⏱️ {lesson.estimatedMinutes} minutes</span>
                      <span>📊 Level: {lesson.difficultyLevel}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs ${lesson.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {lesson.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lesson Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Total Lessons</h3>
          <p className="text-2xl font-bold text-gray-900">36</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Published</h3>
          <p className="text-2xl font-bold text-green-600">36</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Vocabulary Lessons</h3>
          <p className="text-2xl font-bold text-blue-600">18</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Grammar Lessons</h3>
          <p className="text-2xl font-bold text-purple-600">12</p>
        </div>
      </div>

      {/* Unified Lesson Structure Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📚 Unified Lesson Structure</h3>
        <p className="text-blue-800 text-sm mb-3">
          Each lesson follows the unified structure with 13 sub-lesson types for comprehensive learning.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1"><span>🎯</span> Preparation</div>
          <div className="flex items-center gap-1"><span>📖</span> Reading</div>
          <div className="flex items-center gap-1"><span>📝</span> Grammar</div>
          <div className="flex items-center gap-1"><span>🎧</span> Listening</div>
          <div className="flex items-center gap-1"><span>🗣️</span> Speaking</div>
          <div className="flex items-center gap-1"><span>✍️</span> Writing</div>
          <div className="flex items-center gap-1"><span>📚</span> Vocabulary</div>
          <div className="flex items-center gap-1"><span>🏛️</span> Culture</div>
          <div className="flex items-center gap-1"><span>🎭</span> Dialogue</div>
          <div className="flex items-center gap-1"><span>🎵</span> Pronunciation</div>
          <div className="flex items-center gap-1"><span>🔄</span> Review</div>
          <div className="flex items-center gap-1"><span>🎯</span> Assessment</div>
          <div className="flex items-center gap-1"><span>🏆</span> Practice</div>
        </div>
      </div>
    </div>
  );
}
