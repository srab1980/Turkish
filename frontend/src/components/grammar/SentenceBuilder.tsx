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
}

export default function SentenceBuilder({ exercises, onComplete }: SentenceBuilderProps) {
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

  const currentExercise = exercises[currentExerciseIndex];

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
          <p>Final Score: {score} points</p>
          <p>Exercises Completed: {exercises.length}</p>
          <p>Total Attempts: {attempts}</p>
          <p>Accuracy: {Math.round((score / (attempts * 10)) * 100)}%</p>
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
          <span>Exercise {currentExerciseIndex + 1}/{exercises.length}</span>
          <span>Score: {score}</span>
          <span>Grammar: {currentExercise.grammarFocus}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` }}
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
                          >
                            {tile.word}
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
                        title={tile.translation}
                      >
                        {tile.word}
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
          onClick={checkSentence}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Check Sentence
        </button>
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
    </div>
  );
}
