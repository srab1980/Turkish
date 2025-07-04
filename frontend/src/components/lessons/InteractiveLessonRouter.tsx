'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressUpdater } from '@/contexts/UserProgressContext';

// Import all the interactive components
import FlashcardSystem from '../flashcards/FlashcardSystem';
import PictureMatchingGame from '../games/PictureMatchingGame';
import WordScrambleGame from '../games/WordScrambleGame';
import AnimatedGrammarLesson from '../grammar/AnimatedGrammarLesson';
import SentenceBuilder from '../grammar/SentenceBuilder';
import AudioSystem from '../audio/AudioSystem';
import SpeechRecognition from '../speech/SpeechRecognition';
import GamificationSystem from '../gamification/GamificationSystem';
import InteractiveReading from '../reading/InteractiveReading';
import YaSizPersonalization from '../personalization/YaSizPersonalization';
import EglenelimOgrenelimGames from '../games/EglenelimOgrenelimGames';
import ErrorDetectionQuiz from '../exercises/ErrorDetectionQuiz';

interface Lesson {
  id: string;
  title: string;
  type: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'culture';
  content: any;
  exercises: Exercise[];
  difficulty: number;
  estimatedTime: number;
}

interface Exercise {
  id: string;
  type: 'flashcards' | 'picture_matching' | 'word_scramble' | 'grammar_animation' | 
        'sentence_builder' | 'audio_listening' | 'pronunciation' | 'reading' | 
        'personalization' | 'mini_games' | 'error_detection';
  data: any;
  points: number;
}

interface InteractiveLessonRouterProps {
  lesson: Lesson;
  userProgress: any;
  onLessonComplete: (lessonId: string, score: number, timeSpent: number) => void;
  onExerciseComplete: (exerciseId: string, score: number, timeSpent: number) => void;
}

