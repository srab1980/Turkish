'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface PictureMatchingItem {
  id: string;
  turkish: string;
  english: string;
  imageUrl: string;
  audioUrl?: string;
}

interface PictureMatchingGameProps {
  items: PictureMatchingItem[];
  onComplete: (score: number, timeSpent: number) => void;
  gameTitle: string;
}

interface MatchPair {
  wordId: string;
  imageId: string;
  isCorrect: boolean;
}

export default function PictureMatchingGame({ items, onComplete, gameTitle }: PictureMatchingGameProps) {
  const [words, setWords] = useState<PictureMatchingItem[]>([]);
  const [images, setImages] = useState<PictureMatchingItem[]>([]);
  const [matches, setMatches] = useState<MatchPair[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameStartTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [completedMatches, setCompletedMatches] = useState<Set<string>>(new Set());
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    // Shuffle and prepare items
    const shuffledWords = [...items].sort(() => Math.random() - 0.5);
    const shuffledImages = [...items].sort(() => Math.random() - 0.5);
    
    setWords(shuffledWords);
    setImages(shuffledImages);
  }, [items]);

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // Check if dropped on an image
    if (destination.droppableId.startsWith('image-')) {
      const imageId = destination.droppableId.replace('image-', '');
      const wordId = draggableId.replace('word-', '');
      
      handleMatch(wordId, imageId);
    }
  };

  const handleMatch = (wordId: string, imageId: string) => {
    setAttempts(attempts + 1);
    
    const isCorrect = wordId === imageId;
    const newMatch: MatchPair = { wordId, imageId, isCorrect };
    
    setMatches([...matches, newMatch]);

    if (isCorrect) {
      setScore(score + 10);
      setCompletedMatches(new Set([...completedMatches, wordId]));
      setShowFeedback('correct');
      
      // Play success audio
      playAudio('Doğru! Tebrikler!');
      
      // Check if game is complete
      if (completedMatches.size + 1 === items.length) {
        setTimeout(() => {
          setGameComplete(true);
          const timeSpent = (new Date().getTime() - gameStartTime.getTime()) / 1000;
          onComplete(score + 10, timeSpent);
        }, 1500);
      }
    } else {
      setShowFeedback('incorrect');
      playAudio('Yanlış, tekrar dene!');
    }

    // Clear feedback after 2 seconds
    setTimeout(() => setShowFeedback(null), 2000);
  };

  const handleImageClick = (item: PictureMatchingItem) => {
    playAudio(item.turkish);
  };

  const resetGame = () => {
    setMatches([]);
    setScore(0);
    setAttempts(0);
    setCompletedMatches(new Set());
    setGameComplete(false);
    setShowFeedback(null);
    
    // Re-shuffle items
    const shuffledWords = [...items].sort(() => Math.random() - 0.5);
    const shuffledImages = [...items].sort(() => Math.random() - 0.5);
    setWords(shuffledWords);
    setImages(shuffledImages);
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
          <p>Attempts: {attempts}</p>
          <p>Accuracy: {Math.round((score / (attempts * 10)) * 100)}%</p>
        </div>
        <button
          onClick={resetGame}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Play Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{gameTitle}</h1>
        <div className="flex justify-center space-x-6 text-sm text-gray-600">
          <span>Score: {score}</span>
          <span>Completed: {completedMatches.size}/{items.length}</span>
          <span>Attempts: {attempts}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(completedMatches.size / items.length) * 100}%` }}
          />
        </div>
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
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {showFeedback === 'correct' ? '✅ Doğru! (Correct!)' : '❌ Yanlış! (Incorrect!)'}
          </motion.div>
        )}
      </AnimatePresence>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Words Section */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-4 text-center">
              Turkish Words
            </h2>
            <Droppable droppableId="words" direction="vertical">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {words.map((word, index) => (
                    <Draggable
                      key={word.id}
                      draggableId={`word-${word.id}`}
                      index={index}
                      isDragDisabled={completedMatches.has(word.id)}
                    >
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-4 rounded-lg border-2 text-center font-semibold cursor-move transition-all ${
                            completedMatches.has(word.id)
                              ? 'bg-green-200 border-green-400 text-green-800 opacity-50'
                              : snapshot.isDragging
                              ? 'bg-white border-blue-400 shadow-lg transform rotate-2'
                              : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md'
                          }`}
                          whileHover={{ scale: completedMatches.has(word.id) ? 1 : 1.02 }}
                          whileDrag={{ scale: 1.05, rotate: 5 }}
                        >
                          <div className="text-lg">{word.turkish}</div>
                          <div className="text-sm text-gray-600 mt-1">{word.english}</div>
                          <button
                            onClick={() => playAudio(word.turkish)}
                            className="mt-2 text-blue-600 hover:text-blue-800"
                          >
                            🔊
                          </button>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Images Section */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-green-800 mb-4 text-center">
              Pictures
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {images.map((image) => (
                <Droppable key={image.id} droppableId={`image-${image.id}`}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`aspect-square rounded-lg border-2 border-dashed p-2 transition-all ${
                        completedMatches.has(image.id)
                          ? 'border-green-400 bg-green-100'
                          : snapshot.isDraggingOver
                          ? 'border-blue-400 bg-blue-100'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleImageClick(image)}
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <img
                          src={image.imageUrl}
                          alt={image.english}
                          className="w-full h-3/4 object-cover rounded-md mb-2"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                          }}
                        />
                        <div className="text-xs text-gray-600 text-center">
                          {completedMatches.has(image.id) && '✅'}
                        </div>
                      </div>
                      {provided.placeholder}
                    </motion.div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </div>
      </DragDropContext>

      {/* Instructions */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Drag Turkish words to their matching pictures</p>
        <p>Click on pictures to hear pronunciation</p>
      </div>
    </div>
  );
}
