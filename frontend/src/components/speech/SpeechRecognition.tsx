'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PronunciationExercise {
  id: string;
  text: string;
  translation: string;
  audioUrl?: string;
  difficulty: number;
  phonetic?: string;
  tips?: string[];
}

interface SpeechRecognitionProps {
  exercises: PronunciationExercise[];
  onComplete: (score: number, attempts: number) => void;
  language?: string;
}

interface RecognitionResult {
  transcript: string;
  confidence: number;
  accuracy: number;
  feedback: string;
}

export default function SpeechRecognition({ 
  exercises, 
  onComplete, 
  language = 'tr-TR' 
}: SpeechRecognitionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);

  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language;
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        const confidence = event.results[0][0].confidence;
        
        const accuracy = calculateAccuracy(transcript, currentExercise.text.toLowerCase());
        const feedback = generateFeedback(accuracy, confidence);
        
        setResult({
          transcript,
          confidence,
          accuracy,
          feedback
        });

        setAttempts(attempts + 1);
        
        if (accuracy >= 80) {
          setScore(score + Math.round(accuracy));
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        setIsRecording(false);
        stopAudioLevelMonitoring();
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [currentExerciseIndex, attempts, score, language]);

  const calculateAccuracy = (spoken: string, target: string): number => {
    // Simple Levenshtein distance-based accuracy calculation
    const spokenWords = spoken.split(' ');
    const targetWords = target.split(' ');
    
    let matches = 0;
    const maxLength = Math.max(spokenWords.length, targetWords.length);
    
    for (let i = 0; i < Math.min(spokenWords.length, targetWords.length); i++) {
      if (spokenWords[i] === targetWords[i]) {
        matches++;
      } else if (spokenWords[i] && targetWords[i] && 
                 spokenWords[i].includes(targetWords[i]) || 
                 targetWords[i].includes(spokenWords[i])) {
        matches += 0.5;
      }
    }
    
    return Math.round((matches / maxLength) * 100);
  };

  const generateFeedback = (accuracy: number, confidence: number): string => {
    if (accuracy >= 90 && confidence >= 0.8) {
      return "Mükemmel! (Perfect!) Your pronunciation is excellent!";
    } else if (accuracy >= 80 && confidence >= 0.7) {
      return "Çok iyi! (Very good!) Great pronunciation!";
    } else if (accuracy >= 70 && confidence >= 0.6) {
      return "İyi! (Good!) Keep practicing to improve clarity.";
    } else if (accuracy >= 50) {
      return "Fena değil! (Not bad!) Try speaking more clearly.";
    } else {
      return "Tekrar dene! (Try again!) Listen to the example and repeat.";
    }
  };

  const startAudioLevelMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      microphoneRef.current.connect(analyserRef.current);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
          setAudioLevel(average);
          
          if (isRecording) {
            animationRef.current = requestAnimationFrame(updateAudioLevel);
          }
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAudioLevelMonitoring = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  const startRecording = async () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    setResult(null);
    setIsRecording(true);
    await startAudioLevelMonitoring();
    recognition.start();
  };

  const stopRecording = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
    setIsRecording(false);
    stopAudioLevelMonitoring();
  };

  const playExample = () => {
    if (currentExercise.audioUrl) {
      const audio = new Audio(currentExercise.audioUrl);
      audio.play().catch(console.error);
    } else {
      // Fallback to text-to-speech
      const utterance = new SpeechSynthesisUtterance(currentExercise.text);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const nextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setResult(null);
      setShowTips(false);
    } else {
      setGameComplete(true);
      onComplete(score, attempts);
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setResult(null);
      setShowTips(false);
    }
  };

  if (gameComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-green-50 rounded-lg border-2 border-green-200"
      >
        <div className="text-6xl mb-4">🎤</div>
        <h2 className="text-2xl font-bold text-green-800 mb-4">Pronunciation Practice Complete!</h2>
        <div className="text-lg text-green-700 mb-6">
          <p>Final Score: {score} points</p>
          <p>Exercises Completed: {exercises.length}</p>
          <p>Total Attempts: {attempts}</p>
          <p>Average Accuracy: {Math.round(score / exercises.length)}%</p>
        </div>
      </motion.div>
    );
  }

  if (!currentExercise) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pronunciation Practice</h1>
        <div className="flex justify-center space-x-6 text-sm text-gray-600">
          <span>Exercise {currentExerciseIndex + 1}/{exercises.length}</span>
          <span>Score: {score}</span>
          <span>Difficulty: {'⭐'.repeat(currentExercise.difficulty)}</span>
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

      {/* Exercise Content */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{currentExercise.text}</h2>
          {currentExercise.phonetic && (
            <p className="text-lg text-gray-600 mb-2">[{currentExercise.phonetic}]</p>
          )}
          <p className="text-lg text-blue-600 italic">"{currentExercise.translation}"</p>
        </div>

        {/* Audio Visualization */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <motion.div
              className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-4xl ${
                isRecording 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-blue-500 bg-blue-50'
              }`}
              animate={{
                scale: isRecording ? 1 + (audioLevel / 255) * 0.3 : 1,
                borderColor: isRecording ? '#ef4444' : '#3b82f6'
              }}
              transition={{ duration: 0.1 }}
            >
              {isRecording ? '🎤' : '🔊'}
            </motion.div>
            
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-400"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={playExample}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔊 Listen
          </button>
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isListening && !isRecording}
            className={`px-6 py-3 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {isRecording ? '⏹️ Stop' : '🎤 Record'}
          </button>
        </div>

        {/* Recording Status */}
        {isListening && (
          <div className="text-center text-blue-600 mb-4">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🎤 Listening... Speak now!
            </motion.div>
          </div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-6 rounded-lg border-2 mb-6 ${
              result.accuracy >= 80 
                ? 'bg-green-50 border-green-300' 
                : result.accuracy >= 60
                ? 'bg-yellow-50 border-yellow-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold mb-2">
                Accuracy: {result.accuracy}%
              </h3>
              <p className="text-lg mb-2">{result.feedback}</p>
              <div className="text-sm text-gray-600">
                <p>You said: "{result.transcript}"</p>
                <p>Confidence: {Math.round(result.confidence * 100)}%</p>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={startRecording}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={nextExercise}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {currentExerciseIndex === exercises.length - 1 ? 'Complete' : 'Next Exercise'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      {currentExercise.tips && (
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 mb-6">
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-yellow-800">
              💡 Pronunciation Tips
            </h3>
            <span className="text-yellow-600">
              {showTips ? '▼' : '▶'}
            </span>
          </button>
          
          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  {currentExercise.tips.map((tip, index) => (
                    <li key={index} className="text-sm">{tip}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={previousExercise}
          disabled={currentExerciseIndex === 0}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>
        
        <button
          onClick={nextExercise}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {currentExerciseIndex === exercises.length - 1 ? 'Complete' : 'Skip →'}
        </button>
      </div>
    </div>
  );
}