export default function InteractiveLessonRouter({ 
  lesson, 
  userProgress, 
  onLessonComplete, 
  onExerciseComplete 
}: InteractiveLessonRouterProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseResults, setExerciseResults] = useState<any[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [lessonStartTime] = useState(new Date());
  const [showGamification, setShowGamification] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);

  // Progress updater for tracking user progress
  const progressUpdater = useProgressUpdater();

  const currentExercise = lesson.exercises[currentExerciseIndex];

  const handleExerciseComplete = (score: number, timeSpent: number) => {
    const result = {
      exerciseId: currentExercise.id,
      score,
      timeSpent,
      timestamp: new Date(),
    };

    const newResults = [...exerciseResults, result];
    setExerciseResults(newResults);
    setTotalScore(totalScore + score);

    // Update user progress based on exercise type
    const exerciseType = currentExercise.type;
    switch (exerciseType) {
      case 'flashcards':
        progressUpdater.completeFlashcards(currentExercise.data?.vocabularyItems?.length || 5);
        break;
      case 'picture_matching':
      case 'word_scramble':
      case 'sentence_builder':
      case 'error_detection':
        progressUpdater.completeExercise(exerciseType, score > 80 ? 'hard' : score > 60 ? 'medium' : 'easy');
        break;
      case 'mini_games':
        progressUpdater.completeGame(exerciseType, score);
        break;
      default:
        progressUpdater.addXP(Math.floor(score / 10)); // Default XP based on score
    }

    // Call the exercise completion callback
    onExerciseComplete(currentExercise.id, score, timeSpent);

    // Move to next exercise or complete lesson
    if (currentExerciseIndex < lesson.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      completeLessonWithDelay();
    }
  };

  const completeLessonWithDelay = () => {
    // Show gamification for 3 seconds before completing
    setShowGamification(true);
    setTimeout(() => {
      const totalTimeSpent = (new Date().getTime() - lessonStartTime.getTime()) / 1000;

      // Complete the lesson in user progress
      const lessonXP = Math.max(50, Math.floor(totalScore / 2)); // Minimum 50 XP, bonus for high scores
      progressUpdater.completeLesson(lesson.id, lessonXP, Math.floor(totalTimeSpent / 60)); // Convert to minutes

      setLessonComplete(true);
      onLessonComplete(lesson.id, totalScore, totalTimeSpent);
    }, 3000);
  };

  const renderExercise = () => {
    if (!currentExercise) return null;

    const exerciseProps = {
      onComplete: handleExerciseComplete,
      ...currentExercise.data,
    };

    switch (currentExercise.type) {
      case 'flashcards':
        return (
          <FlashcardSystem
            vocabularyItems={currentExercise.data.vocabularyItems}
            unitId={lesson.id}
            onComplete={(results) => {
              const score = results.reduce((sum, result) => {
                return sum + (result.difficulty === 'easy' ? 10 : result.difficulty === 'medium' ? 7 : 5);
              }, 0);
              handleExerciseComplete(score, results.reduce((sum, r) => sum + r.timeSpent, 0));
            }}
          />
        );

      case 'picture_matching':
        return (
          <PictureMatchingGame
            items={currentExercise.data.items}
            gameTitle={currentExercise.data.title}
            onComplete={handleExerciseComplete}
            lessonId={lesson.id}
          />
        );

      case 'word_scramble':
        return (
          <WordScrambleGame
            words={currentExercise.data.words}
            gameTitle={currentExercise.data.title}
            onComplete={handleExerciseComplete}
          />
        );

      case 'grammar_animation':
        return (
          <AnimatedGrammarLesson
            rule={currentExercise.data.rule}
            onComplete={() => handleExerciseComplete(100, 0)}
            onNext={() => handleExerciseComplete(100, 0)}
          />
        );

      case 'sentence_builder':
        return (
          <SentenceBuilder
            exercises={currentExercise.data.exercises}
            onComplete={handleExerciseComplete}
          />
        );

      case 'audio_listening':
        return (
          <AudioSystem
            tracks={currentExercise.data.tracks}
            showTranscript={true}
            onTrackEnd={() => handleExerciseComplete(50, 0)}
          />
        );

      case 'pronunciation':
        return (
          <SpeechRecognition
            exercises={currentExercise.data.exercises}
            onComplete={handleExerciseComplete}
          />
        );

      case 'reading':
        return (
          <InteractiveReading
            passage={currentExercise.data.passage}
            onComplete={handleExerciseComplete}
            showQuestions={true}
          />
        );

      case 'personalization':
        return (
          <YaSizPersonalization
            questions={currentExercise.data.questions}
            onComplete={(responses) => {
              handleExerciseComplete(responses.length * 10, 0);
            }}
            allowAudio={true}
            maxQuestions={currentExercise.data.maxQuestions || 3}
          />
        );

      case 'mini_games':
        return (
          <EglenelimOgrenelimGames
            games={currentExercise.data.games}
            onComplete={handleExerciseComplete}
          />
        );

      case 'error_detection':
        return (
          <ErrorDetectionQuiz
            questions={currentExercise.data.questions}
            onComplete={handleExerciseComplete}
            timeLimit={currentExercise.data.timeLimit}
          />
        );

      default:
        return (
          <div className="text-center p-8 text-gray-500">
            Exercise type "{currentExercise.type}" not implemented yet.
          </div>
        );
    }
  };

  const getLessonTypeIcon = (type: string) => {
    const icons = {
      vocabulary: '📚',
      grammar: '📝',
      reading: '📖',
      listening: '🎧',
      speaking: '🗣️',
      culture: '🏛️',
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  const getExerciseTypeIcon = (type: string) => {
    const icons = {
      flashcards: '🃏',
      picture_matching: '🖼️',
      word_scramble: '🔤',
      grammar_animation: '🎬',
      sentence_builder: '🧩',
      audio_listening: '🎧',
      pronunciation: '🎤',
      reading: '📖',
      personalization: '👤',
      mini_games: '🎮',
      error_detection: '🔍',
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  if (lessonComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-green-50 rounded-lg border-2 border-green-200"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-green-800 mb-4">Lesson Complete!</h2>
        <div className="text-lg text-green-700 mb-6">
          <p className="mb-2">🏆 Total Score: {totalScore} points</p>
          <p className="mb-2">📚 Lesson: {lesson.title}</p>
          <p className="mb-2">⭐ Exercises Completed: {lesson.exercises.length}</p>
          <p className="mb-2">⏱️ Time Spent: {Math.round((new Date().getTime() - lessonStartTime.getTime()) / 60000)} minutes</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {exerciseResults.map((result, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
              <div className="text-2xl mb-2">{getExerciseTypeIcon(lesson.exercises[index].type)}</div>
              <div className="font-semibold text-green-800">Exercise {index + 1}</div>
              <div className="text-green-600">{result.score} points</div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Lesson Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center items-center space-x-4 mb-4">
          <span className="text-4xl">{getLessonTypeIcon(lesson.type)}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{lesson.title}</h1>
            <p className="text-lg text-gray-600 capitalize">{lesson.type} Lesson</p>
          </div>
        </div>
        
        <div className="flex justify-center space-x-6 text-sm text-gray-500">
          <span>Exercise {currentExerciseIndex + 1} of {lesson.exercises.length}</span>
          <span>Difficulty: {'⭐'.repeat(lesson.difficulty)}</span>
          <span>Est. Time: {lesson.estimatedTime} min</span>
          <span>Score: {totalScore}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Lesson Progress</span>
          <span>{Math.round(((currentExerciseIndex + 1) / lesson.exercises.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentExerciseIndex + 1) / lesson.exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Exercise Navigation */}
      <div className="mb-6">
        <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
          {lesson.exercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                index === currentExerciseIndex
                  ? 'border-blue-500 bg-blue-50'
                  : index < currentExerciseIndex
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <span className="text-lg">{getExerciseTypeIcon(exercise.type)}</span>
              <span className="text-sm font-medium whitespace-nowrap">
                {index < currentExerciseIndex ? '✓' : index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Exercise */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <span>{getExerciseTypeIcon(currentExercise?.type || '')}</span>
              <span>Exercise {currentExerciseIndex + 1}: {currentExercise?.type.replace('_', ' ').toUpperCase()}</span>
            </h2>
            <div className="text-sm text-gray-500">
              {currentExercise?.points} points available
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExerciseIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderExercise()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Gamification Popup */}
      <AnimatePresence>
        {showGamification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg p-8 max-w-md mx-4">
              <div className="text-center">
                <div className="text-6xl mb-4">🎊</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Amazing Work!</h3>
                <p className="text-lg text-gray-600 mb-4">
                  You've earned {totalScore} points in this lesson!
                </p>
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                  <div className="text-yellow-800 font-semibold">
                    🏆 Lesson Achievement Unlocked!
                  </div>
                  <div className="text-yellow-700 text-sm">
                    Keep up the great work learning Turkish!
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
