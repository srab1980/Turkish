'use client';

import { useState } from 'react';

const sampleGrammarRules = [
  {
    id: '1',
    lessonId: '2',
    lessonTitle: 'Introducing Yourself',
    title: 'Personal Pronouns',
    description: 'Learn Turkish personal pronouns and their usage',
    level: 'A1',
    category: 'pronouns',
    examples: [
      'Ben - I (Ben öğrenciyim - I am a student)',
      'Sen - You (Sen öğretmensin - You are a teacher)',
      'O - He/She/It (O doktor - He/She is a doctor)'
    ],
    rules: [
      'Turkish personal pronouns are: ben (I), sen (you), o (he/she/it)',
      'Personal pronouns can often be omitted in Turkish',
      'The verb ending indicates the person'
    ],
    isPublished: true
  },
  {
    id: '2',
    lessonId: '3',
    lessonTitle: 'Polite Expressions',
    title: 'Polite Forms and Courtesy',
    description: 'Using polite expressions and formal language in Turkish',
    level: 'A1',
    category: 'politeness',
    examples: [
      'Lütfen - Please (Lütfen oturun - Please sit down)',
      'Teşekkürler - Thank you (Teşekkürler, çok naziksiniz - Thank you, you are very kind)',
      'Özür dilerim - I am sorry (Özür dilerim, geç kaldım - I am sorry, I am late)'
    ],
    rules: [
      'Always use "lütfen" when making requests',
      '"Teşekkürler" is the standard way to say thank you',
      '"Özür dilerim" is used for apologies'
    ],
    isPublished: true
  },
  {
    id: '3',
    lessonId: '6',
    lessonTitle: 'Asking Questions',
    title: 'Question Formation',
    description: 'How to form questions in Turkish using question words',
    level: 'A1',
    category: 'questions',
    examples: [
      'Ne? - What? (Bu ne? - What is this?)',
      'Kim? - Who? (O kim? - Who is that?)',
      'Nerede? - Where? (Sen neredesin? - Where are you?)',
      'Kaç? - How many? (Kaç yaşındasın? - How old are you?)'
    ],
    rules: [
      'Question words usually come at the beginning of the sentence',
      'Yes/no questions are formed with rising intonation',
      'Question particle "mi/mı/mu/mü" is used for yes/no questions'
    ],
    isPublished: true
  },
  {
    id: '4',
    lessonId: '9',
    lessonTitle: 'Possessive Pronouns',
    title: 'Possessive Forms',
    description: 'Learn possessive pronouns and possessive suffixes',
    level: 'A1',
    category: 'possession',
    examples: [
      'Benim - My (Benim adım Ali - My name is Ali)',
      'Senin - Your (Senin kitabın - Your book)',
      'Onun - His/Her/Its (Onun arabası - His/Her car)'
    ],
    rules: [
      'Possessive pronouns: benim (my), senin (your), onun (his/her/its)',
      'Possessive suffixes are added to nouns: -im/-ım/-um/-üm',
      'The possessive pronoun can be omitted when the context is clear'
    ],
    isPublished: true
  },
  {
    id: '5',
    lessonId: '11',
    lessonTitle: 'Present Tense',
    title: 'Present Continuous Tense (-yor)',
    description: 'Formation and usage of present continuous tense in Turkish',
    level: 'A1',
    category: 'tenses',
    examples: [
      'Ben çalışıyorum - I am working',
      'Sen okuyorsun - You are reading',
      'O yürüyor - He/She is walking',
      'Biz yemek yiyoruz - We are eating'
    ],
    rules: [
      'Present continuous is formed with -yor + personal endings',
      'Used for actions happening now or ongoing actions',
      'Vowel harmony applies: -yor/-yor/-yor/-yor'
    ],
    isPublished: true
  }
];

export default function GrammarPage() {
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGrammar = sampleGrammarRules.filter(rule => {
    if (selectedLesson && rule.lessonId !== selectedLesson) return false;
    if (selectedCategory && rule.category !== selectedCategory) return false;
    if (searchTerm && !rule.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !rule.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Create unique lessons array properly
  const lessonsMap = new Map();
  sampleGrammarRules.forEach(r => {
    if (!lessonsMap.has(r.lessonId)) {
      lessonsMap.set(r.lessonId, { id: r.lessonId, title: r.lessonTitle });
    }
  });
  const lessons = Array.from(lessonsMap.values());

  const categories = [...new Set(sampleGrammarRules.map(r => r.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grammar Management</h1>
          <p className="text-gray-600 mt-1">Create and manage grammar rules, examples, and explanations</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Add New Grammar Rule
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Grammar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rules or descriptions..."
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

      {/* Grammar Rules List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Grammar Rules ({filteredGrammar.length})</h3>
          <div className="space-y-6">
            {filteredGrammar.map(rule => (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{rule.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        rule.category === 'pronouns' ? 'bg-blue-100 text-blue-700' :
                        rule.category === 'politeness' ? 'bg-green-100 text-green-700' :
                        rule.category === 'questions' ? 'bg-purple-100 text-purple-700' :
                        rule.category === 'possession' ? 'bg-orange-100 text-orange-700' :
                        rule.category === 'tenses' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {rule.category}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {rule.level}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{rule.description}</p>
                    <div className="text-xs text-gray-500">Lesson: {rule.lessonTitle}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs ${rule.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {rule.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                      Edit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">📝 Grammar Rules</h5>
                    <ul className="space-y-1">
                      {rule.rules.map((ruleText, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {ruleText}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">💡 Examples</h5>
                    <ul className="space-y-1">
                      {rule.examples.map((example, index) => (
                        <li key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grammar Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Total Rules</h3>
          <p className="text-2xl font-bold text-gray-900">50+</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">Categories</h3>
          <p className="text-2xl font-bold text-blue-600">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">A1 Level</h3>
          <p className="text-2xl font-bold text-green-600">25</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-600">With Examples</h3>
          <p className="text-2xl font-bold text-purple-600">50</p>
        </div>
      </div>
    </div>
  );
}
