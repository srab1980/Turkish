'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MiniGame {
  id: string;
  title: string;
  titleTurkish: string;
  type: 'crossword' | 'word_search' | 'memory_match' | 'riddle' | 'puzzle';
  difficulty: number;
  timeLimit?: number;
  instructions: string;
  data: any;
}

interface CrosswordData {
  grid: string[][];
  clues: {
    across: { number: number; clue: string; answer: string; startRow: number; startCol: number }[];
    down: { number: number; clue: string; answer: string; startRow: number; startCol: number }[];
  };
}

interface WordSearchData {
  grid: string[][];
  words: { word: string; translation: string; found: boolean }[];
}

interface MemoryMatchData {
  pairs: { id: string; turkish: string; english: string; image?: string }[];
  additionalBatches?: { id: string; turkish: string; english: string; image?: string }[][];
}

interface EglenelimOgrenelimGamesProps {
  games: MiniGame[];
  onComplete: (gameId: string, score: number, timeSpent: number) => void;
  lessonId?: string;
}

export default function EglenelimOgrenelimGames({ games, onComplete, lessonId }: EglenelimOgrenelimGamesProps) {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [gameState, setGameState] = useState<any>({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [gameStartTime] = useState(new Date());
  const [gameComplete, setGameComplete] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [maxBatches] = useState(5);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const currentGame = games[currentGameIndex];

  useEffect(() => {
    if (currentGame?.timeLimit) {
      setTimeLeft(currentGame.timeLimit);
    }
    initializeGame();
  }, [currentGameIndex, currentGame]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      completeGame();
    }
  }, [timeLeft]);

  const initializeGame = () => {
    if (!currentGame) return;

    switch (currentGame.type) {
      case 'crossword':
        initializeCrossword();
        break;
      case 'word_search':
        initializeWordSearch();
        break;
      case 'memory_match':
        initializeMemoryMatch();
        break;
      default:
        setGameState({});
    }
  };

  const initializeCrossword = () => {
    const data = currentGame.data as CrosswordData;
    const userGrid = data.grid.map(row => row.map(cell => cell === '#' ? '#' : ''));
    setGameState({ userGrid, selectedCell: null });
  };

  const initializeWordSearch = () => {
    const data = currentGame.data as WordSearchData;
    setGameState({ 
      selectedCells: [], 
      foundWords: [],
      isSelecting: false,
      startCell: null 
    });
  };

  const initializeMemoryMatch = () => {
    const data = currentGame.data as MemoryMatchData;

    // Ensure we have at least 6 pairs (12 cards)
    let pairs = [...data.pairs];
    while (pairs.length < 6) {
      const additionalPairs = generateFreshMemoryPairs(lessonId || 'default', pairs.length);
      pairs = [...pairs, ...additionalPairs];
    }

    // Take only first 6 pairs for 12 cards
    const gamePairs = pairs.slice(0, 6);

    const cards = [...gamePairs, ...gamePairs].map((item, index) => ({
      id: `${item.id}-${index}`,
      content: index < gamePairs.length ? item.turkish : item.english,
      type: index < gamePairs.length ? 'turkish' : 'english',
      pairId: item.id,
      flipped: false,
      matched: false,
    })).sort(() => Math.random() - 0.5);

    setGameState({
      cards,
      flippedCards: [],
      matches: 0,
      totalPairs: gamePairs.length
    });

    setShowLoadMore(true);
  };

  // Generate fresh memory pairs for additional batches
  const generateFreshMemoryPairs = (lessonId: string, startIndex: number) => {
    const freshPairs = [
      { id: `fresh-${startIndex + 1}`, turkish: 'güneş', english: 'sun' },
      { id: `fresh-${startIndex + 2}`, turkish: 'ay', english: 'moon' },
      { id: `fresh-${startIndex + 3}`, turkish: 'yıldız', english: 'star' },
      { id: `fresh-${startIndex + 4}`, turkish: 'bulut', english: 'cloud' },
      { id: `fresh-${startIndex + 5}`, turkish: 'rüzgar', english: 'wind' },
      { id: `fresh-${startIndex + 6}`, turkish: 'yağmur', english: 'rain' }
    ];

    return freshPairs;
  };

  const loadMoreMemoryCards = () => {
    if (currentBatch < maxBatches) {
      const newPairs = generateFreshMemoryPairs(lessonId || 'default', (currentBatch + 1) * 6);
      initializeMemoryMatch();
      setCurrentBatch(currentBatch + 1);

      if (currentBatch + 1 >= maxBatches) {
        setShowLoadMore(false);
      }
    }
  };

  const completeGame = () => {
    const timeSpent = (new Date().getTime() - gameStartTime.getTime()) / 1000;
    setGameComplete(true);
    onComplete(currentGame.id, score, timeSpent);
  };

  const nextGame = () => {
    if (currentGameIndex < games.length - 1) {
      setCurrentGameIndex(currentGameIndex + 1);
      setScore(0);
      setGameComplete(false);
      setShowInstructions(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGameIcon = (type: string) => {
    const icons = {
      crossword: '📝',
      word_search: '🔍',
      memory_match: '🧠',
      riddle: '🤔',
      puzzle: '🧩',
    };
    return icons[type as keyof typeof icons] || '🎮';
  };

  // Crossword Component
  const renderCrossword = () => {
    const data = currentGame.data as CrosswordData;
    const { userGrid } = gameState;

    // Safety check - if userGrid is not initialized yet, return loading state
    if (!userGrid || !data || !data.grid) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">📝</div>
            <div className="text-lg text-gray-600">Preparing crossword...</div>
          </div>
        </div>
      );
    }

    const handleCellClick = (row: number, col: number) => {
      if (data.grid[row][col] === '#') return;
      setGameState({ ...gameState, selectedCell: { row, col } });
    };

    const handleInputChange = (row: number, col: number, value: string) => {
      const newGrid = [...userGrid];
      newGrid[row][col] = value.toUpperCase();
      setGameState({ ...gameState, userGrid: newGrid });
      
      // Check if crossword is complete
      checkCrosswordComplete(newGrid);
    };

    const checkCrosswordComplete = (grid: string[][]) => {
      let correct = 0;
      let total = 0;
      
      [...data.clues.across, ...data.clues.down].forEach(clue => {
        const isAcross = data.clues.across.includes(clue);
        for (let i = 0; i < clue.answer.length; i++) {
          const row = isAcross ? clue.startRow : clue.startRow + i;
          const col = isAcross ? clue.startCol + i : clue.startCol;
          total++;
          if (grid[row][col] === clue.answer[i].toUpperCase()) {
            correct++;
          }
        }
      });
      
      setScore(Math.round((correct / total) * 100));
      if (correct === total) {
        completeGame();
      }
    };

    return (
      <div className="space-y-6">
        <div className="grid gap-1 justify-center" style={{ gridTemplateColumns: `repeat(${data.grid[0].length}, 1fr)` }}>
          {data.grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-8 h-8 border border-gray-300 flex items-center justify-center text-sm font-bold cursor-pointer ${
                  cell === '#' ? 'bg-gray-800' : 'bg-white hover:bg-blue-50'
                }`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell !== '#' && (
                  <input
                    type="text"
                    maxLength={1}
                    value={userGrid[rowIndex][colIndex] || ''}
                    onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                    className="w-full h-full text-center border-none outline-none bg-transparent"
                  />
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Across (Yatay)</h4>
            {data.clues.across.map(clue => (
              <div key={clue.number} className="text-sm mb-1">
                <span className="font-medium">{clue.number}.</span> {clue.clue}
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Down (Dikey)</h4>
            {data.clues.down.map(clue => (
              <div key={clue.number} className="text-sm mb-1">
                <span className="font-medium">{clue.number}.</span> {clue.clue}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Memory Match Component
  const renderMemoryMatch = () => {
    const { cards = [], flippedCards = [], matches = 0 } = gameState;
    const data = currentGame.data as MemoryMatchData;

    // Safety check - if cards are not initialized yet, return loading state
    if (!cards || cards.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <div className="text-lg text-gray-600">Preparing memory game...</div>
          </div>
        </div>
      );
    }

    const handleCardClick = (cardIndex: number) => {
      if (flippedCards.length === 2 || cards[cardIndex].flipped || cards[cardIndex].matched) return;

      const newCards = [...cards];
      newCards[cardIndex].flipped = true;
      const newFlippedCards = [...flippedCards, cardIndex];

      if (newFlippedCards.length === 2) {
        const [first, second] = newFlippedCards;
        if (newCards[first].pairId === newCards[second].pairId) {
          // Match found
          newCards[first].matched = true;
          newCards[second].matched = true;
          const newMatches = matches + 1;
          setGameState({ cards: newCards, flippedCards: [], matches: newMatches });
          setScore(score + 10);
          
          if (newMatches === data.pairs.length) {
            completeGame();
          }
        } else {
          // No match, flip back after delay
          setGameState({ ...gameState, cards: newCards, flippedCards: newFlippedCards });
          setTimeout(() => {
            newCards[first].flipped = false;
            newCards[second].flipped = false;
            setGameState({ cards: newCards, flippedCards: [], matches });
          }, 1000);
        }
      } else {
        setGameState({ ...gameState, cards: newCards, flippedCards: newFlippedCards });
      }
    };

    return (
      <div className="grid grid-cols-4 md:grid-cols-6 gap-4 justify-center">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className={`aspect-square rounded-lg border-2 cursor-pointer flex items-center justify-center text-sm font-semibold ${
              card.flipped || card.matched
                ? card.type === 'turkish' 
                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                  : 'bg-green-100 border-green-300 text-green-800'
                : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
            }`}
            onClick={() => handleCardClick(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {card.flipped || card.matched ? card.content : '?'}
          </motion.div>
        ))}
      </div>
    );
  };

  if (!currentGame) {
    return (
      <div className="text-center p-8 text-gray-500">
        No games available
      </div>
    );
  }

  if (gameComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-green-50 rounded-lg border-2 border-green-200"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-800 mb-4">Oyun Tamamlandı! (Game Complete!)</h2>
        <div className="text-lg text-green-700 mb-6">
          <p>Score: {score} points</p>
          <p>Game: {currentGame.titleTurkish}</p>
        </div>
        {currentGameIndex < games.length - 1 && (
          <button
            onClick={nextGame}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next Game
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Eğlenelim Öğrenelim! (Let's Have Fun Learning!)
        </h1>
        <div className="flex justify-center items-center space-x-4 text-lg">
          <span className="text-4xl">{getGameIcon(currentGame.type)}</span>
          <div>
            <h2 className="font-semibold text-gray-800">{currentGame.titleTurkish}</h2>
            <p className="text-gray-600">{currentGame.title}</p>
          </div>
        </div>
        <div className="flex justify-center space-x-6 text-sm text-gray-500 mt-2">
          <span>Game {currentGameIndex + 1}/{games.length}</span>
          <span>Score: {score}</span>
          <span>Difficulty: {'⭐'.repeat(currentGame.difficulty)}</span>
          {timeLeft !== null && (
            <span className={timeLeft < 30 ? 'text-red-600 font-bold' : ''}>
              ⏰ {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      {/* Instructions */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
                <p className="text-blue-700">{currentGame.instructions}</p>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-blue-600 hover:text-blue-800 ml-4"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Content */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        {currentGame.type === 'crossword' && renderCrossword()}
        {currentGame.type === 'memory_match' && renderMemoryMatch()}
        {/* Add other game types as needed */}
      </div>

      {/* Game Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setShowInstructions(true)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          📋 Show Instructions
        </button>
        
        <div className="flex space-x-4">
          <button
            onClick={completeGame}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Give Up
          </button>
          {currentGame.type !== 'crossword' && currentGame.type !== 'memory_match' && (
            <button
              onClick={completeGame}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Complete Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
