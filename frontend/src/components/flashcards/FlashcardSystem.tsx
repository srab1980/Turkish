'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { VocabularyItem } from '@/types';

interface FlashcardSystemProps {
  vocabularyItems: VocabularyItem[];
  onComplete: (results: FlashcardResult[]) => void;
  unitId: string;
  lessonId?: string;
}

interface FlashcardResult {
  vocabularyId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  attempts: number;
  timeSpent: number;
}

interface FlashcardState extends VocabularyItem {
  id: string;
  repetitionLevel: number;
  nextReview: Date;
  easeFactor: number;
  interval: number;
}

export default function FlashcardSystem({ vocabularyItems, onComplete, unitId, lessonId }: FlashcardSystemProps) {
  const [cards, setCards] = useState<FlashcardState[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<FlashcardResult[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [cardStartTime, setCardStartTime] = useState<Date>(new Date());
  const [attempts, setAttempts] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [maxBatches] = useState(5);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [completedBatches, setCompletedBatches] = useState<number[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);

  // Text-to-speech function for Turkish pronunciation
  const speakTurkish = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Generate fresh vocabulary from previous lessons if needed
  const generateFreshVocabulary = (batchNumber: number): VocabularyItem[] => {
    const allFreshVocab: VocabularyItem[] = [
      // Batch 1 - Nature
      { turkish: 'güneş', english: 'sun', category: 'nature', difficulty: 'easy', pronunciation: 'gü-NEŞH' },
      { turkish: 'ay', english: 'moon', category: 'nature', difficulty: 'easy', pronunciation: 'AH-y' },
      { turkish: 'yıldız', english: 'star', category: 'nature', difficulty: 'easy', pronunciation: 'yıl-DUZ' },
      { turkish: 'bulut', english: 'cloud', category: 'nature', difficulty: 'easy', pronunciation: 'bu-LUT' },
      { turkish: 'rüzgar', english: 'wind', category: 'nature', difficulty: 'medium', pronunciation: 'rüz-GAR' },
      { turkish: 'yağmur', english: 'rain', category: 'nature', difficulty: 'medium', pronunciation: 'yağ-MUR' },
      { turkish: 'kar', english: 'snow', category: 'nature', difficulty: 'easy', pronunciation: 'KAR' },
      { turkish: 'deniz', english: 'sea', category: 'nature', difficulty: 'easy', pronunciation: 'de-NİZ' },
      { turkish: 'dağ', english: 'mountain', category: 'nature', difficulty: 'medium', pronunciation: 'DAĞ' },
      { turkish: 'orman', english: 'forest', category: 'nature', difficulty: 'medium', pronunciation: 'or-MAN' },

      // Batch 2 - Animals
      { turkish: 'kedi', english: 'cat', category: 'animals', difficulty: 'easy', pronunciation: 'ke-Dİ' },
      { turkish: 'köpek', english: 'dog', category: 'animals', difficulty: 'easy', pronunciation: 'kö-PEK' },
      { turkish: 'kuş', english: 'bird', category: 'animals', difficulty: 'easy', pronunciation: 'KUŞH' },
      { turkish: 'balık', english: 'fish', category: 'animals', difficulty: 'easy', pronunciation: 'ba-LUK' },
      { turkish: 'at', english: 'horse', category: 'animals', difficulty: 'easy', pronunciation: 'AT' },
      { turkish: 'inek', english: 'cow', category: 'animals', difficulty: 'medium', pronunciation: 'i-NEK' },
      { turkish: 'koyun', english: 'sheep', category: 'animals', difficulty: 'medium', pronunciation: 'ko-YUN' },
      { turkish: 'tavuk', english: 'chicken', category: 'animals', difficulty: 'medium', pronunciation: 'ta-VUK' },
      { turkish: 'fare', english: 'mouse', category: 'animals', difficulty: 'easy', pronunciation: 'fa-RE' },
      { turkish: 'kartal', english: 'eagle', category: 'animals', difficulty: 'hard', pronunciation: 'kar-TAL' },

      // Batch 3 - Food
      { turkish: 'ekmek', english: 'bread', category: 'food', difficulty: 'easy', pronunciation: 'ek-MEK' },
      { turkish: 'su', english: 'water', category: 'food', difficulty: 'easy', pronunciation: 'SU' },
      { turkish: 'çay', english: 'tea', category: 'food', difficulty: 'easy', pronunciation: 'ÇHAY' },
      { turkish: 'kahve', english: 'coffee', category: 'food', difficulty: 'easy', pronunciation: 'kah-VE' },
      { turkish: 'elma', english: 'apple', category: 'food', difficulty: 'easy', pronunciation: 'el-MA' },
      { turkish: 'portakal', english: 'orange', category: 'food', difficulty: 'medium', pronunciation: 'por-ta-KAL' },
      { turkish: 'muz', english: 'banana', category: 'food', difficulty: 'easy', pronunciation: 'MUZ' },
      { turkish: 'domates', english: 'tomato', category: 'food', difficulty: 'medium', pronunciation: 'do-ma-TES' },
      { turkish: 'patates', english: 'potato', category: 'food', difficulty: 'medium', pronunciation: 'pa-ta-TES' },
      { turkish: 'peynir', english: 'cheese', category: 'food', difficulty: 'medium', pronunciation: 'pey-NİR' },

      // Batch 4 - Colors
      { turkish: 'kırmızı', english: 'red', category: 'colors', difficulty: 'medium', pronunciation: 'kır-mı-ZI' },
      { turkish: 'mavi', english: 'blue', category: 'colors', difficulty: 'easy', pronunciation: 'ma-Vİ' },
      { turkish: 'yeşil', english: 'green', category: 'colors', difficulty: 'medium', pronunciation: 'ye-ŞHIL' },
      { turkish: 'sarı', english: 'yellow', category: 'colors', difficulty: 'easy', pronunciation: 'sa-RI' },
      { turkish: 'beyaz', english: 'white', category: 'colors', difficulty: 'medium', pronunciation: 'be-YAZ' },
      { turkish: 'siyah', english: 'black', category: 'colors', difficulty: 'medium', pronunciation: 'si-YAH' },
      { turkish: 'pembe', english: 'pink', category: 'colors', difficulty: 'medium', pronunciation: 'pem-BE' },
      { turkish: 'mor', english: 'purple', category: 'colors', difficulty: 'easy', pronunciation: 'MOR' },
      { turkish: 'turuncu', english: 'orange', category: 'colors', difficulty: 'hard', pronunciation: 'tu-run-CU' },
      { turkish: 'gri', english: 'gray', category: 'colors', difficulty: 'easy', pronunciation: 'GRİ' },

      // Batch 5 - Family
      { turkish: 'anne', english: 'mother', category: 'family', difficulty: 'easy', pronunciation: 'an-NE' },
      { turkish: 'baba', english: 'father', category: 'family', difficulty: 'easy', pronunciation: 'ba-BA' },
      { turkish: 'kardeş', english: 'sibling', category: 'family', difficulty: 'medium', pronunciation: 'kar-DEŞH' },
      { turkish: 'çocuk', english: 'child', category: 'family', difficulty: 'medium', pronunciation: 'çho-CUK' },
      { turkish: 'dede', english: 'grandfather', category: 'family', difficulty: 'easy', pronunciation: 'de-DE' },
      { turkish: 'nine', english: 'grandmother', category: 'family', difficulty: 'easy', pronunciation: 'ni-NE' },
      { turkish: 'amca', english: 'uncle', category: 'family', difficulty: 'medium', pronunciation: 'am-CA' },
      { turkish: 'teyze', english: 'aunt', category: 'family', difficulty: 'medium', pronunciation: 'tey-ZE' },
      { turkish: 'kuzen', english: 'cousin', category: 'family', difficulty: 'medium', pronunciation: 'ku-ZEN' },
      { turkish: 'aile', english: 'family', category: 'family', difficulty: 'medium', pronunciation: 'a-İ-le' }
    ];

    const startIndex = (batchNumber - 1) * 10;
    return allFreshVocab.slice(startIndex, startIndex + 10);
  };

  // Initialize cards with SRS data - ensure 10 cards minimum
  useEffect(() => {
    let allVocab = [...vocabularyItems];

    // Ensure we have at least 10 vocabulary items
    while (allVocab.length < 10) {
      const freshVocab = generateFreshVocabulary(1);
      const needed = 10 - allVocab.length;
      allVocab = [...allVocab, ...freshVocab.slice(0, needed)];
    }

    const initialCards = allVocab.slice(0, 10).map((item, index) => ({
      ...item,
      id: `${unitId}-${index}`,
      repetitionLevel: 0,
      nextReview: new Date(),
      easeFactor: 2.5,
      interval: 1,
    }));

    setCards(initialCards);
    setSessionStartTime(new Date());
    setCardStartTime(new Date());
    setShowLoadMore(true);
  }, [vocabularyItems, unitId]);

  // Load more vocabulary batches
  const loadMoreVocabulary = () => {
    if (currentBatch < maxBatches) {
      const newVocab = generateFreshVocabulary(currentBatch + 1);
      const newCards = newVocab.map((item, index) => ({
        ...item,
        id: `${unitId}-batch${currentBatch + 1}-${index}`,
        repetitionLevel: 0,
        nextReview: new Date(),
        easeFactor: 2.5,
        interval: 1,
      }));

      // Replace current cards with new batch (don't append)
      setCards(newCards);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setShowAnswer(false);
      setAttempts(0);
      setCardStartTime(new Date());
      setSessionComplete(false);

      setCurrentBatch(currentBatch + 1);
      setCompletedBatches([...completedBatches, currentBatch]);

      if (currentBatch + 1 >= maxBatches) {
        setShowLoadMore(false);
      }
    }
  };

  const currentCard = cards[currentCardIndex];

  // SRS Algorithm (SuperMemo SM-2)
  const updateCardSRS = (card: FlashcardState, quality: number) => {
    let newEaseFactor = card.easeFactor;
    let newInterval = card.interval;
    let newRepetitionLevel = card.repetitionLevel;

    if (quality >= 3) {
      if (newRepetitionLevel === 0) {
        newInterval = 1;
      } else if (newRepetitionLevel === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(card.interval * card.easeFactor);
      }
      newRepetitionLevel += 1;
    } else {
      newRepetitionLevel = 0;
      newInterval = 1;
    }

    newEaseFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEaseFactor < 1.3) newEaseFactor = 1.3;

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    return {
      ...card,
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitionLevel: newRepetitionLevel,
      nextReview,
    };
  };

  const handleCardResponse = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!currentCard) return;

    const timeSpent = (new Date().getTime() - cardStartTime.getTime()) / 1000;
    const quality = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 3 : 1;

    // Update SRS data
    const updatedCard = updateCardSRS(currentCard, quality);
    const updatedCards = [...cards];
    updatedCards[currentCardIndex] = updatedCard;
    setCards(updatedCards);

    // Record result
    const result: FlashcardResult = {
      vocabularyId: currentCard.id,
      difficulty,
      attempts: attempts + 1,
      timeSpent,
    };
    setResults([...results, result]);

    // Move to next card or complete session
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setShowAnswer(false);
      setAttempts(0);
      setCardStartTime(new Date());

      // Auto-play audio for next card if enabled
      if (autoPlayAudio) {
        setTimeout(() => {
          playAudio();
        }, 500);
      }
    } else {
      // Complete the current batch
      setSessionComplete(true);
    }
  };

  const handleSwipe = (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    
    if (info.offset.x > swipeThreshold) {
      // Swipe right - Easy
      handleCardResponse('easy');
    } else if (info.offset.x < -swipeThreshold) {
      // Swipe left - Hard
      handleCardResponse('hard');
    }
  };

  const playAudio = () => {
    if (currentCard?.turkish && 'speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(currentCard.turkish);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      console.log('Playing audio for:', currentCard.turkish); // Debug log
      speechSynthesis.speak(utterance);
    } else {
      console.log('Speech synthesis not available or no Turkish text'); // Debug log
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    if (!showAnswer) {
      setShowAnswer(true);
      setAttempts(attempts + 1);
    }
  };

  // Auto-play audio when card changes (if enabled)
  useEffect(() => {
    if (autoPlayAudio && currentCard && !isFlipped) {
      const timer = setTimeout(() => {
        playAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentCardIndex, autoPlayAudio, currentCard, isFlipped]);

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading flashcards...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Audio Settings */}
      <div className="mb-4 flex justify-center">
        <div className="bg-gray-100 rounded-lg p-2 flex items-center space-x-3">
          <span className="text-sm text-gray-600">Auto-play audio:</span>
          <button
            onClick={() => setAutoPlayAudio(!autoPlayAudio)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              autoPlayAudio
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            {autoPlayAudio ? '🔊 ON' : '🔇 OFF'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Card {currentCardIndex + 1} of {cards.length}</span>
          <span>{Math.round(((currentCardIndex + 1) / cards.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500">
            Batch {currentBatch + 1} of {maxBatches + 1} | {completedBatches.length} batches completed
          </span>
        </div>
      </div>

      {/* Flashcard */}
      <motion.div
        className="relative h-64 mb-6"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleSwipe}
        whileDrag={{ scale: 1.05 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCardIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <div
              className={`w-full h-full rounded-lg shadow-lg cursor-pointer transform transition-transform duration-500 ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              onClick={flipCard}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front of card */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 flex flex-col items-center justify-center p-6 backface-hidden">
                <div className="text-center mb-6">
                  <div className="text-sm font-medium text-blue-600 mb-2">TURKISH WORD</div>
                  <div className="text-4xl font-bold text-blue-900 mb-2">
                    {currentCard.turkish}
                  </div>
                  {currentCard.pronunciation && (
                    <div className="text-lg text-blue-700 italic">
                      ({currentCard.pronunciation})
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio();
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg flex items-center space-x-2"
                >
                  <span className="text-xl">🔊</span>
                  <span className="font-medium">Hear Pronunciation</span>
                </button>

                <div className="mt-4 text-sm text-blue-600 text-center font-medium">
                  👆 Tap card to see English meaning
                </div>
              </div>

              {/* Back of card */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 flex flex-col items-center justify-center p-6 rotate-y-180 backface-hidden">
                <div className="text-center mb-6">
                  <div className="text-sm font-medium text-green-600 mb-2">ENGLISH MEANING</div>
                  <div className="text-4xl font-bold text-green-900 mb-4">
                    {currentCard.english}
                  </div>

                  <div className="text-lg text-green-700 mb-4">
                    Turkish: <span className="font-semibold">{currentCard.turkish}</span>
                  </div>

                  {currentCard.example && (
                    <div className="text-sm text-green-600 text-center italic bg-green-50 p-3 rounded-lg">
                      Example: "{currentCard.example}"
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio();
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
                >
                  🔊 Hear Turkish Again
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Response Buttons */}
      {showAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center space-x-4"
        >
          <button
            onClick={() => handleCardResponse('hard')}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Hard 😰
          </button>
          <button
            onClick={() => handleCardResponse('medium')}
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Medium 🤔
          </button>
          <button
            onClick={() => handleCardResponse('easy')}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Easy 😊
          </button>
        </motion.div>
      )}



      {/* Session Complete */}
      {sessionComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-8 p-6 bg-green-50 rounded-lg border-2 border-green-200"
        >
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Batch Complete!</h2>
          <p className="text-green-700 mb-4">
            You've completed {cards.length} flashcards in Batch {currentBatch + 1}!
          </p>
          {completedBatches.length > 0 && (
            <p className="text-sm text-green-600 mb-4">
              Total completed: {completedBatches.length + 1} vocabulary batches
            </p>
          )}

          <div className="flex flex-col space-y-3">
            {/* Load More Button */}
            {currentBatch < maxBatches && (
              <button
                onClick={loadMoreVocabulary}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                📚 Load Next Batch ({currentBatch + 2}/{maxBatches + 1})
              </button>
            )}

            {/* Continue to Other Exercises */}
            <button
              onClick={() => onComplete(results)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              ✅ Continue to Other Exercises
            </button>

            {/* Replay Current Batch */}
            <button
              onClick={() => {
                setCurrentCardIndex(0);
                setIsFlipped(false);
                setShowAnswer(false);
                setAttempts(0);
                setSessionComplete(false);
                setCardStartTime(new Date());
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Replay This Batch
            </button>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>🔊 {autoPlayAudio ? 'Audio plays automatically' : 'Click audio button to hear pronunciation'}</p>
        <p>Swipe right for easy, left for hard, or use buttons</p>
        <p>Your progress is saved automatically</p>
        {currentBatch > 0 && (
          <p className="text-purple-600 font-medium">Batch {currentBatch + 1} - Fresh vocabulary!</p>
        )}
      </div>
    </div>
  );
}
