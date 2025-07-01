'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { 
  SparklesIcon, 
  PuzzlePieceIcon, 
  CogIcon,
  CheckIcon,
  } from '@heroicons/react/24/outline';

export default function ExerciseGeneratorPage() {
  const [selectedType, setSelectedType] = useState('multiple_choice');
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExercise, setGeneratedExercise] = useState<any>(null);

  const exerciseTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '✅' },
    { value: 'fill_blanks', label: 'Fill in the Blanks', icon: '📝' },
    { value: 'matching', label: 'Matching', icon: '🔗' },
    { value: 'translation', label: 'Translation', icon: '🔄' },
    { value: 'listening', label: 'Listening Comprehension', icon: '🎧' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner (A1-A2)' },
    { value: 'intermediate', label: 'Intermediate (B1-B2)' },
    { value: 'advanced', label: 'Advanced (C1-C2)' }
  ];

  // Mock generated exercise
  const mockExercise = {
    title: 'Turkish Greetings Quiz',
    type: 'multiple_choice',
    difficulty: 'beginner',
    questions: [
      {
        id: 1,
        question: 'How do you say "Hello" in Turkish?',
        options: ['Merhaba', 'Günaydın', 'İyi akşamlar', 'Hoşça kal'],
        correct: 0,
        explanation: 'Merhaba is the most common way to say hello in Turkish.'
      },
      {
        id: 2,
        question: 'What does "Nasılsın?" mean?',
        options: ['Goodbye', 'How are you?', 'Thank you', 'Please'],
        correct: 1,
        explanation: 'Nasılsın? is used to ask "How are you?" in Turkish.'
      }
    ]
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setGeneratedExercise(mockExercise);
      setIsGenerating(false);
    }, 3000);
  };

  const handleSave = () => {
    // In a real app, this would save to the database
    alert('Exercise saved successfully!');
  };

  const handleRegenerate = () => {
    setGeneratedExercise(null);
    handleGenerate();
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AI Exercise Generator</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate interactive exercises automatically using AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <CogIcon className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-900">Configuration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exercise Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {exerciseTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic/Theme
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Greetings, Family, Food..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    min="5"
                    max="50"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic}
                  className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="mr-2 h-4 w-4" />
                      Generate Exercise
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            {!generatedExercise && !isGenerating && (
              <div className="rounded-lg border border-gray-200 bg-white p-12 shadow-sm text-center">
                <PuzzlePieceIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Ready to Generate</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Configure your exercise settings and click "Generate Exercise" to create AI-powered content.
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="rounded-lg border border-gray-200 bg-white p-12 shadow-sm text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Generating Exercise...</h3>
                <p className="mt-2 text-sm text-gray-600">
                  AI is creating your {selectedType.replace('_', ' ')} exercise about {topic}.
                </p>
              </div>
            )}

            {generatedExercise && (
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{generatedExercise.title}</h3>
                      <p className="text-sm text-gray-600">
                        {generatedExercise.type.replace('_', ' ')} • {generatedExercise.difficulty} • {generatedExercise.questions.length} questions
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRegenerate}
                        className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                      >
                        <SparklesIcon className="mr-1 h-4 w-4" />
                        Regenerate
                      </button>
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        <CheckIcon className="mr-1 h-4 w-4" />
                        Save
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    {generatedExercise.questions.map((question: any, index: number) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">
                          {index + 1}. {question.question}
                        </h4>
                        <div className="space-y-2">
                          {question.options.map((option: string, optionIndex: number) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                optionIndex === question.correct 
                                  ? 'border-green-500 bg-green-500' 
                                  : 'border-gray-300'
                              }`}>
                                {optionIndex === question.correct && (
                                  <CheckIcon className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <span className={optionIndex === question.correct ? 'text-green-700 font-medium' : 'text-gray-700'}>
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
