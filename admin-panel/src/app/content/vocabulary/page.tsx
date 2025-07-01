'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { PlusIcon, BookOpenIcon, SpeakerWaveIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function VocabularyPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock vocabulary data
  const vocabulary = [
    {
      id: '1',
      turkish: 'Merhaba',
      english: 'Hello',
      pronunciation: 'mer-ha-BA',
      category: 'greetings',
      difficulty: 'beginner',
      audioUrl: '/audio/merhaba.mp3',
      exampleSentence: 'Merhaba, nasılsın?',
      exampleTranslation: 'Hello, how are you?',
      tags: ['greeting', 'basic'],
      usageCount: 156
    },
    {
      id: '2',
      turkish: 'Teşekkür ederim',
      english: 'Thank you',
      pronunciation: 'te-shek-KUER e-de-RIM',
      category: 'politeness',
      difficulty: 'beginner',
      audioUrl: '/audio/tesekkur.mp3',
      exampleSentence: 'Yardımınız için teşekkür ederim.',
      exampleTranslation: 'Thank you for your help.',
      tags: ['politeness', 'gratitude'],
      usageCount: 142
    },
    {
      id: '3',
      turkish: 'Okul',
      english: 'School',
      pronunciation: 'o-KUL',
      category: 'education',
      difficulty: 'beginner',
      audioUrl: '/audio/okul.mp3',
      exampleSentence: 'Okula gidiyorum.',
      exampleTranslation: 'I am going to school.',
      tags: ['education', 'building'],
      usageCount: 89
    },
    {
      id: '4',
      turkish: 'Müzakere',
      english: 'Negotiation',
      pronunciation: 'mue-za-ke-RE',
      category: 'business',
      difficulty: 'advanced',
      audioUrl: '/audio/muzakere.mp3',
      exampleSentence: 'Müzakere süreci uzun sürdü.',
      exampleTranslation: 'The negotiation process took a long time.',
      tags: ['business', 'formal'],
      usageCount: 23
    }
  ];

  const categories = [
    { value: 'greetings', label: 'Greetings' },
    { value: 'politeness', label: 'Politeness' },
    { value: 'education', label: 'Education' },
    { value: 'business', label: 'Business' },
    { value: 'family', label: 'Family' },
    { value: 'food', label: 'Food' },
    { value: 'travel', label: 'Travel' }
  ];

  const filteredVocabulary = vocabulary.filter(word => {
    const matchesSearch = word.turkish.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         word.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const playAudio = (audioUrl: string) => {
    // In a real app, this would play the audio file
      };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vocabulary</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage Turkish vocabulary words and translations
              </p>
            </div>
            <button className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Word
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search vocabulary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vocabulary List */}
        <div className="space-y-4">
          {filteredVocabulary.map((word) => (
            <div key={word.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{word.turkish}</h3>
                      <p className="text-sm text-gray-500">/{word.pronunciation}/</p>
                    </div>
                    <button
                      onClick={() => playAudio(word.audioUrl)}
                      className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                    >
                      <SpeakerWaveIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-lg text-gray-900">{word.english}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Example:</p>
                      <p className="text-sm text-gray-600">{word.exampleSentence}</p>
                      <p className="text-sm text-gray-500 italic">{word.exampleTranslation}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(word.difficulty)}`}>
                          {word.difficulty}
                        </span>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                          {word.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {word.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>Used in {word.usageCount} exercises</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
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

        {filteredVocabulary.length === 0 && (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No vocabulary found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first vocabulary word.'
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
