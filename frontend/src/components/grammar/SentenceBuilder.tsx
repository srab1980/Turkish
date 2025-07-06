'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface WordTile {
  id: string;
  word: string;
  type: 'subject' | 'verb' | 'object' | 'adjective' | 'preposition' | 'article';
  correctPosition: number;
  translation?: string;
}

interface SentenceExercise {
  id: string;
  instruction: string;
  correctSentence: string;
  translation: string;
  wordTiles: WordTile[];
  grammarFocus: string;
  difficulty: number;
  hints: string[];
}

interface SentenceBuilderProps {
  exercises: SentenceExercise[];
  onComplete: (score: number, timeSpent: number) => void;
  lessonId?: string; // To vary content by lesson
  additionalBatches?: SentenceExercise[][]; // Additional practice batches
}

// Helper function to generate sentence variations based on lesson
const generateSentenceVariation = (baseExercise: SentenceExercise, index: number, lessonId?: string): SentenceExercise => {
  const variations = getSentenceVariations(lessonId || 'default');
  const variation = variations[index % variations.length];

  return {
    id: `${baseExercise.id}-var-${index}`,
    instruction: variation.instruction,
    correctSentence: variation.correctSentence,
    translation: variation.translation,
    wordTiles: variation.wordTiles,
    grammarFocus: variation.grammarFocus,
    difficulty: baseExercise.difficulty,
    hints: variation.hints
  };
};

