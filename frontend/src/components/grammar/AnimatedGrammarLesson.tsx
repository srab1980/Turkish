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
  lessonId?: string; // To vary content by lesson
  additionalBatches?: GrammarExample[][]; // Additional practice batches
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

// Helper function to get grammar variations based on lesson and animation type
const getGrammarVariations = (animationType: AnimationType, lessonId: string): GrammarExample[] => {
  const baseVariations: Record<AnimationType, Record<string, GrammarExample[]>> = {
    vowel_harmony: {
      'lesson-1': [
        { id: 'vh1', base: 'ev', suffix: 'ler', result: 'evler', translation: 'houses', explanation: 'Front vowel + front vowel suffix' },
        { id: 'vh2', base: 'kız', suffix: 'lar', result: 'kızlar', translation: 'girls', explanation: 'Back vowel + back vowel suffix' },
        { id: 'vh3', base: 'göz', suffix: 'ler', result: 'gözler', translation: 'eyes', explanation: 'Front rounded vowel + front suffix' },
        { id: 'vh4', base: 'top', suffix: 'lar', result: 'toplar', translation: 'balls', explanation: 'Back rounded vowel + back suffix' },
        { id: 'vh5', base: 'kitap', suffix: 'lar', result: 'kitaplar', translation: 'books', explanation: 'Back vowel + back vowel suffix' }
      ],
      'lesson-2': [
        { id: 'vh6', base: 'çiçek', suffix: 'ler', result: 'çiçekler', translation: 'flowers', explanation: 'Front vowel + front vowel suffix' },
        { id: 'vh7', base: 'masa', suffix: 'lar', result: 'masalar', translation: 'tables', explanation: 'Back vowel + back vowel suffix' },
        { id: 'vh8', base: 'pencere', suffix: 'ler', result: 'pencereler', translation: 'windows', explanation: 'Front vowel + front vowel suffix' },
        { id: 'vh9', base: 'kapı', suffix: 'lar', result: 'kapılar', translation: 'doors', explanation: 'Back vowel + back vowel suffix' },
        { id: 'vh10', base: 'öğretmen', suffix: 'ler', result: 'öğretmenler', translation: 'teachers', explanation: 'Front vowel + front vowel suffix' }
      ],
      'default': [
        { id: 'vh11', base: 'araba', suffix: 'lar', result: 'arabalar', translation: 'cars', explanation: 'Back vowel + back vowel suffix' },
        { id: 'vh12', base: 'elma', suffix: 'lar', result: 'elmalar', translation: 'apples', explanation: 'Front vowel + front vowel suffix' },
        { id: 'vh13', base: 'okul', suffix: 'lar', result: 'okullar', translation: 'schools', explanation: 'Back vowel + back vowel suffix' },
        { id: 'vh14', base: 'şehir', suffix: 'ler', result: 'şehirler', translation: 'cities', explanation: 'Front vowel + front vowel suffix' },
        { id: 'vh15', base: 'hayvan', suffix: 'lar', result: 'hayvanlar', translation: 'animals', explanation: 'Back vowel + back vowel suffix' }
      ]
    },
    plural_suffix: {
      'lesson-1': [
        { id: 'ps1', base: 'çocuk', suffix: 'lar', result: 'çocuklar', translation: 'children', explanation: 'Plural suffix for back vowel words' },
        { id: 'ps2', base: 'kedi', suffix: 'ler', result: 'kediler', translation: 'cats', explanation: 'Plural suffix for front vowel words' },
        { id: 'ps3', base: 'köpek', suffix: 'ler', result: 'köpekler', translation: 'dogs', explanation: 'Plural suffix for front vowel words' },
        { id: 'ps4', base: 'kuş', suffix: 'lar', result: 'kuşlar', translation: 'birds', explanation: 'Plural suffix for back vowel words' },
        { id: 'ps5', base: 'balık', suffix: 'lar', result: 'balıklar', translation: 'fish', explanation: 'Plural suffix for back vowel words' }
      ],
      'default': [
        { id: 'ps6', base: 'ağaç', suffix: 'lar', result: 'ağaçlar', translation: 'trees', explanation: 'Plural suffix for back vowel words' },
        { id: 'ps7', base: 'çiçek', suffix: 'ler', result: 'çiçekler', translation: 'flowers', explanation: 'Plural suffix for front vowel words' },
        { id: 'ps8', base: 'meyve', suffix: 'ler', result: 'meyveler', translation: 'fruits', explanation: 'Plural suffix for front vowel words' },
        { id: 'ps9', base: 'sebze', suffix: 'ler', result: 'sebzeler', translation: 'vegetables', explanation: 'Plural suffix for front vowel words' },
        { id: 'ps10', base: 'yemek', suffix: 'ler', result: 'yemekler', translation: 'foods', explanation: 'Plural suffix for front vowel words' }
      ]
    },
    possessive_suffix: {
      'default': [
        { id: 'pos1', base: 'ev', suffix: 'im', result: 'evim', translation: 'my house', explanation: 'First person possessive suffix' },
        { id: 'pos2', base: 'araba', suffix: 'n', result: 'araban', translation: 'your car', explanation: 'Second person possessive suffix' },
        { id: 'pos3', base: 'kitap', suffix: 'ı', result: 'kitabı', translation: 'his/her book', explanation: 'Third person possessive suffix' },
        { id: 'pos4', base: 'okul', suffix: 'umuz', result: 'okulumuz', translation: 'our school', explanation: 'First person plural possessive' },
        { id: 'pos5', base: 'öğretmen', suffix: 'iniz', result: 'öğretmeniniz', translation: 'your teacher', explanation: 'Second person plural possessive' }
      ]
    },
    case_suffix: {
      'default': [
        { id: 'cs1', base: 'ev', suffix: 'e', result: 'eve', translation: 'to the house', explanation: 'Dative case suffix' },
        { id: 'cs2', base: 'okul', suffix: 'da', result: 'okulda', translation: 'at school', explanation: 'Locative case suffix' },
        { id: 'cs3', base: 'kitap', suffix: 'ı', result: 'kitabı', translation: 'the book (object)', explanation: 'Accusative case suffix' },
        { id: 'cs4', base: 'çanta', suffix: 'dan', result: 'çantadan', translation: 'from the bag', explanation: 'Ablative case suffix' },
        { id: 'cs5', base: 'masa', suffix: 'nın', result: 'masanın', translation: 'of the table', explanation: 'Genitive case suffix' }
      ]
    }
  };

  const lessonVariations = baseVariations[animationType][lessonId] || baseVariations[animationType]['default'];
  return lessonVariations;
};

