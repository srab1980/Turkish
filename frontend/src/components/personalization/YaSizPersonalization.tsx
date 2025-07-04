'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalQuestion {
  id: string;
  question: string;
  questionTurkish: string;
  category: 'personal' | 'family' | 'work' | 'hobbies' | 'travel' | 'food';
  difficulty: number;
  suggestedAnswers?: string[];
  grammarFocus?: string;
}

interface UserResponse {
  questionId: string;
  textResponse?: string;
  audioResponse?: Blob;
  timestamp: Date;
  language: 'turkish' | 'english' | 'mixed';
}

interface YaSizPersonalizationProps {
  questions: PersonalQuestion[];
  onComplete: (responses: UserResponse[]) => void;
  allowAudio?: boolean;
  maxQuestions?: number;
}

export default function YaSizPersonalization({ 
  questions, 
  onComplete, 
  allowAudio = true,
  maxQuestions = 5 
}: YaSizPersonalizationProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [responseType, setResponseType] = useState<'text' | 'audio'>('text');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'turkish' | 'english' | 'mixed'>('turkish');
  const [sessionComplete, setSessionComplete] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const currentQuestion = questions[currentQuestionIndex];
  const questionsToShow = questions.slice(0, maxQuestions);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    }
  };

  const submitResponse = () => {
    if (responseType === 'text' && !textInput.trim()) {
      alert('Please enter your response or switch to audio recording.');
      return;
    }

    if (responseType === 'audio' && !audioBlob) {
      alert('Please record your response or switch to text input.');
      return;
    }

    const response: UserResponse = {
      questionId: currentQuestion.id,
      textResponse: responseType === 'text' ? textInput : undefined,
      audioResponse: responseType === 'audio' ? audioBlob : undefined,
      timestamp: new Date(),
      language: selectedLanguage,
    };

    const newResponses = [...responses, response];
    setResponses(newResponses);

    // Reset for next question
    setTextInput('');
    setAudioBlob(null);
    setShowSuggestions(false);

    if (currentQuestionIndex < questionsToShow.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setSessionComplete(true);
      onComplete(newResponses);
    }
  };

  const skipQuestion = () => {
    if (currentQuestionIndex < questionsToShow.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setSessionComplete(true);
      onComplete(responses);
    }
  };

  const useSuggestion = (suggestion: string) => {
    setTextInput(suggestion);
    setShowSuggestions(false);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      personal: '👤',
      family: '👨‍👩‍👧‍👦',
      work: '💼',
      hobbies: '🎨',
      travel: '✈️',
      food: '🍽️',
    };
    return icons[category as keyof typeof icons] || '💭';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-50 border-blue-200 text-blue-800',
      family: 'bg-green-50 border-green-200 text-green-800',
      work: 'bg-purple-50 border-purple-200 text-purple-800',
      hobbies: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      travel: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      food: 'bg-red-50 border-red-200 text-red-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  if (sessionComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-green-50 rounded-lg border-2 border-green-200"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-800 mb-4">
          Teşekkürler! (Thank you!)
        </h2>
        <p className="text-lg text-green-700 mb-6">
          You've shared {responses.length} personal responses. This will help make your learning experience more relevant and engaging!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <div className="font-semibold text-green-800">Responses Given</div>
            <div className="text-2xl font-bold text-green-600">{responses.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <div className="font-semibold text-green-800">Text Responses</div>
            <div className="text-2xl font-bold text-green-600">
              {responses.filter(r => r.textResponse).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <div className="font-semibold text-green-800">Audio Responses</div>
            <div className="text-2xl font-bold text-green-600">
              {responses.filter(r => r.audioResponse).length}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!currentQuestion) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ya Siz? (What about you?)</h1>
        <p className="text-lg text-gray-600 mb-4">
          Share your personal experiences to make learning more relevant
        </p>
        <div className="flex justify-center space-x-6 text-sm text-gray-500">
          <span>Question {currentQuestionIndex + 1} of {questionsToShow.length}</span>
          <span>Category: {currentQuestion.category}</span>
          <span>Difficulty: {'⭐'.repeat(currentQuestion.difficulty)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / questionsToShow.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className={`p-6 rounded-lg border-2 mb-6 ${getCategoryColor(currentQuestion.category)}`}>
        <div className="flex items-start space-x-4">
          <div className="text-4xl">{getCategoryIcon(currentQuestion.category)}</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">{currentQuestion.questionTurkish}</h2>
            <p className="text-lg italic opacity-90">{currentQuestion.question}</p>
            {currentQuestion.grammarFocus && (
              <div className="mt-2 text-sm opacity-75">
                Grammar focus: {currentQuestion.grammarFocus}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Response Type Selection */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setResponseType('text')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              responseType === 'text'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ✏️ Text Response
          </button>
          {allowAudio && (
            <button
              onClick={() => setResponseType('audio')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                responseType === 'audio'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎤 Audio Response
            </button>
          )}
        </div>
      </div>

      {/* Language Selection */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2">
          <span className="text-sm text-gray-600 self-center">Respond in:</span>
          {(['turkish', 'english', 'mixed'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedLanguage === lang
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {lang === 'turkish' ? 'Türkçe' : lang === 'english' ? 'English' : 'Mixed'}
            </button>
          ))}
        </div>
      </div>

      {/* Text Response */}
      {responseType === 'text' && (
        <div className="mb-6">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={`Share your thoughts in ${selectedLanguage === 'turkish' ? 'Turkish' : selectedLanguage === 'english' ? 'English' : 'any language'}...`}
            className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
          />
          
          {/* Suggestions */}
          {currentQuestion.suggestedAnswers && (
            <div className="mt-4">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                💡 {showSuggestions ? 'Hide' : 'Show'} example responses
              </button>
              
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-2"
                  >
                    {currentQuestion.suggestedAnswers.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => useSuggestion(suggestion)}
                        className="block w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Audio Response */}
      {responseType === 'audio' && (
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="mb-4">
              <motion.button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full text-3xl transition-all ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                transition={isRecording ? { duration: 1, repeat: Infinity } : {}}
              >
                {isRecording ? '⏹️' : '🎤'}
              </motion.button>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
            </div>

            {audioBlob && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={playRecording}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  ▶️ Play
                </button>
                <button
                  onClick={() => setAudioBlob(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={skipQuestion}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Skip Question
        </button>
        
        <button
          onClick={submitResponse}
          disabled={
            (responseType === 'text' && !textInput.trim()) ||
            (responseType === 'audio' && !audioBlob)
          }
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {currentQuestionIndex === questionsToShow.length - 1 ? 'Complete' : 'Next Question'}
        </button>
      </div>

      {/* Response Counter */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Responses given: {responses.length} | Remaining: {questionsToShow.length - currentQuestionIndex - 1}
      </div>
    </div>
  );
}