// Get sentence variations based on lesson ID
const getSentenceVariations = (lessonId: string): SentenceExercise[] => {
  const variationsByLesson: Record<string, SentenceExercise[]> = {
    'lesson-1': [
      {
        id: 'sb1',
        instruction: 'Build a sentence about introducing yourself',
        correctSentence: 'Benim adım Ali',
        translation: 'My name is Ali',
        grammarFocus: 'Possessive pronouns',
        difficulty: 1,
        hints: ['Start with "Benim"', 'Use "adım" for "my name"'],
        wordTiles: [
          { id: 'w1', word: 'Benim', type: 'subject', correctPosition: 0, translation: 'My' },
          { id: 'w2', word: 'adım', type: 'object', correctPosition: 1, translation: 'name' },
          { id: 'w3', word: 'Ali', type: 'object', correctPosition: 2, translation: 'Ali' }
        ]
      },
      {
        id: 'sb2',
        instruction: 'Build a sentence about your age',
        correctSentence: 'Ben yirmi yaşındayım',
        translation: 'I am twenty years old',
        grammarFocus: 'Age expressions',
        difficulty: 2,
        hints: ['Start with "Ben"', 'Use "yaşındayım" for age'],
        wordTiles: [
          { id: 'w4', word: 'Ben', type: 'subject', correctPosition: 0, translation: 'I' },
          { id: 'w5', word: 'yirmi', type: 'adjective', correctPosition: 1, translation: 'twenty' },
          { id: 'w6', word: 'yaşındayım', type: 'verb', correctPosition: 2, translation: 'years old am' }
        ]
      },
      {
        id: 'sb3',
        instruction: 'Build a sentence about where you live',
        correctSentence: 'İstanbul da yaşıyorum',
        translation: 'I live in Istanbul',
        grammarFocus: 'Location and present tense',
        difficulty: 2,
        hints: ['Start with location', 'Use "yaşıyorum" for "I live"'],
        wordTiles: [
          { id: 'w7', word: 'İstanbul', type: 'object', correctPosition: 0, translation: 'Istanbul' },
          { id: 'w8', word: 'da', type: 'preposition', correctPosition: 1, translation: 'in' },
          { id: 'w9', word: 'yaşıyorum', type: 'verb', correctPosition: 2, translation: 'I live' }
        ]
      },
      {
        id: 'sb4',
        instruction: 'Build a sentence about your profession',
        correctSentence: 'Ben öğretmenim',
        translation: 'I am a teacher',
        grammarFocus: 'Profession expressions',
        difficulty: 1,
        hints: ['Start with "Ben"', 'Add profession with suffix'],
        wordTiles: [
          { id: 'w10', word: 'Ben', type: 'subject', correctPosition: 0, translation: 'I' },
          { id: 'w11', word: 'öğretmenim', type: 'verb', correctPosition: 1, translation: 'am a teacher' }
        ]
      },
      {
        id: 'sb5',
        instruction: 'Build a sentence about family',
        correctSentence: 'Benim ailem büyük',
        translation: 'My family is big',
        grammarFocus: 'Family and adjectives',
        difficulty: 2,
        hints: ['Start with "Benim"', 'Use "büyük" for "big"'],
        wordTiles: [
          { id: 'w12', word: 'Benim', type: 'subject', correctPosition: 0, translation: 'My' },
          { id: 'w13', word: 'ailem', type: 'object', correctPosition: 1, translation: 'family' },
          { id: 'w14', word: 'büyük', type: 'adjective', correctPosition: 2, translation: 'big' }
        ]
      }
    ],
    'lesson-2': [
      {
        id: 'sb6',
        instruction: 'Build a sentence about daily activities',
        correctSentence: 'Her gün okula gidiyorum',
        translation: 'I go to school every day',
        grammarFocus: 'Daily routines',
        difficulty: 3,
        hints: ['Start with "Her gün"', 'Use "gidiyorum" for "I go"'],
        wordTiles: [
          { id: 'w15', word: 'Her', type: 'adjective', correctPosition: 0, translation: 'Every' },
          { id: 'w16', word: 'gün', type: 'object', correctPosition: 1, translation: 'day' },
          { id: 'w17', word: 'okula', type: 'object', correctPosition: 2, translation: 'to school' },
          { id: 'w18', word: 'gidiyorum', type: 'verb', correctPosition: 3, translation: 'I go' }
        ]
      },
      {
        id: 'sb7',
        instruction: 'Build a sentence about food preferences',
        correctSentence: 'Türk yemeği seviyorum',
        translation: 'I love Turkish food',
        grammarFocus: 'Food and preferences',
        difficulty: 2,
        hints: ['Start with food type', 'Use "seviyorum" for "I love"'],
        wordTiles: [
          { id: 'w19', word: 'Türk', type: 'adjective', correctPosition: 0, translation: 'Turkish' },
          { id: 'w20', word: 'yemeği', type: 'object', correctPosition: 1, translation: 'food' },
          { id: 'w21', word: 'seviyorum', type: 'verb', correctPosition: 2, translation: 'I love' }
        ]
      }
    ],
    'default': [
      {
        id: 'sb8',
        instruction: 'Build a simple greeting',
        correctSentence: 'Merhaba nasılsın',
        translation: 'Hello, how are you?',
        grammarFocus: 'Greetings',
        difficulty: 1,
        hints: ['Start with "Merhaba"', 'Add question about condition'],
        wordTiles: [
          { id: 'w22', word: 'Merhaba', type: 'verb', correctPosition: 0, translation: 'Hello' },
          { id: 'w23', word: 'nasılsın', type: 'verb', correctPosition: 1, translation: 'how are you' }
        ]
      },
      {
        id: 'sb9',
        instruction: 'Build a sentence about weather',
        correctSentence: 'Bugün hava güzel',
        translation: 'Today the weather is nice',
        grammarFocus: 'Weather expressions',
        difficulty: 2,
        hints: ['Start with "Bugün"', 'Use "güzel" for "nice"'],
        wordTiles: [
          { id: 'w24', word: 'Bugün', type: 'adjective', correctPosition: 0, translation: 'Today' },
          { id: 'w25', word: 'hava', type: 'subject', correctPosition: 1, translation: 'weather' },
          { id: 'w26', word: 'güzel', type: 'adjective', correctPosition: 2, translation: 'nice' }
        ]
      }
    ]
  };

  return variationsByLesson[lessonId] || variationsByLesson['default'];
};

