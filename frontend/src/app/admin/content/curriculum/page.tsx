'use client';

import { useState } from 'react';

// Sample curriculum data
const sampleCourses = [
  {
    id: '1',
    title: 'Turkish A1 Complete Course - Istanbul Book',
    level: 'A1',
    description: 'Complete beginner Turkish course with 12 units and 36 lessons',
    estimatedHours: 180,
    isPublished: true
  }
];

const sampleUnits = [
  { id: '1', courseId: '1', title: 'MERHABA - Hello', unitNumber: 1, description: 'Introduction to Turkish greetings', estimatedHours: 15, isPublished: true },
  { id: '2', courseId: '1', title: 'TANIŞMA - Meeting People', unitNumber: 2, description: 'Learning introductions', estimatedHours: 15, isPublished: true },
  { id: '3', courseId: '1', title: 'AİLE - Family', unitNumber: 3, description: 'Family vocabulary', estimatedHours: 15, isPublished: true },
  { id: '4', courseId: '1', title: 'GÜNLÜK HAYAT - Daily Life', unitNumber: 4, description: 'Daily routines', estimatedHours: 15, isPublished: true },
  { id: '5', courseId: '1', title: 'ZAMAN - Time', unitNumber: 5, description: 'Time expressions', estimatedHours: 15, isPublished: true },
  { id: '6', courseId: '1', title: 'YEMEK - Food', unitNumber: 6, description: 'Food vocabulary', estimatedHours: 15, isPublished: true },
  { id: '7', courseId: '1', title: 'ALIŞVERİŞ - Shopping', unitNumber: 7, description: 'Shopping vocabulary', estimatedHours: 15, isPublished: true },
  { id: '8', courseId: '1', title: 'ULAŞIM - Transportation', unitNumber: 8, description: 'Transportation methods', estimatedHours: 15, isPublished: true },
  { id: '9', courseId: '1', title: 'SAĞLIK - Health', unitNumber: 9, description: 'Health vocabulary', estimatedHours: 15, isPublished: true },
  { id: '10', courseId: '1', title: 'HAVA DURUMU - Weather', unitNumber: 10, description: 'Weather conditions', estimatedHours: 15, isPublished: true },
  { id: '11', courseId: '1', title: 'HOBILER - Hobbies', unitNumber: 11, description: 'Leisure activities', estimatedHours: 15, isPublished: true },
  { id: '12', courseId: '1', title: 'TATİL - Vacation', unitNumber: 12, description: 'Travel vocabulary', estimatedHours: 15, isPublished: true }
];

export default function CurriculumPage() {
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  const handleLoadCurriculum = () => {
    setIsLoading(true);
    setImportStatus('📚 Loading complete Turkish A1 curriculum...');
    setTimeout(() => {
      setIsLoading(false);
      setImportStatus('✅ Complete Turkish A1 Curriculum loaded successfully! 📊 Statistics: 1 Course • 12 Units • 36 Lessons • 75 Exercises');
      setSelectedCourse('1');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Curriculum Management</h1>
          <p className="text-gray-600 mt-1">Manage the complete Turkish learning curriculum</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleLoadCurriculum} 
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load Curriculum'}
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            🔄 Sync to Frontend
          </button>
        </div>
      </div>

      {/* Status */}
      {importStatus && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">{importStatus}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex space-x-4 border-b p-4">
          <button 
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'courses' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'text-gray-600 hover:text-gray-900'}`}
          >
            📚 Courses
          </button>
          <button 
            onClick={() => setActiveTab('units')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'units' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'text-gray-600 hover:text-gray-900'}`}
          >
            📖 Units
          </button>
        </div>

        <div className="p-6">
          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Available Courses</h3>
              <div className="space-y-4">
                {sampleCourses.map(course => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-lg">{course.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>📊 Level: {course.level}</span>
                          <span>⏱️ {course.estimatedHours} hours</span>
                          <span>📚 {sampleUnits.filter(u => u.courseId === course.id).length} units</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <button 
                          onClick={() => {
                            setSelectedCourse(course.id);
                            setActiveTab('units');
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          View Units →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Units Tab */}
          {activeTab === 'units' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Course Units</h3>
              <div className="space-y-3">
                {sampleUnits.filter(unit => unit.courseId === selectedCourse).map(unit => (
                  <div key={unit.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Unit {unit.unitNumber}: {unit.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{unit.description}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>⏱️ {unit.estimatedHours} hours</span>
                          <span>📝 3 lessons</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${unit.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {unit.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                          View Lessons →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Flow Information */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <h4 className="font-medium text-blue-900 mb-3">🔄 Data Flow: Admin Panel → Student Interface</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded border">
            <h5 className="font-medium text-gray-900 mb-2">📚 Content Sources</h5>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• Curriculum → Course structure</div>
              <div>• Courses → Course details</div>
              <div>• Lessons → Lesson content</div>
              <div>• Exercises → Activities</div>
            </div>
          </div>
          <div className="bg-white p-3 rounded border">
            <h5 className="font-medium text-gray-900 mb-2">🔄 Sync Process</h5>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• Export curriculum data</div>
              <div>• Transform to API format</div>
              <div>• Update student interface</div>
            </div>
          </div>
          <div className="bg-white p-3 rounded border">
            <h5 className="font-medium text-gray-900 mb-2">🎯 Student Impact</h5>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• Course catalog updates</div>
              <div>• Lesson content refreshes</div>
              <div>• Real-time availability</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
