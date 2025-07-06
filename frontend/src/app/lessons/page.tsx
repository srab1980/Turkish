'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { curriculumApi } from '@/lib/curriculum-api';
import { Lesson, Unit, ExerciseType } from '@/types/lesson.types';

interface LessonCardProps {
  lesson: Lesson;
  unit: Unit;
  onClick: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, unit, onClick }) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-green-100 text-green-800';
      case 'A2': return 'bg-blue-100 text-blue-800';
      case 'B1': return 'bg-yellow-100 text-yellow-800';
      case 'B2': return 'bg-orange-100 text-orange-800';
      case 'C1': return 'bg-red-100 text-red-800';
      case 'C2': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTopicIcon = (exerciseType: ExerciseType) => {
    const icons: Record<ExerciseType, string> = {
      reading: '📖',
      writing: '✍️',
      speaking: '🗣️',
      listening: '👂',
      vocabulary: '📚',
      grammar: '📝',
      culture: '🏛️',
      flashcards: '🃏',
      picture_matching: '🖼️',
      audio_listening: '🎧',
      sentence_builder: '🧩',
      word_scramble: '🔤',
      mini_games: '🎮',
      pronunciation: '🔊',
      error_detection: '🔍',
      grammar_animation: '🎬',
      personalization: '👤',
      dialogue: '💬',
      quiz: '❓',
      fill_in_blanks: '📝',
      matching: '🔗'
    };
    return icons[exerciseType] || '📚';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
      {/* Lesson Image/Header */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(lesson.difficultyLevel)} bg-white`}>
            {lesson.difficultyLevel}
          </div>
        </div>
        <div className="absolute top-4 right-4 text-white text-2xl">
          {getTopicIcon(lesson.exercises[0]?.type || 'vocabulary')}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-blue-600 font-medium">
            📚 {unit.title}
          </span>
          <span className="text-xs text-gray-500">
            ⏱️ {lesson.estimatedMinutes} min
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {lesson.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {lesson.description}
        </p>

        {/* Exercise Topics */}
        <div className="flex flex-wrap gap-1 mb-4">
          {lesson.exercises.slice(0, 4).map((exercise, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
            >
              {getTopicIcon(exercise.type)} {exercise.type}
            </span>
          ))}
          {lesson.exercises.length > 4 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-600">
              +{lesson.exercises.length - 4} more
            </span>
          )}
        </div>

        {/* Progress and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>🎮 {lesson.exercises.length} exercises</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">65%</div>
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LessonsPage: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Most Popular');
  const router = useRouter();

  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        setLoading(true);
        
        // Get all lessons and units from curriculum
        const allLessons = curriculumApi.getAllLessons();
        const allUnits = curriculumApi.getUnits();
        
        console.log('📚 Loaded curriculum:', {
          lessons: allLessons.length,
          units: allUnits.length
        });
        
        setLessons(allLessons);
        setUnits(allUnits);
      } catch (error) {
        console.error('❌ Failed to load curriculum:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurriculum();
  }, []);

  // Filter and search lessons
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = !selectedDifficulty || lesson.difficultyLevel === selectedDifficulty;
    
    const matchesCategory = !selectedCategory || 
                           lesson.exercises.some(exercise => exercise.type === selectedCategory);
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const handleLessonClick = (lesson: Lesson) => {
    router.push(`/lesson/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lesson Library</h1>
              <p className="text-gray-600 mt-1">{filteredLessons.length} lessons available</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              📝 Publish
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search lessons, topics, or phrases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Lessons</label>
            </div>
            
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="A1">Beginner (A1)</option>
              <option value="A2">Elementary (A2)</option>
              <option value="B1">Intermediate (B1)</option>
              <option value="B2">Upper-Intermediate (B2)</option>
              <option value="C1">Advanced (C1)</option>
              <option value="C2">Proficient (C2)</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="vocabulary">📚 Vocabulary</option>
              <option value="grammar">📝 Grammar</option>
              <option value="reading">📖 Reading</option>
              <option value="listening">👂 Listening</option>
              <option value="speaking">🗣️ Speaking</option>
              <option value="writing">✍️ Writing</option>
              <option value="culture">🏛️ Culture</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Most Popular">📈 Sort: Most Popular</option>
              <option value="Newest">🆕 Newest</option>
              <option value="Difficulty">🎯 Difficulty</option>
              <option value="Duration">⏱️ Duration</option>
            </select>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => {
            const unit = units.find(u => u.id === lesson.unitId);
            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                unit={unit || { id: '', title: 'Unknown Unit' } as Unit}
                onClick={() => handleLessonClick(lesson)}
              />
            );
          })}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No lessons found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonsPage;
