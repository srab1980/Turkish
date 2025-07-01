'use client';

import { useState } from 'react';

const sampleExams = [
  {
    id: '1',
    title: 'Unit 1 Assessment - MERHABA',
    description: 'Comprehensive assessment for greetings and basic introductions',
    unitId: '1',
    unitTitle: 'MERHABA - Hello',
    level: 'A1',
    duration: 30,
    totalQuestions: 20,
    passingScore: 70,
    attempts: 145,
    averageScore: 78,
    isPublished: true,
    examType: 'unit_assessment'
  },
  {
    id: '2',
    title: 'Unit 2 Assessment - TANIŞMA',
    description: 'Assessment covering personal information and introductions',
    unitId: '2',
    unitTitle: 'TANIŞMA - Meeting People',
    level: 'A1',
    duration: 35,
    totalQuestions: 25,
    passingScore: 70,
    attempts: 132,
    averageScore: 75,
    isPublished: true,
    examType: 'unit_assessment'
  },
  {
    id: '3',
    title: 'Unit 3 Assessment - AİLE',
    description: 'Family vocabulary and possessive pronouns assessment',
    unitId: '3',
    unitTitle: 'AİLE - Family',
    level: 'A1',
    duration: 25,
    totalQuestions: 18,
    passingScore: 70,
    attempts: 98,
    averageScore: 82,
    isPublished: true,
    examType: 'unit_assessment'
  },
  {
    id: '4',
    title: 'A1 Midterm Exam',
    description: 'Comprehensive midterm covering Units 1-6',
    unitId: 'multiple',
    unitTitle: 'Units 1-6',
    level: 'A1',
    duration: 60,
    totalQuestions: 50,
    passingScore: 65,
    attempts: 67,
    averageScore: 71,
    isPublished: true,
    examType: 'midterm'
  },
  {
    id: '5',
    title: 'A1 Final Exam',
    description: 'Final comprehensive exam covering all A1 units',
    unitId: 'all',
    unitTitle: 'All Units (1-12)',
    level: 'A1',
    duration: 90,
    totalQuestions: 75,
    passingScore: 60,
    attempts: 23,
    averageScore: 68,
    isPublished: false,
    examType: 'final'
  }
];

export default function ExamsPage() {
  const [selectedType, setSelectedType] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  const filteredExams = sampleExams.filter(exam => {
    if (selectedType && exam.examType !== selectedType) return false;
    if (selectedUnit && exam.unitId !== selectedUnit && exam.unitId !== 'multiple' && exam.unitId !== 'all') return false;
    return true;
  });

  const examTypes = [...new Set(sampleExams.map(e => e.examType))];

  // Create unique units array properly
  const unitsMap = new Map();
  sampleExams.filter(e => e.unitId !== 'multiple' && e.unitId !== 'all').forEach(e => {
    if (!unitsMap.has(e.unitId)) {
      unitsMap.set(e.unitId, { id: e.unitId, title: e.unitTitle });
    }
  });
  const units = Array.from(unitsMap.values());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600 mt-1">Create and manage assessments, quizzes, and exams</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Create New Exam
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
              {examTypes.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
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
        </div>
      </div>

      {/* Exams List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Exams ({filteredExams.length})</h3>
          <div className="space-y-4">
            {filteredExams.map(exam => (
              <div key={exam.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-lg">{exam.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        exam.examType === 'unit_assessment' ? 'bg-blue-100 text-blue-700' :
                        exam.examType === 'midterm' ? 'bg-orange-100 text-orange-700' :
                        exam.examType === 'final' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {exam.examType.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {exam.level}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{exam.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">📖 Coverage:</span>
                        <div>{exam.unitTitle}</div>
                      </div>
                      <div>
                        <span className="font-medium">⏱️ Duration:</span>
                        <div>{exam.duration} minutes</div>
                      </div>
                      <div>
                        <span className="font-medium">❓ Questions:</span>
                        <div>{exam.totalQuestions}</div>
                      </div>
                      <div>
                        <span className="font-medium">🎯 Pass Score:</span>
                        <div>{exam.passingScore}%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-2 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">👥 Attempts:</span>
                        <span className="ml-1">{exam.attempts}</span>
                      </div>
                      <div>
                        <span className="font-medium">📊 Avg Score:</span>
                        <span className="ml-1">{exam.averageScore}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs ${exam.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {exam.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                      📊 Results
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                      ✏️ Edit
                    </button>
                    <button className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">
                      👁️ Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exam Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Total Exams</h3>
          <p className="text-2xl font-bold text-gray-900">15</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Published</h3>
          <p className="text-2xl font-bold text-green-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Total Attempts</h3>
          <p className="text-2xl font-bold text-blue-600">465</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Avg Pass Rate</h3>
          <p className="text-2xl font-bold text-purple-600">74%</p>
        </div>
      </div>

      {/* Exam Types Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📝 Exam Types Available</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded border">
            <h5 className="font-medium text-gray-900 mb-1">🎯 Unit Assessments</h5>
            <p className="text-gray-600 text-xs">Quick assessments after each unit completion</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <h5 className="font-medium text-gray-900 mb-1">📊 Midterm Exams</h5>
            <p className="text-gray-600 text-xs">Comprehensive exams covering multiple units</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <h5 className="font-medium text-gray-900 mb-1">🏆 Final Exams</h5>
            <p className="text-gray-600 text-xs">Complete course assessments for certification</p>
          </div>
        </div>
      </div>
    </div>
  );
}
