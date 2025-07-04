'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorDetectionQuestion {
  id: string;
  sentence: string;
  correctSentence: string;
  errors: ErrorInfo[];
  explanation: string;
  difficulty: number;
  grammarRule: string;
}

interface ErrorInfo {
  position: number;
  incorrectWord: string;
  correctWord: string;
  errorType: 'grammar' | 'spelling' | 'word_order' | 'suffix' | 'vocabulary';
  explanation: string;
}

interface ErrorDetectionQuizProps {
  questions: ErrorDetectionQuestion[];
  onComplete: (score: number, timeSpent: number) => void;
  timeLimit?: number;
}

interface SelectedError {
  position: number;
  word: string;
  suggestion?: string;
}

export default function ErrorDetectionQuiz({ 
  questions, 
  onComplete, 
  timeLimit 
}: ErrorDetectionQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedErrors, setSelectedErrors] = useState<SelectedError[]>([]);
  const [showCorrection, setShowCorrection] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStartTime] = useState(new Date());
  const [questionStartTime, setQuestionStartTime] = useState(new Date());
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (timeLimit && timeLeft !== undefined && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      completeQuiz();
    }
  }, [timeLeft, timeLimit]);

  useEffect(() => {
    setQuestionStartTime(new Date());
    setSelectedErrors([]);
    setShowCorrection(false);
    setShowExplanation(false);
    setFeedback(null);
  }, [currentQuestionIndex]);

  const completeQuiz = () => {
    const timeSpent = (new Date().getTime() - gameStartTime.getTime()) / 1000;
    setGameComplete(true);
    onComplete(score, timeSpent);
  };

  const getWords = (sentence: string) => {
    return sentence.split(/(\s+)/).filter(part => part.trim().length > 0);
  };

  const handleWordClick = (wordIndex: number, word: string) => {
    if (showCorrection) return;

    const existingErrorIndex = selectedErrors.findIndex(error => error.position === wordIndex);
    
    if (existingErrorIndex >= 0) {
      // Remove selection
      setSelectedErrors(selectedErrors.filter((_, index) => index !== existingErrorIndex));
    } else {
      // Add selection
      setSelectedErrors([...selectedErrors, { position: wordIndex, word }]);
    }
  };

  const checkAnswers = () => {
    setAttempts(attempts + 1);
    
    const correctErrors = currentQuestion.errors;
    let correctSelections = 0;
    let incorrectSelections = 0;
    
    // Check each selected error
    selectedErrors.forEach(selected => {
      const isCorrectError = correctErrors.some(error => 
        error.position === selected.position
      );
      
      if (isCorrectError) {
        correctSelections++;
      } else {
        incorrectSelections++;
      }
    });
    
    // Check for missed errors
    const missedErrors = correctErrors.filter(error => 
      !selectedErrors.some(selected => selected.position === error.position)
    );
    
    // Calculate score
    const totalErrors = correctErrors.length;
    const accuracy = totalErrors > 0 ? (correctSelections / totalErrors) * 100 : 100;
    const penalty = incorrectSelections * 10; // 10% penalty per incorrect selection
    const questionScore = Math.max(0, Math.round(accuracy - penalty));
    
    setScore(score + questionScore);
    setShowCorrection(true);
    
    // Generate feedback
    if (correctSelections === totalErrors && incorrectSelections === 0) {
      setFeedback('Mükemmel! (Perfect!) You found all errors correctly!');
    } else if (correctSelections > 0) {
      setFeedback(`İyi! (Good!) You found ${correctSelections} out of ${totalErrors} errors.`);
    } else {
      setFeedback('Tekrar dene! (Try again!) Look more carefully for errors.');
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuiz();
    }
  };

  const getErrorTypeColor = (errorType: string) => {
    const colors = {
      grammar: 'bg-red-100 border-red-300 text-red-800',
      spelling: 'bg-blue-100 border-blue-300 text-blue-800',
      word_order: 'bg-purple-100 border-purple-300 text-purple-800',
      suffix: 'bg-green-100 border-green-300 text-green-800',
      vocabulary: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    };
    return colors[errorType as keyof typeof colors] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const getErrorTypeIcon = (errorType: string) => {
    const icons = {
      grammar: '📝',
      spelling: '🔤',
      word_order: '🔄',
      suffix: '➕',
      vocabulary: '📚',
    };
    return icons[errorType as keyof typeof icons] || '❓';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-green-50 rounded-lg border-2 border-green-200"
      >
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-green-800 mb-4">Quiz Complete!</h2>
        <div className="text-lg text-green-700 mb-6">
          <p>Final Score: {score} points</p>
          <p>Questions Answered: {questions.length}</p>
          <p>Total Attempts: {attempts}</p>
          <p>Average Score: {Math.round(score / questions.length)} per question</p>
        </div>
      </motion.div>
    );
  }

  if (!currentQuestion) return <div>Loading...</div>;

  const words = getWords(currentQuestion.sentence);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Detection Quiz</h1>
        <p className="text-lg text-gray-600 mb-4">Find and click on the errors in the sentence</p>
        <div className="flex justify-center space-x-6 text-sm text-gray-500">
          <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
          <span>Score: {score}</span>
          <span>Grammar: {currentQuestion.grammarRule}</span>
          {timeLeft !== undefined && (
            <span className={timeLeft < 30 ? 'text-red-600 font-bold' : ''}>
              ⏰ {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Sentence Display */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Find the errors in this sentence:
        </h3>
        
        <div className="text-xl leading-relaxed text-center mb-6 p-4 bg-gray-50 rounded-lg border">
          {words.map((word, index) => {
            const isSelected = selectedErrors.some(error => error.position === index);
            const correctError = currentQuestion.errors.find(error => error.position === index);
            const isCorrectError = !!correctError;
            
            let className = 'cursor-pointer px-1 py-1 rounded transition-all duration-200 ';
            
            if (showCorrection) {
              if (isCorrectError) {
                className += isSelected 
                  ? 'bg-green-200 text-green-800 border-2 border-green-400' // Correctly identified
                  : 'bg-red-200 text-red-800 border-2 border-red-400'; // Missed error
              } else if (isSelected) {
                className += 'bg-yellow-200 text-yellow-800 border-2 border-yellow-400'; // Incorrectly selected
              } else {
                className += 'hover:bg-gray-100';
              }
            } else {
              className += isSelected 
                ? 'bg-blue-200 text-blue-800 border-2 border-blue-400'
                : 'hover:bg-blue-100';
            }
            
            return (
              <span
                key={index}
                className={className}
                onClick={() => handleWordClick(index, word)}
                title={showCorrection && correctError ? correctError.explanation : ''}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Error Type Legend */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Error Types:</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-red-100 text-red-800">📝 Grammar</span>
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">🔤 Spelling</span>
            <span className="px-2 py-1 rounded bg-purple-100 text-purple-800">🔄 Word Order</span>
            <span className="px-2 py-1 rounded bg-green-100 text-green-800">➕ Suffix</span>
            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">📚 Vocabulary</span>
          </div>
        </div>

        {/* Selected Errors Display */}
        {selectedErrors.length > 0 && !showCorrection && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              Selected Errors ({selectedErrors.length}):
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedErrors.map((error, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-sm"
                >
                  "{error.word}"
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 p-3 rounded-lg border ${
                feedback.includes('Mükemmel') 
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : feedback.includes('İyi')
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {!showCorrection ? (
            <>
              <button
                onClick={checkAnswers}
                disabled={selectedErrors.length === 0}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Check Answers
              </button>
              <button
                onClick={() => setSelectedErrors([])}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Selection
              </button>
            </>
          ) : (
            <button
              onClick={nextQuestion}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Complete Quiz' : 'Next Question'}
            </button>
          )}
        </div>
      </div>

      {/* Correction and Explanation */}
      {showCorrection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 rounded-lg border border-green-200 p-6"
        >
          <h3 className="text-lg font-semibold text-green-800 mb-4">Correct Sentence:</h3>
          <p className="text-xl text-green-700 mb-4 p-3 bg-white rounded border">
            {currentQuestion.correctSentence}
          </p>
          
          <div className="mb-4">
            <h4 className="font-semibold text-green-800 mb-2">Errors Found:</h4>
            <div className="space-y-2">
              {currentQuestion.errors.map((error, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 ${getErrorTypeColor(error.errorType)}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getErrorTypeIcon(error.errorType)}</span>
                    <div className="flex-1">
                      <div className="font-semibold">
                        "{error.incorrectWord}" → "{error.correctWord}"
                      </div>
                      <div className="text-sm opacity-90 mt-1">
                        {error.explanation}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-green-700 hover:text-green-900 transition-colors"
          >
            {showExplanation ? '▼' : '▶'} Grammar Explanation
          </button>
          
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-white rounded border text-green-700"
              >
                {currentQuestion.explanation}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