// Generate fresh sentence batches for additional practice (unique per batch)
const generateFreshSentenceBatch = (lessonId: string, batchNumber: number): SentenceExercise[] => {
  // Different sentence sets for each batch to avoid duplication
  const batchSentenceSets = [
    // Batch 1 - Daily Routine
    [
      {
        id: `fresh-${batchNumber}-1`,
        instruction: 'Build a sentence about your daily routine',
        correctSentence: 'Sabah kahvaltı yapıyorum',
        translation: 'I have breakfast in the morning',
        grammarFocus: 'Daily activities',
        difficulty: 2,
        hints: ['Start with time', 'Use present tense'],
        wordTiles: [
          { id: `f${batchNumber}-1`, word: 'Sabah', type: 'adjective', correctPosition: 0, translation: 'Morning' },
          { id: `f${batchNumber}-2`, word: 'kahvaltı', type: 'object', correctPosition: 1, translation: 'breakfast' },
          { id: `f${batchNumber}-3`, word: 'yapıyorum', type: 'verb', correctPosition: 2, translation: 'I do/have' }
        ]
      },
      {
        id: `fresh-${batchNumber}-2`,
        instruction: 'Build a sentence about transportation',
        correctSentence: 'Otobüsle işe gidiyorum',
        translation: 'I go to work by bus',
        grammarFocus: 'Transportation',
        difficulty: 3,
        hints: ['Use instrumental case', 'Add direction'],
        wordTiles: [
          { id: `f${batchNumber}-4`, word: 'Otobüsle', type: 'adjective', correctPosition: 0, translation: 'By bus' },
          { id: `f${batchNumber}-5`, word: 'işe', type: 'object', correctPosition: 1, translation: 'to work' },
          { id: `f${batchNumber}-6`, word: 'gidiyorum', type: 'verb', correctPosition: 2, translation: 'I go' }
        ]
      },
      {
        id: `fresh-${batchNumber}-3`,
        instruction: 'Build a sentence about weekend activities',
        correctSentence: 'Hafta sonu arkadaşlarımla buluşuyorum',
        translation: 'I meet with my friends on weekends',
        grammarFocus: 'Social activities',
        difficulty: 3,
        hints: ['Start with time expression', 'Use "with" construction'],
        wordTiles: [
          { id: `f${batchNumber}-7`, word: 'Hafta', type: 'adjective', correctPosition: 0, translation: 'Week' },
          { id: `f${batchNumber}-8`, word: 'sonu', type: 'object', correctPosition: 1, translation: 'end' },
          { id: `f${batchNumber}-9`, word: 'arkadaşlarımla', type: 'object', correctPosition: 2, translation: 'with my friends' },
          { id: `f${batchNumber}-10`, word: 'buluşuyorum', type: 'verb', correctPosition: 3, translation: 'I meet' }
        ]
      },
      {
        id: `fresh-${batchNumber}-4`,
        instruction: 'Build a sentence about shopping',
        correctSentence: 'Marketten ekmek alıyorum',
        translation: 'I buy bread from the market',
        grammarFocus: 'Shopping expressions',
        difficulty: 2,
        hints: ['Use ablative case', 'Object + verb'],
        wordTiles: [
          { id: `f${batchNumber}-11`, word: 'Marketten', type: 'adjective', correctPosition: 0, translation: 'From market' },
          { id: `f${batchNumber}-12`, word: 'ekmek', type: 'object', correctPosition: 1, translation: 'bread' },
          { id: `f${batchNumber}-13`, word: 'alıyorum', type: 'verb', correctPosition: 2, translation: 'I buy' }
        ]
      },
      {
        id: `fresh-${batchNumber}-5`,
        instruction: 'Build a sentence about evening activities',
        correctSentence: 'Akşam televizyon izliyorum',
        translation: 'I watch television in the evening',
        grammarFocus: 'Evening routines',
        difficulty: 2,
        hints: ['Start with time', 'Object + verb'],
        wordTiles: [
          { id: `f${batchNumber}-14`, word: 'Akşam', type: 'adjective', correctPosition: 0, translation: 'Evening' },
          { id: `f${batchNumber}-15`, word: 'televizyon', type: 'object', correctPosition: 1, translation: 'television' },
          { id: `f${batchNumber}-16`, word: 'izliyorum', type: 'verb', correctPosition: 2, translation: 'I watch' }
        ]
      }
    ],
    // Batch 2 - Different themes
    [
      {
        id: `fresh-${batchNumber}-1`,
        instruction: 'Build a sentence about weather',
        correctSentence: 'Bugün hava çok güzel',
        translation: 'Today the weather is very nice',
        grammarFocus: 'Weather expressions',
        difficulty: 2,
        hints: ['Start with "Bugün"', 'Use adjectives'],
        wordTiles: [
          { id: `f${batchNumber}-1`, word: 'Bugün', type: 'adjective', correctPosition: 0, translation: 'Today' },
          { id: `f${batchNumber}-2`, word: 'hava', type: 'subject', correctPosition: 1, translation: 'weather' },
          { id: `f${batchNumber}-3`, word: 'çok', type: 'adjective', correctPosition: 2, translation: 'very' },
          { id: `f${batchNumber}-4`, word: 'güzel', type: 'adjective', correctPosition: 3, translation: 'nice' }
        ]
      },
      {
        id: `fresh-${batchNumber}-2`,
        instruction: 'Build a sentence about food preferences',
        correctSentence: 'Türk yemeği çok seviyorum',
        translation: 'I love Turkish food very much',
        grammarFocus: 'Food and preferences',
        difficulty: 3,
        hints: ['Object comes first', 'Use "seviyorum"'],
        wordTiles: [
          { id: `f${batchNumber}-5`, word: 'Türk', type: 'adjective', correctPosition: 0, translation: 'Turkish' },
          { id: `f${batchNumber}-6`, word: 'yemeği', type: 'object', correctPosition: 1, translation: 'food' },
          { id: `f${batchNumber}-7`, word: 'çok', type: 'adjective', correctPosition: 2, translation: 'very much' },
          { id: `f${batchNumber}-8`, word: 'seviyorum', type: 'verb', correctPosition: 3, translation: 'I love' }
        ]
      },
      {
        id: `fresh-${batchNumber}-3`,
        instruction: 'Build a sentence about family',
        correctSentence: 'Ailemle birlikte yaşıyorum',
        translation: 'I live together with my family',
        grammarFocus: 'Family relationships',
        difficulty: 3,
        hints: ['Use "ile" construction', 'Add "birlikte"'],
        wordTiles: [
          { id: `f${batchNumber}-9`, word: 'Ailemle', type: 'object', correctPosition: 0, translation: 'With my family' },
          { id: `f${batchNumber}-10`, word: 'birlikte', type: 'adjective', correctPosition: 1, translation: 'together' },
          { id: `f${batchNumber}-11`, word: 'yaşıyorum', type: 'verb', correctPosition: 2, translation: 'I live' }
        ]
      },
      {
        id: `fresh-${batchNumber}-4`,
        instruction: 'Build a sentence about hobbies',
        correctSentence: 'Boş zamanımda kitap okuyorum',
        translation: 'I read books in my free time',
        grammarFocus: 'Hobbies and free time',
        difficulty: 3,
        hints: ['Start with time expression', 'Object + verb'],
        wordTiles: [
          { id: `f${batchNumber}-12`, word: 'Boş', type: 'adjective', correctPosition: 0, translation: 'Free' },
          { id: `f${batchNumber}-13`, word: 'zamanımda', type: 'object', correctPosition: 1, translation: 'in my time' },
          { id: `f${batchNumber}-14`, word: 'kitap', type: 'object', correctPosition: 2, translation: 'book' },
          { id: `f${batchNumber}-15`, word: 'okuyorum', type: 'verb', correctPosition: 3, translation: 'I read' }
        ]
      },
      {
        id: `fresh-${batchNumber}-5`,
        instruction: 'Build a sentence about travel',
        correctSentence: 'Yazın tatile gidiyorum',
        translation: 'I go on vacation in summer',
        grammarFocus: 'Travel and seasons',
        difficulty: 2,
        hints: ['Start with season', 'Use direction'],
        wordTiles: [
          { id: `f${batchNumber}-16`, word: 'Yazın', type: 'adjective', correctPosition: 0, translation: 'In summer' },
          { id: `f${batchNumber}-17`, word: 'tatile', type: 'object', correctPosition: 1, translation: 'on vacation' },
          { id: `f${batchNumber}-18`, word: 'gidiyorum', type: 'verb', correctPosition: 2, translation: 'I go' }
        ]
      }
    ]
  ];

  // Select the appropriate batch based on batch number
  const selectedBatch = batchSentenceSets[(batchNumber - 1) % batchSentenceSets.length];
  return selectedBatch;
};

