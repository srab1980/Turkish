'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GrammarRule {
  id: string;
  title: string;
  description: string;
  examples: GrammarExample[];
  animation: AnimationType;
  difficulty: number;
}

interface GrammarExample {
  base: string;
  suffix: string;
  result: string;
  translation: string;
  explanation: string;
}

type AnimationType = 'vowel_harmony' | 'plural_suffix' | 'possessive_suffix' | 'case_suffix';

interface AnimatedGrammarLessonProps {
  rule: GrammarRule;
  onComplete: () => void;
  onNext?: () => void;
}

export default function AnimatedGrammarLesson({ rule, onComplete, onNext }: AnimatedGrammarLessonProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'intro' | 'demonstration' | 'practice' | 'complete'>('intro');

  const example = rule.examples[currentExample];

  useEffect(() => {
    // Auto-advance through animation phases
    const timer = setTimeout(() => {
      if (animationPhase === 'intro') {
        setAnimationPhase('demonstration');
      } else if (animationPhase === 'demonstration' && currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [animationPhase, currentStep]);

  const renderVowelHarmonyAnimation = () => {
    return (
      <div className="flex items-center justify-center space-x-4 p-8">
        {/* Base Word */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded-lg"
        >
          {example.base}
        </motion.div>

        {/* Plus Sign */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold text-gray-600"
        >
          +
        </motion.div>

        {/* Suffix with Harmony */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="relative"
        >
          <div className="text-3xl font-bold text-green-600 bg-green-100 px-4 py-2 rounded-lg">
            {example.suffix}
          </div>
          
          {/* Vowel Harmony Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-green-700 bg-green-50 px-2 py-1 rounded"
          >
            Vowel Harmony!
          </motion.div>
        </motion.div>

        {/* Equals Sign */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2 }}
          className="text-2xl font-bold text-gray-600"
        >
          =
        </motion.div>

        {/* Result */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.5, type: "spring", stiffness: 200 }}
          className="text-3xl font-bold text-purple-600 bg-purple-100 px-4 py-2 rounded-lg border-2 border-purple-300"
        >
          {example.result}
        </motion.div>
      </div>
    );
  };

  const renderPluralSuffixAnimation = () => {
    const letters = example.suffix.split('');
    
    return (
      <div className="flex flex-col items-center space-y-6 p-8">
        {/* Word */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-blue-600"
        >
          {example.base}
        </motion.div>

        {/* Suffix Animation */}
        <div className="flex items-center space-x-2">
          {letters.map((letter, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotate: 180 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 1 + index * 0.3, type: "spring" }}
              className="text-3xl font-bold text-green-600 bg-green-100 w-12 h-12 flex items-center justify-center rounded-full"
            >
              {letter}
            </motion.div>
          ))}
        </div>

        {/* Snap Together Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3, type: "spring", stiffness: 300 }}
          className="text-4xl font-bold text-purple-600 bg-purple-100 px-6 py-3 rounded-lg border-4 border-purple-300"
        >
          {example.result}
        </motion.div>

        {/* Sound Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2 }}
          className="text-2xl"
        >
          ✨ *snap* ✨
        </motion.div>
      </div>
    );
  };

  const renderPossessiveSuffixAnimation = () => {
    return (
      <div className="flex flex-col items-center space-y-8 p-8">
        {/* Person Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-4"
        >
          <div className="text-6xl">👤</div>
          <div className="text-2xl font-bold text-blue-600">
            {example.base.includes('benim') ? 'Benim' : 
             example.base.includes('senin') ? 'Senin' : 
             example.base.includes('onun') ? 'Onun' : 'My/Your/His'}
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl"
        >
          ⬇️
        </motion.div>

        {/* Word Transformation */}
        <div className="flex items-center space-x-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="text-3xl font-bold text-gray-600"
          >
            {example.base.split(' ').pop()}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
            className="text-2xl"
          >
            +
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2 }}
            className="text-3xl font-bold text-green-600 bg-green-100 px-3 py-1 rounded"
          >
            {example.suffix}
          </motion.div>
        </div>

        {/* Result */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, type: "spring" }}
          className="text-4xl font-bold text-purple-600 bg-purple-100 px-6 py-3 rounded-lg border-2 border-purple-300"
        >
          {example.result}
        </motion.div>

        {/* Translation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="text-lg text-gray-600 italic"
        >
          "{example.translation}"
        </motion.div>
      </div>
    );
  };

  const renderAnimation = () => {
    switch (rule.animation) {
      case 'vowel_harmony':
        return renderVowelHarmonyAnimation();
      case 'plural_suffix':
        return renderPluralSuffixAnimation();
      case 'possessive_suffix':
        return renderPossessiveSuffixAnimation();
      default:
        return renderVowelHarmonyAnimation();
    }
  };

  const nextExample = () => {
    if (currentExample < rule.examples.length - 1) {
      setCurrentExample(currentExample + 1);
      setCurrentStep(0);
      setAnimationPhase('intro');
    } else {
      setAnimationPhase('complete');
    }
  };

  const previousExample = () => {
    if (currentExample > 0) {
      setCurrentExample(currentExample - 1);
      setCurrentStep(0);
      setAnimationPhase('intro');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{rule.title}</h1>
        <p className="text-lg text-gray-600 mb-4">{rule.description}</p>
        <div className="flex justify-center space-x-4 text-sm text-gray-500">
          <span>Example {currentExample + 1} of {rule.examples.length}</span>
          <span>Difficulty: {'⭐'.repeat(rule.difficulty)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentExample + 1) / rule.examples.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Animation Area */}
      <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 min-h-96 mb-8">
        <AnimatePresence mode="wait">
          {animationPhase !== 'complete' && (
            <motion.div
              key={currentExample}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {renderAnimation()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion Message */}
        {animationPhase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-96 text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Lesson Complete!</h2>
            <p className="text-lg text-green-600 mb-6">
              You've mastered {rule.title}!
            </p>
            <div className="flex space-x-4">
              <button
                onClick={onComplete}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue Learning
              </button>
              {onNext && (
                <button
                  onClick={onNext}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next Lesson
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Explanation Panel */}
      {animationPhase !== 'complete' && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-blue-800">
              Explanation: {example.base} → {example.result}
            </h3>
            <span className="text-blue-600">
              {showExplanation ? '▼' : '▶'}
            </span>
          </button>
          
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 text-blue-700"
              >
                <p className="mb-2">{example.explanation}</p>
                <p className="italic">Translation: "{example.translation}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation Controls */}
      {animationPhase !== 'complete' && (
        <div className="flex justify-between items-center">
          <button
            onClick={previousExample}
            disabled={currentExample === 0}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          <div className="flex space-x-2">
            {rule.examples.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentExample(index);
                  setCurrentStep(0);
                  setAnimationPhase('intro');
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentExample ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextExample}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentExample === rule.examples.length - 1 ? 'Complete' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}
