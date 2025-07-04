'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface ScrambleWord {
  id: string;
  turkish: string;
  english: string;
  hint?: string;
  audioUrl?: string;
}

interface WordScrambleGameProps {
  words: ScrambleWord[];
  onComplete: (score: number, timeSpent: number) => void;
  gameTitle: string;
}

interface Letter {
  id: string;
  letter: string;
  originalIndex: number;
}

export default function WordScrambleGame({ words, onComplete, gameTitle }: WordScrambleGameProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<Letter[]>([]);
  const [arrangedLetters, setArrangedLetters] = useState<Letter[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameStartTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);

  const currentWord = words[currentWordIndex];

  useEffect(() => {
    if (currentWord) {
      initializeWord(currentWord.turkish);
    }
  }, [currentWordIndex, currentWord]);

  const initializeWord = (word: string) => {
    const letters: Letter[] = word.split('').map((letter, index) => ({
      id: `letter-${index}`,
      letter: letter.toLowerCase(),
      originalIndex: index,
    }));

    // Scramble the letters
    const scrambled = [...letters].sort(() => Math.random() - 0.5);
    setScrambledLetters(scrambled);
    setArrangedLetters([]);
    setShowHint(false);
    setShowFeedback(null);
  };

  const playAudio = (audioUrl?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === 'scrambled' && destination.droppableId === 'arranged') {
      // Move from scrambled to arranged
      const newScrambled = Array.from(scrambledLetters);
      const newArranged = Array.from(arrangedLetters);
      const [movedLetter] = newScrambled.splice(source.index, 1);
      newArranged.splice(destination.index, 0, movedLetter);

      setScrambledLetters(newScrambled);
      setArrangedLetters(newArranged);
    } else if (source.droppableId === 'arranged' && destination.droppableId === 'scrambled') {
      // Move from arranged to scrambled
      const newArranged = Array.from(arrangedLetters);
      const newScrambled = Array.from(scrambledLetters);
      const [movedLetter] = newArranged.splice(source.index, 1);
      newScrambled.splice(destination.index, 0, movedLetter);

      setArrangedLetters(newArranged);
      setScrambledLetters(newScrambled);
    } else if (source.droppableId === destination.droppableId) {
      // Reorder within the same list
      const list = source.droppableId === 'scrambled' ? scrambledLetters : arrangedLetters;
      const newList = Array.from(list);
      const [movedLetter] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, movedLetter);

      if (source.droppableId === 'scrambled') {
        setScrambledLetters(newList);
      } else {
        setArrangedLetters(newList);
      }
    }
  };

  const checkAnswer = () => {
    setAttempts(attempts + 1);
    const arrangedWord = arrangedLetters.map(l => l.letter).join('');
    const correctWord = currentWord.turkish.toLowerCase();

    if (arrangedWord === correctWord) {
      const points = showHint ? 5 : 10;
      setScore(score + points);
      setStreak(streak + 1);
      setShowFeedback('correct');
      playAudio('/audio/success.mp3');

      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
        } else {
          setGameComplete(true);
          const timeSpent = (new Date().getTime() - gameStartTime.getTime()) / 1000;
          onComplete(score + points, timeSpent);
        }
      }, 2000);
    } else {
      setStreak(0);
      setShowFeedback('incorrect');
      playAudio('/audio/error.mp3');
      setTimeout(() => setShowFeedback(null), 2000);
    }
  };

  const shuffleScrambled = () => {
    setScrambledLetters([...scrambledLetters].sort(() => Math.random() - 0.5));
  };

  const clearArranged = () => {
    setScrambledLetters([...scrambledLetters, ...arrangedLetters]);
    setArrangedLetters([]);
  };

  const skipWord = () => {
    setStreak(0);
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setGameComplete(true);
      const timeSpent = (new Date().getTime() - gameStartTime.getTime()) / 1000;
      onComplete(score, timeSpent);
    }
  };

  if (gameComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-green-50 rounded-lg border-2 border-green-200"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-800 mb-4">Oyun Bitti! (Game Over!)</h2>
        <div className="text-lg text-green-700 mb-6">
          <p>Final Score: {score} points</p>
          <p>Words Completed: {words.length}</p>
          <p>Total Attempts: {attempts}</p>
        </div>
      </motion.div>
    );
  }

  if (!currentWord) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{gameTitle}</h1>
        <div className="flex justify-center space-x-6 text-sm text-gray-600">
          <span>Score: {score}</span>
          <span>Word: {currentWordIndex + 1}/{words.length}</span>
          <span>Streak: {streak} 🔥</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(currentWordIndex / words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Word Info */}
      <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-lg font-semibold text-blue-800 mb-2">
          English: {currentWord.english}
        </div>
        {showHint && currentWord.hint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-blue-600 italic"
          >
            Hint: {currentWord.hint}
          </motion.div>
        )}
        {currentWord.audioUrl && (
          <button
            onClick={() => playAudio(currentWord.audioUrl)}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            🔊 Listen
          </button>
        )}
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
            {showFeedback === 'correct' ? '✅ Mükemmel! (Perfect!)' : '❌ Tekrar dene! (Try again!)'}
          </motion.div>
        )}
      </AnimatePresence>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Arranged Letters Area */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-center mb-3">Your Answer:</h3>
          <Droppable droppableId="arranged" direction="horizontal">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`min-h-16 p-4 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                {arrangedLetters.map((letter, index) => (
                  <Draggable key={letter.id} draggableId={letter.id} index={index}>
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`w-12 h-12 bg-white border-2 border-blue-300 rounded-lg flex items-center justify-center font-bold text-lg cursor-move transition-all ${
                          snapshot.isDragging ? 'shadow-lg transform rotate-3' : 'hover:shadow-md'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileDrag={{ scale: 1.1, rotate: 5 }}
                      >
                        {letter.letter.toUpperCase()}
                      </motion.div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {arrangedLetters.length === 0 && (
                  <div className="text-gray-400 text-center">
                    Drag letters here to form the word
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </div>

        {/* Scrambled Letters */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-center mb-3">Available Letters:</h3>
          <Droppable droppableId="scrambled" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="min-h-16 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg flex items-center justify-center gap-2 flex-wrap"
              >
                {scrambledLetters.map((letter, index) => (
                  <Draggable key={letter.id} draggableId={letter.id} index={index}>
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`w-12 h-12 bg-yellow-200 border-2 border-yellow-400 rounded-lg flex items-center justify-center font-bold text-lg cursor-move transition-all ${
                          snapshot.isDragging ? 'shadow-lg transform rotate-3' : 'hover:shadow-md'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileDrag={{ scale: 1.1, rotate: 5 }}
                      >
                        {letter.letter.toUpperCase()}
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

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={checkAnswer}
          disabled={arrangedLetters.length !== currentWord.turkish.length}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Check Answer
        </button>
        <button
          onClick={clearArranged}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={shuffleScrambled}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Shuffle
        </button>
      </div>

      {/* Helper Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setShowHint(true)}
          disabled={showHint}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
        >
          💡 Hint (-5 points)
        </button>
        <button
          onClick={skipWord}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          ⏭️ Skip Word
        </button>
      </div>
    </div>
  );
}
