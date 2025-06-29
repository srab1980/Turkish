'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { PlusIcon, AcademicCapIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function GrammarPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Mock grammar rules data
  const grammarRules = [
    {
      id: '1',
      title: 'Present Tense (-iyor)',
      description: 'Formation and usage of present continuous tense in Turkish',
      level: 'beginner',
      category: 'tenses',
      rule: 'Verb stem + -iyor + personal ending',
      examples: [
        { turkish: 'Ben okuyorum', english: 'I am reading' },
        { turkish: 'Sen yazıyorsun', english: 'You are writing' },
        { turkish: 'O geliyor', english: 'He/She is coming' }
      ],
      exceptions: ['Irregular verbs: gitmek → gidiyor'],
      exercises: 12,
      difficulty: 'beginner',
      isPublished: true
    },
    {
      id: '2',
      title: 'Possessive Suffixes',
      description: 'How to express possession using Turkish suffixes',
      level: 'beginner',
      category: 'suffixes',
      rule: 'Noun + possessive suffix + personal ending',
      examples: [
        { turkish: 'Benim evim', english: 'My house' },
        { turkish: 'Senin araban', english: 'Your car' },
        { turkish: 'Onun kitabı', english: 'His/Her book' }
      ],
      exceptions: ['Vowel harmony rules apply'],
      exercises: 8,
      difficulty: 'beginner',
      isPublished: true
    },
    {
      id: '3',
      title: 'Conditional Mood (-se)',
      description: 'Expressing hypothetical situations and conditions',
      level: 'intermediate',
      category: 'moods',
      rule: 'Verb stem + -se + personal ending',
      examples: [
        { turkish: 'Gelseydin, seni görürdüm', english: 'If you had come, I would have seen you' },
        { turkish: 'Çalışsam, başarırım', english: 'If I study, I will succeed' }
      ],
      exceptions: ['Different forms for past and present conditions'],
      exercises: 15,
      difficulty: 'intermediate',
      isPublished: true
    },
    {
      id: '4',
      title: 'Evidentiality (-miş)',
      description: 'Expressing hearsay, inference, and non-witnessed events',
      level: 'advanced',
      category: 'evidentiality',
      rule: 'Verb stem + -miş + personal ending',
      examples: [
        { turkish: 'Gelmiş', english: 'He/She came (I heard/inferred)' },
        { turkish: 'Çok güzelmiş', english: 'It was very beautiful (apparently)' }
      ],
      exceptions: ['Subtle meaning differences based on context'],
      exercises: 10,
      difficulty: 'advanced',
      isPublished: false
    }
  ];

  const categories = [
    { value: 'tenses', label: 'Tenses' },
    { value: 'suffixes', label: 'Suffixes' },
    { value: 'moods', label: 'Moods' },
    { value: 'evidentiality', label: 'Evidentiality' },
    { value: 'cases', label: 'Cases' },
    { value: 'particles', label: 'Particles' }
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const filteredRules = grammarRules.filter(rule => {
    const matchesSearch = rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || rule.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

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
              <h1 className="text-2xl font-bold text-gray-900">Grammar Rules</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage Turkish grammar rules, explanations, and examples
              </p>
            </div>
            <button className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Grammar Rule
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search grammar rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              {levels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grammar Rules List */}
        <div className="space-y-6">
          {filteredRules.map((rule) => (
            <div key={rule.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{rule.title}</h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(rule.difficulty)}`}>
                      {rule.difficulty}
                    </span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                      {rule.category}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      rule.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rule.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{rule.description}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Rule:</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg font-mono">{rule.rule}</p>
                      
                      {rule.exceptions.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-900 mb-2">Exceptions:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {rule.exceptions.map((exception, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-yellow-500 mr-2">⚠️</span>
                                {exception}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                      <div className="space-y-2">
                        {rule.examples.map((example, index) => (
                          <div key={index} className="bg-blue-50 p-3 rounded-lg">
                            <p className="font-medium text-blue-900">{example.turkish}</p>
                            <p className="text-sm text-blue-700">{example.english}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>{rule.exercises} related exercises</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button className="rounded p-2 text-gray-400 hover:text-blue-600">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="rounded p-2 text-gray-400 hover:text-gray-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="rounded p-2 text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRules.length === 0 && (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No grammar rules found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedLevel !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first grammar rule.'
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
