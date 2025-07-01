'use client';

import { useState } from 'react';

const sampleVocabulary = [
  // Unit 1 - MERHABA
  { id: '1', lessonId: '1', lessonTitle: 'Basic Greetings', turkish: 'Merhaba', english: 'Hello', pronunciation: 'mer-ha-ba', example: 'Merhaba, nasılsın?', category: 'greetings', difficulty: 'A1' },
  { id: '2', lessonId: '1', lessonTitle: 'Basic Greetings', turkish: 'Günaydın', english: 'Good morning', pronunciation: 'gün-ay-dın', example: 'Günaydın öğretmenim!', category: 'greetings', difficulty: 'A1' },
  { id: '3', lessonId: '1', lessonTitle: 'Basic Greetings', turkish: 'İyi akşamlar', english: 'Good evening', pronunciation: 'i-yi ak-şam-lar', example: 'İyi akşamlar, aile!', category: 'greetings', difficulty: 'A1' },
  { id: '4', lessonId: '1', lessonTitle: 'Basic Greetings', turkish: 'İyi geceler', english: 'Good night', pronunciation: 'i-yi ge-ce-ler', example: 'İyi geceler, tatlı rüyalar!', category: 'greetings', difficulty: 'A1' },
  
  { id: '5', lessonId: '2', lessonTitle: 'Introducing Yourself', turkish: 'Ben', english: 'I am', pronunciation: 'ben', example: 'Ben Ahmet.', category: 'pronouns', difficulty: 'A1' },
  { id: '6', lessonId: '2', lessonTitle: 'Introducing Yourself', turkish: 'Adım', english: 'My name is', pronunciation: 'a-dım', example: 'Adım Sarah.', category: 'introduction', difficulty: 'A1' },
  { id: '7', lessonId: '2', lessonTitle: 'Introducing Yourself', turkish: 'Yaşındayım', english: 'I am ... years old', pronunciation: 'ya-şın-da-yım', example: 'Ben 25 yaşındayım.', category: 'age', difficulty: 'A1' },
  
  { id: '8', lessonId: '3', lessonTitle: 'Polite Expressions', turkish: 'Lütfen', english: 'Please', pronunciation: 'lüt-fen', example: 'Lütfen oturun.', category: 'politeness', difficulty: 'A1' },
  { id: '9', lessonId: '3', lessonTitle: 'Polite Expressions', turkish: 'Teşekkürler', english: 'Thank you', pronunciation: 'te-şek-kür-ler', example: 'Teşekkürler, çok naziksiniz.', category: 'politeness', difficulty: 'A1' },
  { id: '10', lessonId: '3', lessonTitle: 'Polite Expressions', turkish: 'Özür dilerim', english: 'I am sorry', pronunciation: 'ö-zür di-le-rim', example: 'Özür dilerim, geç kaldım.', category: 'politeness', difficulty: 'A1' },
  
  // Unit 2 - TANIŞMA
  { id: '11', lessonId: '4', lessonTitle: 'Personal Information', turkish: 'İsim', english: 'Name', pronunciation: 'i-sim', example: 'Benim ismim Ali.', category: 'personal', difficulty: 'A1' },
  { id: '12', lessonId: '4', lessonTitle: 'Personal Information', turkish: 'Yaş', english: 'Age', pronunciation: 'yaş', example: 'Kaç yaşındasın?', category: 'personal', difficulty: 'A1' },
  { id: '13', lessonId: '4', lessonTitle: 'Personal Information', turkish: 'Meslek', english: 'Job/Profession', pronunciation: 'mes-lek', example: 'Benim mesleğim öğretmen.', category: 'personal', difficulty: 'A1' },
  
  { id: '14', lessonId: '5', lessonTitle: 'Countries and Nationalities', turkish: 'Türkiye', english: 'Turkey', pronunciation: 'tür-ki-ye', example: 'Ben Türkiye\'den geliyorum.', category: 'countries', difficulty: 'A1' },
  { id: '15', lessonId: '5', lessonTitle: 'Countries and Nationalities', turkish: 'Amerika', english: 'America', pronunciation: 'a-me-ri-ka', example: 'O Amerika\'da yaşıyor.', category: 'countries', difficulty: 'A1' },
  { id: '16', lessonId: '5', lessonTitle: 'Countries and Nationalities', turkish: 'Türk', english: 'Turkish (nationality)', pronunciation: 'türk', example: 'Ben Türk\'üm.', category: 'nationalities', difficulty: 'A1' },
];

export default function VocabularyPage() {
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVocabulary = sampleVocabulary.filter(word => {
    if (selectedLesson && word.lessonId !== selectedLesson) return false;
    if (selectedCategory && word.category !== selectedCategory) return false;
    if (searchTerm && !word.turkish.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !word.english.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Create unique lessons array properly
  const lessonsMap = new Map();
  sampleVocabulary.forEach(w => {
    if (!lessonsMap.has(w.lessonId)) {
      lessonsMap.set(w.lessonId, { id: w.lessonId, title: w.lessonTitle });
    }
  });
  const lessons = Array.from(lessonsMap.values());

  const categories = [...new Set(sampleVocabulary.map(w => w.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vocabulary Management</h1>
          <p className="text-gray-600 mt-1">Manage vocabulary lists, definitions, and pronunciation guides</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Add New Word
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Words</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Turkish or English..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Lesson</label>
            <select 
              value={selectedLesson} 
              onChange={(e) => setSelectedLesson(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All Lessons</option>
              {lessons.map(lesson => (
                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedLesson('');
                setSelectedCategory('');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Vocabulary List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Vocabulary Words ({filteredVocabulary.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Turkish</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">English</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Pronunciation</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Example</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVocabulary.map(word => (
                  <tr key={word.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{word.turkish}</div>
                      <div className="text-xs text-gray-500">{word.lessonTitle}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{word.english}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-sm">{word.pronunciation}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{word.example}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        word.category === 'greetings' ? 'bg-blue-100 text-blue-700' :
                        word.category === 'politeness' ? 'bg-green-100 text-green-700' :
                        word.category === 'personal' ? 'bg-purple-100 text-purple-700' :
                        word.category === 'countries' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {word.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                          🔊 Play
                        </button>
                        <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vocabulary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Total Words</h3>
          <p className="text-2xl font-bold text-gray-900">500+</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Categories</h3>
          <p className="text-2xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">With Audio</h3>
          <p className="text-2xl font-bold text-green-600">450</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">A1 Level</h3>
          <p className="text-2xl font-bold text-purple-600">500</p>
        </div>
      </div>
    </div>
  );
}
