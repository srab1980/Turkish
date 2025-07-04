'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WordDefinition {
  turkish: string;
  english: string;
  pronunciation?: string;
  audioUrl?: string;
  partOfSpeech?: string;
  example?: string;
}

interface ReadingPassage {
  id: string;
  title: string;
  content: string;
  level: string;
  topic: string;
  estimatedTime: number;
  vocabulary: WordDefinition[];
  comprehensionQuestions?: ComprehensionQuestion[];
}

interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface InteractiveReadingProps {
  passage: ReadingPassage;
  onComplete?: (score: number, timeSpent: number) => void;
  showQuestions?: boolean;
}

interface TooltipState {
  word: string;
  definition: WordDefinition | null;
  position: { x: number; y: number };
  visible: boolean;
}

export default function InteractiveReading({ passage, onComplete, showQuestions = true }: InteractiveReadingProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    word: '',
    definition: null,
    position: { x: 0, y: 0 },
    visible: false,
  });
  const [readingStartTime] = useState(new Date());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [readingMode, setReadingMode] = useState<'reading' | 'questions'>('reading');
  const [highlightedWords, setHighlightedWords] = useState<Set<string>>(new Set());
  const [readingProgress, setReadingProgress] = useState(0);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Create vocabulary lookup map
  const vocabularyMap = new Map(
    passage.vocabulary.map(word => [word.turkish.toLowerCase(), word])
  );

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadingProgress(Math.min(progress, 100));
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleWordClick = (event: React.MouseEvent, word: string) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:"()]/g, '');
    const definition = vocabularyMap.get(cleanWord);
    
    if (definition) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setTooltip({
        word: cleanWord,
        definition,
        position: { x: rect.left + rect.width / 2, y: rect.top - 10 },
        visible: true,
      });
      
      // Add to highlighted words
      setHighlightedWords(prev => new Set([...prev, cleanWord]));
      
      // Play audio using text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(definition.turkish);
        utterance.lang = 'tr-TR';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const closeTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const renderInteractiveText = (text: string) => {
    const words = text.split(/(\s+)/);
    
    return words.map((word, index) => {
      if (word.trim() === '') return word;
      
      const cleanWord = word.toLowerCase().replace(/[.,!?;:"()]/g, '');
      const hasDefinition = vocabularyMap.has(cleanWord);
      const isHighlighted = highlightedWords.has(cleanWord);
      
      return (
        <span
          key={index}
          className={`cursor-pointer transition-all duration-200 ${
            hasDefinition 
              ? isHighlighted
                ? 'bg-blue-200 text-blue-800 font-semibold'
                : 'text-blue-600 hover:bg-blue-100 hover:text-blue-800'
              : ''
          }`}
          onClick={(e) => handleWordClick(e, word)}
          title={hasDefinition ? 'Click for definition' : ''}
        >
          {word}
        </span>
      );
    });
  };

  const handleQuestionAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestionIndex < (passage.comprehensionQuestions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score and complete
      const correctAnswers = newAnswers.reduce((count, answer, index) => {
        return count + (answer === passage.comprehensionQuestions?.[index]?.correctAnswer ? 1 : 0);
      }, 0);
      
      const score = Math.round((correctAnswers / (passage.comprehensionQuestions?.length || 1)) * 100);
      const timeSpent = (new Date().getTime() - readingStartTime.getTime()) / 1000;
      
      setShowResults(true);
      if (onComplete) {
        onComplete(score, timeSpent);
      }
    }
  };

  const startQuestions = () => {
    setReadingMode('questions');
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };

  const currentQuestion = passage.comprehensionQuestions?.[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{passage.title}</h1>
            <div className="flex space-x-4 text-sm text-gray-600">
              <span>📚 {passage.level}</span>
              <span>🏷️ {passage.topic}</span>
              <span>⏱️ {passage.estimatedTime} min</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-2">Reading Progress</div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${readingProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip.visible && tooltip.definition && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="fixed z-50 bg-white border-2 border-blue-300 rounded-lg shadow-lg p-4 max-w-xs"
            style={{
              left: tooltip.position.x - 150,
              top: tooltip.position.y - 120,
            }}
          >
            <button
              onClick={closeTooltip}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            
            <div className="text-center">
              <div className="text-lg font-bold text-blue-800 mb-2">
                {tooltip.definition.turkish}
              </div>
              <div className="text-md text-gray-700 mb-2">
                {tooltip.definition.english}
              </div>
              {tooltip.definition.pronunciation && (
                <div className="text-sm text-gray-500 mb-2">
                  [{tooltip.definition.pronunciation}]
                </div>
              )}
              {tooltip.definition.partOfSpeech && (
                <div className="text-xs text-blue-600 mb-2 italic">
                  {tooltip.definition.partOfSpeech}
                </div>
              )}
              {tooltip.definition.example && (
                <div className="text-sm text-gray-600 italic border-t pt-2">
                  "{tooltip.definition.example}"
                </div>
              )}
              <button
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(tooltip.definition!.turkish);
                    utterance.lang = 'tr-TR';
                    utterance.rate = 0.8;
                    speechSynthesis.speak(utterance);
                  }
                }}
                className="mt-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-700 transition-colors"
              >
                🔊 Listen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Mode */}
      {readingMode === 'reading' && (
        <div className="space-y-6">
          {/* Reading Content */}
          <div 
            ref={contentRef}
            className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-h-96 overflow-y-auto"
            onClick={closeTooltip}
          >
            <div className="text-lg leading-relaxed text-gray-800 select-none">
              {renderInteractiveText(passage.content)}
            </div>
          </div>

          {/* Vocabulary Summary */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              Key Vocabulary ({highlightedWords.size}/{passage.vocabulary.length} explored)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {passage.vocabulary.map((word) => (
                <div
                  key={word.turkish}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    highlightedWords.has(word.turkish.toLowerCase())
                      ? 'bg-blue-200 border-blue-400'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={(e) => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setTooltip({
                      word: word.turkish.toLowerCase(),
                      definition: word,
                      position: { x: rect.left + rect.width / 2, y: rect.top - 10 },
                      visible: true,
                    });
                  }}
                >
                  <div className="font-semibold text-sm">{word.turkish}</div>
                  <div className="text-xs text-gray-600">{word.english}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {showQuestions && passage.comprehensionQuestions && (
              <button
                onClick={startQuestions}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Comprehension Questions
              </button>
            )}
            <button
              onClick={() => {
                const timeSpent = (new Date().getTime() - readingStartTime.getTime()) / 1000;
                if (onComplete) onComplete(100, timeSpent);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Complete Reading
            </button>
          </div>
        </div>
      )}

      {/* Questions Mode */}
      {readingMode === 'questions' && currentQuestion && !showResults && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-lg shadow-md border border-gray-200"
        >
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Question {currentQuestionIndex + 1} of {passage.comprehensionQuestions?.length}
              </h3>
              <div className="text-sm text-gray-600">
                {Math.round(((currentQuestionIndex + 1) / (passage.comprehensionQuestions?.length || 1)) * 100)}% Complete
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / (passage.comprehensionQuestions?.length || 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-lg text-gray-800 mb-6">{currentQuestion.question}</p>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionAnswer(index)}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <span className="font-semibold text-blue-600 mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-green-50 rounded-lg border-2 border-green-200"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">Reading Complete!</h2>
          <div className="text-lg text-green-700 mb-6">
            <p>Vocabulary Explored: {highlightedWords.size}/{passage.vocabulary.length}</p>
            {passage.comprehensionQuestions && (
              <p>Questions Correct: {answers.reduce((count, answer, index) => 
                count + (answer === passage.comprehensionQuestions?.[index]?.correctAnswer ? 1 : 0), 0
              )}/{passage.comprehensionQuestions.length}</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