export default function AnimatedGrammarLesson({ rule, onComplete, onNext }: AnimatedGrammarLessonProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'intro' | 'demonstration' | 'practice' | 'complete'>('intro');
  const [currentBatch, setCurrentBatch] = useState(0); // 0 = main, 1 = batch 1, 2 = batch 2
  const [currentExamples, setCurrentExamples] = useState<GrammarExample[]>(rule.examples);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [completedBatches, setCompletedBatches] = useState<number[]>([]);

  const example = currentExamples[currentExample];

  // Initialize with at least 5 examples
  useEffect(() => {
    const initializeExamples = () => {
      let examples = [...rule.examples];

      // Ensure we have at least 5 examples by generating variations if needed
      while (examples.length < 5) {
        const baseExample = examples[examples.length % examples.length];
        const variation = generateExampleVariation(baseExample, examples.length, rule.lessonId);
        examples.push(variation);
      }

      setCurrentExamples(examples);

      // Show load more button if we have additional batches
      if (rule.additionalBatches && rule.additionalBatches.length > 0) {
        setShowLoadMore(true);
      }
    };

    initializeExamples();
  }, [rule]);

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

  // Generate example variations based on lesson ID and grammar rule
  const generateExampleVariation = (baseExample: GrammarExample, index: number, lessonId?: string): GrammarExample => {
    const variations = getGrammarVariations(rule.animation, lessonId || 'default');
    const variation = variations[index % variations.length];

    return {
      id: `${baseExample.id}-var-${index}`,
      base: variation.base,
      suffix: variation.suffix,
      result: variation.result,
      translation: variation.translation,
      explanation: variation.explanation
    };
  };

  const loadMoreExamples = () => {
    if (rule.additionalBatches && currentBatch < rule.additionalBatches.length) {
      const nextBatch = rule.additionalBatches[currentBatch];
      setCurrentExamples([...currentExamples, ...nextBatch]);
      setCurrentBatch(currentBatch + 1);
      setCompletedBatches([...completedBatches, currentBatch]);

      // Hide load more if no more batches
      if (currentBatch + 1 >= rule.additionalBatches.length) {
        setShowLoadMore(false);
      }
    }
  };

  const nextExample = () => {
    if (currentExample < currentExamples.length - 1) {
      setCurrentExample(currentExample + 1);
      setCurrentStep(0);
      setAnimationPhase('demonstration');
    } else {
      setAnimationPhase('complete');
    }
  };

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
          <span>Example {currentExample + 1} of {currentExamples.length}</span>
          <span>Difficulty: {'⭐'.repeat(rule.difficulty)}</span>
          {currentBatch > 0 && <span>Batch {currentBatch + 1}</span>}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentExample + 1) / currentExamples.length) * 100}%` }}
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
            {currentExamples.map((_, index) => (
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
            {currentExample === currentExamples.length - 1 ? 'Complete' : 'Next →'}
          </button>
        </div>
      )}

      {/* Load More Examples Button */}
      {showLoadMore && animationPhase !== 'complete' && (
        <div className="text-center mt-6">
          <button
            onClick={loadMoreExamples}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            📚 Load More Examples (Batch {currentBatch + 2})
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Get {rule.additionalBatches?.[currentBatch]?.length || 5} more practice examples
          </p>
        </div>
      )}

      {/* Completion Message */}
      {animationPhase === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-8 p-6 bg-green-50 rounded-lg border-2 border-green-200"
        >
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Excellent Work!</h2>
          <p className="text-green-700 mb-4">
            You've completed {currentExamples.length} grammar examples!
          </p>
          {completedBatches.length > 0 && (
            <p className="text-sm text-green-600 mb-4">
              Completed {completedBatches.length + 1} batches of examples
            </p>
          )}
          <button
            onClick={onComplete}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue Learning
          </button>
        </motion.div>
      )}
    </div>
  );
}
