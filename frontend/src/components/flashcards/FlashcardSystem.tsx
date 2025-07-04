'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { VocabularyItem } from '@/types';

interface FlashcardSystemProps {
  vocabularyItems: VocabularyItem[];
  onComplete: (results: FlashcardResult[]) => void;
  unitId: string;
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

export default function FlashcardSystem({ vocabularyItems, onComplete, unitId }: FlashcardSystemProps) {
  const [cards, setCards] = useState<FlashcardState[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<FlashcardResult[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [cardStartTime, setCardStartTime] = useState<Date>(new Date());
  const [attempts, setAttempts] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Initialize cards with SRS data
  useEffect(() => {
    const initialCards = vocabularyItems.map((item, index) => ({
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
  }, [vocabularyItems, unitId]);

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

    // Move to next card
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setShowAnswer(false);
      setAttempts(0);
      setCardStartTime(new Date());
    } else {
      onComplete([...results, result]);
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
      const utterance = new SpeechSynthesisUtterance(currentCard.turkish);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    if (!showAnswer) {
      setShowAnswer(true);
      setAttempts(attempts + 1);
    }
  };

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading flashcards...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Card {currentCardIndex + 1} of {cards.length}</span>
          <span>{Math.round(((currentCardIndex) / cards.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex) / cards.length) * 100}%` }}
          />
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
              <div className="absolute inset-0 bg-white rounded-lg border-2 border-gray-200 flex flex-col items-center justify-center p-6 backface-hidden">
                <div className="text-3xl font-bold text-gray-800 mb-4 text-center">
                  {currentCard.turkish}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio();
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
                >
                  🔊 Play Audio
                </button>
                <div className="mt-4 text-sm text-gray-500 text-center">
                  Tap to reveal meaning
                </div>
              </div>

              {/* Back of card */}
              <div className="absolute inset-0 bg-green-50 rounded-lg border-2 border-green-200 flex flex-col items-center justify-center p-6 rotate-y-180 backface-hidden">
                <div className="text-2xl font-semibold text-green-800 mb-2 text-center">
                  {currentCard.english}
                </div>
                {currentCard.example && (
                  <div className="text-sm text-gray-600 text-center italic mt-2">
                    "{currentCard.example}"
                  </div>
                )}
                {currentCard.pronunciation && (
                  <div className="text-sm text-gray-500 text-center mt-2">
                    [{currentCard.pronunciation}]
                  </div>
                )}
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

      {/* Instructions */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Swipe right for easy, left for hard, or use buttons</p>
        <p>Your progress is saved automatically</p>
      </div>
    </div>
  );
}