export default function SentenceBuilder({
  exercises,
  onComplete,
  lessonId,
  additionalBatches
}: SentenceBuilderProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [availableTiles, setAvailableTiles] = useState<WordTile[]>([]);
  const [sentenceSlots, setSentenceSlots] = useState<(WordTile | null)[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [gameStartTime] = useState(new Date());
  const [exerciseStartTime, setExerciseStartTime] = useState(new Date());
  const [gameComplete, setGameComplete] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [currentExercises, setCurrentExercises] = useState<SentenceExercise[]>(exercises);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [completedBatches, setCompletedBatches] = useState<number[]>([]);
  const [maxBatches] = useState(5); // Maximum 5 additional batches
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const [sentenceChecked, setSentenceChecked] = useState(false);

  // Audio pronunciation function
  const playAudio = (text: string, language: 'turkish' | 'english' = 'turkish') => {
    try {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set language based on content type
      if (language === 'turkish') {
        utterance.lang = 'tr-TR'; // Turkish language
      } else {
        utterance.lang = 'en-US'; // English language
      }

      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Add error handling
      utterance.onerror = (event) => {
        console.log('Speech synthesis error:', event.error);
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.log('Speech synthesis not available:', error);
    }
  };

  const [draggedTile, setDraggedTile] = useState<WordTile | null>(null);

  // Handle exercise completion
  const handleExerciseCompletion = (points: number) => {
    setTimeout(() => {
      setCurrentExerciseIndex(prev => {
        if (prev < currentExercises.length - 1) {
          setSentenceChecked(false); // Reset for next exercise
          return prev + 1;
        } else {
          // After completing initial 5 sentences (batch 0), show load more option
          if (currentBatch === 0) {
            setGameComplete(true); // Show completion screen with load more
            setShowLoadMore(true); // Enable load more button
          } else if (currentBatch === 1) {
            // After completing one additional batch, auto-transfer to next exercise
            setGameComplete(true);
            setTimeout(() => {
              const timeSpent = (new Date().getTime() - gameStartTime.getTime()) / 1000;
              onComplete(score + points, timeSpent);
            }, 2000); // Give user 2 seconds to see completion
          } else {
            // Final completion after all batches (shouldn't reach here normally)
            setGameComplete(true);
            setTimeout(() => {
              const timeSpent = (new Date().getTime() - gameStartTime.getTime()) / 1000;
              onComplete(score + points, timeSpent);
            }, 0);
          }
          return prev;
        }
      });
    }, 1500);
  };

  const currentExercise = currentExercises[currentExerciseIndex];

  // Initialize with exactly 5 exercises
  useEffect(() => {
    const initializeExercises = () => {
      // Always use fresh batch generation to ensure no duplicates
      const initialBatch = generateFreshSentenceBatch(lessonId || 'default', 1);
      setCurrentExercises(initialBatch);

      // Always show load more button for additional batches
      setShowLoadMore(true);
    };

    initializeExercises();
  }, [exercises, lessonId, additionalBatches]);

  useEffect(() => {
    if (currentExercise) {
      initializeExercise();
    }
  }, [currentExerciseIndex, currentExercise]);

  const initializeExercise = () => {
    // Shuffle word tiles
    const shuffledTiles = [...currentExercise.wordTiles].sort(() => Math.random() - 0.5);
    setAvailableTiles(shuffledTiles);
    
    // Initialize empty sentence slots
    setSentenceSlots(new Array(currentExercise.wordTiles.length).fill(null));
    
    setShowFeedback(null);
    setShowHint(false);
    setHintIndex(0);
    setExerciseStartTime(new Date());
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === 'available' && destination.droppableId === 'sentence') {
      // Move from available to sentence
      const newAvailable = Array.from(availableTiles);
      const newSentence = Array.from(sentenceSlots);
      const [movedTile] = newAvailable.splice(source.index, 1);
      
      // If slot is occupied, move that tile back to available
      if (newSentence[destination.index]) {
        newAvailable.push(newSentence[destination.index]!);
      }
      
      newSentence[destination.index] = movedTile;
      setAvailableTiles(newAvailable);
      setSentenceSlots(newSentence);
    } else if (source.droppableId === 'sentence' && destination.droppableId === 'available') {
      // Move from sentence to available
      const newSentence = Array.from(sentenceSlots);
      const newAvailable = Array.from(availableTiles);
      const movedTile = newSentence[source.index];
      
      if (movedTile) {
        newSentence[source.index] = null;
        newAvailable.splice(destination.index, 0, movedTile);
        setSentenceSlots(newSentence);
        setAvailableTiles(newAvailable);
      }
    } else if (source.droppableId === 'sentence' && destination.droppableId === 'sentence') {
      // Reorder within sentence
      const newSentence = Array.from(sentenceSlots);
      const [movedTile] = newSentence.splice(source.index, 1);
      newSentence.splice(destination.index, 0, movedTile);
      setSentenceSlots(newSentence);
    } else if (source.droppableId === 'available' && destination.droppableId === 'available') {
      // Reorder within available
      const newAvailable = Array.from(availableTiles);
      const [movedTile] = newAvailable.splice(source.index, 1);
      newAvailable.splice(destination.index, 0, movedTile);
      setAvailableTiles(newAvailable);
    }
  };

  const checkSentence = () => {
    setAttempts(attempts + 1);
    
    // Check if all slots are filled
    if (sentenceSlots.some(slot => slot === null)) {
      setShowFeedback('incomplete');
      setTimeout(() => setShowFeedback(null), 2000);
      return;
    }

    // Check if sentence is correct
    const userSentence = sentenceSlots.map(tile => tile?.word).join(' ');
    const isCorrect = userSentence === currentExercise.correctSentence;

    if (isCorrect) {
      const points = showHint ? 5 : 10;
      setScore(score + points);
      setShowFeedback('correct');
      
      setTimeout(() => {
        if (currentExerciseIndex < exercises.length - 1) {
          setCurrentExerciseIndex(currentExerciseIndex + 1);
        } else {
          setGameComplete(true);
          const timeSpent = (new Date().getTime() - gameStartTime.getTime()) / 1000;
          onComplete(score + points, timeSpent);
        }
      }, 2000);
    } else {
      setShowFeedback('incorrect');
      setTimeout(() => setShowFeedback(null), 2000);
    }
  };

  const clearSentence = () => {
    setAvailableTiles([...availableTiles, ...sentenceSlots.filter(tile => tile !== null) as WordTile[]]);
    setSentenceSlots(new Array(currentExercise.wordTiles.length).fill(null));
  };

  const showNextHint = () => {
    if (hintIndex < currentExercise.hints.length) {
      setShowHint(true);
      setHintIndex(hintIndex + 1);
    }
  };

  const loadMoreExercises = () => {
    if (currentBatch < maxBatches) {
      // Generate fresh exercises for this batch (5 new sentences)
      const newBatch = generateFreshSentenceBatch(lessonId || 'default', currentBatch + 1);

      // Replace current exercises with new batch (not append)
      setCurrentExercises(newBatch);
      setCurrentExerciseIndex(0); // Reset to first exercise
      setCurrentBatch(currentBatch + 1);
      setCompletedBatches([...completedBatches, currentBatch]);
      setGameComplete(false); // Resume game
      setSentenceChecked(false); // Reset check flag
      setShowFeedback(null); // Clear feedback

      // Hide load more if reached max batches
      if (currentBatch + 1 >= maxBatches) {
        setShowLoadMore(false);
      }
    }
  };

  // Auto-check when sentence is complete
  useEffect(() => {
    if (autoCheckEnabled && sentenceSlots.every(slot => slot !== null) && !sentenceChecked) {
      setSentenceChecked(true);

      // Check if sentence is correct
      const userSentence = sentenceSlots.map(tile => tile?.word).join(' ');
      const isCorrect = userSentence === currentExercise.correctSentence;

      setAttempts(prev => prev + 1);

      if (isCorrect) {
        const points = showHint ? 5 : 10;
        setScore(prev => prev + points);
        setShowFeedback('correct');

        // Pronounce the correct sentence in Turkish only
        setTimeout(() => {
          playAudio(userSentence, 'turkish');
        }, 500);

        // Handle exercise completion
        handleExerciseCompletion(points);
      } else {
        setShowFeedback('incorrect');
        setTimeout(() => {
          setShowFeedback(null);
          setSentenceChecked(false); // Allow retry
        }, 2000);
      }
    }
  }, [sentenceSlots, autoCheckEnabled, currentExercise, showHint, currentExercises.length, gameStartTime, onComplete, sentenceChecked, score]);

  // Reset sentence checked flag when exercise changes or when sentence is incomplete
  useEffect(() => {
    if (sentenceSlots.some(slot => slot === null)) {
      setSentenceChecked(false);
    }
  }, [sentenceSlots]);

  // Reset sentence checked flag when exercise changes
  useEffect(() => {
    setSentenceChecked(false);
    setShowFeedback(null);
  }, [currentExerciseIndex]);

  const getWordTypeColor = (type: string) => {
    const colors = {
      subject: 'bg-blue-100 border-blue-300 text-blue-800',
      verb: 'bg-green-100 border-green-300 text-green-800',
      object: 'bg-purple-100 border-purple-300 text-purple-800',
      adjective: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      preposition: 'bg-red-100 border-red-300 text-red-800',
      article: 'bg-gray-100 border-gray-300 text-gray-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  if (gameComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-green-50 rounded-lg border-2 border-green-200"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-800 mb-4">Tebrikler! (Congratulations!)</h2>
        <div className="text-lg text-green-700 mb-6">
          <p>Score: {score} points</p>
          <p>Exercises Completed: {currentExercises.length}</p>
          {completedBatches.length > 0 && (
            <p>Batches Completed: {completedBatches.length + 1}</p>
          )}
          <p>Total Attempts: {attempts}</p>
          <p>Accuracy: {Math.round((score / (attempts * 10)) * 100)}%</p>
        </div>

        {/* Load More Button */}
        <div className="space-y-4">
          {showLoadMore && currentBatch === 0 && (
            <button
              onClick={loadMoreExercises}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              📝 Load Additional Batch (5 more sentences)
            </button>
          )}

          {/* Show message after batch 1 completion */}
          {currentBatch === 1 && (
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-semibold">🎉 Great job! Moving to next exercise...</p>
            </div>
          )}

          {/* Continue Learning Button */}
          <button
            onClick={() => {
              const timeSpent = (new Date().getTime() - gameStartTime.getTime()) / 1000;
              onComplete(score, timeSpent);
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors ml-4"
          >
            ✅ Continue Learning
          </button>
        </div>
      </motion.div>
    );
  }

  if (!currentExercise) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sentence Builder</h1>
        <div className="flex justify-center space-x-6 text-sm text-gray-600">
          <span>Exercise {currentExerciseIndex + 1}/{currentExercises.length}</span>
          <span>Score: {score}</span>
          <span>Grammar: {currentExercise.grammarFocus}</span>
          {currentBatch > 0 && <span>Batch {currentBatch + 1}</span>}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentExerciseIndex + 1) / currentExercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Instruction */}
      <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-lg font-semibold text-blue-800 mb-2">{currentExercise.instruction}</p>
        <p className="text-sm text-blue-600">Target: "{currentExercise.translation}"</p>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`text-center mb-4 p-3 rounded-lg ${
              showFeedback === 'correct' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : showFeedback === 'incorrect'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}
          >
            {showFeedback === 'correct' && '✅ Mükemmel! (Perfect!)'}
            {showFeedback === 'incorrect' && '❌ Tekrar dene! (Try again!)'}
            {showFeedback === 'incomplete' && '⚠️ Tüm kelimeleri yerleştirin! (Place all words!)'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {showHint && hintIndex > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="text-yellow-800">
            💡 Hint {hintIndex}: {currentExercise.hints[hintIndex - 1]}
          </div>
        </motion.div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Sentence Construction Area */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-center mb-4">Build Your Sentence:</h3>
          <Droppable droppableId="sentence" direction="horizontal">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`min-h-20 p-4 border-2 border-dashed rounded-lg flex items-center justify-center gap-3 flex-wrap transition-colors ${
                  snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                {sentenceSlots.map((tile, index) => (
                  <div key={index} className="relative">
                    {tile ? (
                      <Draggable draggableId={`sentence-${tile.id}`} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`px-4 py-2 rounded-lg border-2 font-semibold cursor-move transition-all ${
                              getWordTypeColor(tile.type)
                            } ${snapshot.isDragging ? 'shadow-lg transform rotate-2' : 'hover:shadow-md'}`}
                            whileHover={{ scale: 1.05 }}
                            whileDrag={{ scale: 1.1, rotate: 5 }}
                            onClick={() => playAudio(tile.word, 'turkish')}
                            title={`Click to pronounce: ${tile.word} (${tile.translation})`}
                          >
                            {tile.word}
                            <span className="ml-1 text-xs opacity-60">🔊</span>
                          </motion.div>
                        )}
                      </Draggable>
                    ) : (
                      <div className="w-24 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        {index + 1}
                      </div>
                    )}
                  </div>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Available Words */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-center mb-4">Available Words:</h3>
          <Droppable droppableId="available" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="min-h-20 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg flex items-center justify-center gap-3 flex-wrap"
              >
                {availableTiles.map((tile, index) => (
                  <Draggable key={tile.id} draggableId={tile.id} index={index}>
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`px-4 py-2 rounded-lg border-2 font-semibold cursor-move transition-all ${
                          getWordTypeColor(tile.type)
                        } ${snapshot.isDragging ? 'shadow-lg transform rotate-2' : 'hover:shadow-md'}`}
                        whileHover={{ scale: 1.05 }}
                        whileDrag={{ scale: 1.1, rotate: 5 }}
                        onClick={() => playAudio(tile.word, 'turkish')}
                        title={`Click to pronounce: ${tile.word} (${tile.translation})`}
                      >
                        {tile.word}
                        <span className="ml-1 text-xs opacity-60">🔊</span>
                      </motion.div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      {/* Word Type Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Word Types:</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">Subject</span>
          <span className="px-2 py-1 rounded bg-green-100 text-green-800">Verb</span>
          <span className="px-2 py-1 rounded bg-purple-100 text-purple-800">Object</span>
          <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">Adjective</span>
          <span className="px-2 py-1 rounded bg-red-100 text-red-800">Preposition</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={clearSentence}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={showNextHint}
          disabled={hintIndex >= currentExercise.hints.length}
          className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          💡 Hint (-5 pts)
        </button>
      </div>

      {/* Auto-check info */}
      <div className="text-center mt-4 text-sm text-gray-600">
        💡 Sentences are automatically checked when complete
      </div>

      {/* Load More Exercises Button */}
      {showLoadMore && !gameComplete && currentBatch < maxBatches && (
        <div className="text-center mt-6">
          <button
            onClick={loadMoreExercises}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            📝 Load More Exercises (Batch {currentBatch + 1}/{maxBatches})
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Get 5 fresh sentence building exercises to practice more
          </p>
        </div>
      )}
    </div>
  );
}
