'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  lessonId?: string; // To vary content by lesson
  additionalBatches?: PersonalQuestion[][]; // Additional practice batches
}

// Helper function to generate question variations based on lesson
const generateQuestionVariation = (baseQuestion: PersonalQuestion, index: number, lessonId?: string): PersonalQuestion => {
  const variations = getPersonalizationQuestions(lessonId || 'default');
  const variation = variations[index % variations.length];

  return {
    id: `${baseQuestion.id}-var-${index}`,
    question: variation.question,
    questionTurkish: variation.questionTurkish,
    category: variation.category,
    difficulty: baseQuestion.difficulty,
    suggestedAnswers: variation.suggestedAnswers,
    grammarFocus: variation.grammarFocus
  };
};

// Get personalization questions based on lesson ID
const getPersonalizationQuestions = (lessonId: string): PersonalQuestion[] => {
  const questionsByLesson: Record<string, PersonalQuestion[]> = {
    'lesson-1': [
      {
        id: 'pq1',
        question: 'What is your name?',
        questionTurkish: 'Adınız nedir?',
        category: 'personal',
        difficulty: 1,
        suggestedAnswers: ['Benim adım...', 'Ben...', 'Adım...'],
        grammarFocus: 'Personal pronouns and introduction'
      },
      {
        id: 'pq2',
        question: 'How old are you?',
        questionTurkish: 'Kaç yaşındasınız?',
        category: 'personal',
        difficulty: 1,
        suggestedAnswers: ['Ben ... yaşındayım', '... yaşındayım', 'Yaşım ...'],
        grammarFocus: 'Age expressions'
      },
      {
        id: 'pq3',
        question: 'Where are you from?',
        questionTurkish: 'Nerelisiniz?',
        category: 'personal',
        difficulty: 2,
        suggestedAnswers: ['Ben ... liyim', '... dan geliyorum', '... da yaşıyorum'],
        grammarFocus: 'Origin and location'
      },
      {
        id: 'pq4',
        question: 'What do you do for work?',
        questionTurkish: 'Ne iş yapıyorsunuz?',
        category: 'work',
        difficulty: 2,
        suggestedAnswers: ['Ben ... im', '... olarak çalışıyorum', 'Mesleğim ...'],
        grammarFocus: 'Profession expressions'
      },
      {
        id: 'pq5',
        question: 'Do you have any siblings?',
        questionTurkish: 'Kardeşiniz var mı?',
        category: 'family',
        difficulty: 2,
        suggestedAnswers: ['Evet, ... kardeşim var', 'Hayır, tek çocuğum', 'Bir ... im var'],
        grammarFocus: 'Family relationships and existence'
      }
    ],
    'lesson-2': [
      {
        id: 'pq6',
        question: 'What are your hobbies?',
        questionTurkish: 'Hobileriniz nelerdir?',
        category: 'hobbies',
        difficulty: 3,
        suggestedAnswers: ['... yapmayı seviyorum', 'Hobim ...', 'Boş zamanımda ...'],
        grammarFocus: 'Hobby expressions and preferences'
      },
      {
        id: 'pq7',
        question: 'What is your favorite food?',
        questionTurkish: 'En sevdiğiniz yemek nedir?',
        category: 'food',
        difficulty: 2,
        suggestedAnswers: ['En sevdiğim yemek ...', '... çok seviyorum', 'Favori yemeğim ...'],
        grammarFocus: 'Food preferences and superlatives'
      },
      {
        id: 'pq8',
        question: 'Have you traveled to Turkey before?',
        questionTurkish: 'Daha önce Türkiye ye geldiniz mi?',
        category: 'travel',
        difficulty: 3,
        suggestedAnswers: ['Evet, ... kez geldim', 'Hayır, ilk kez', 'Birkaç kez ...'],
        grammarFocus: 'Past tense and travel experiences'
      },
      {
        id: 'pq9',
        question: 'What languages do you speak?',
        questionTurkish: 'Hangi dilleri konuşuyorsunuz?',
        category: 'personal',
        difficulty: 2,
        suggestedAnswers: ['... konuşuyorum', 'Ana dilim ...', 'İki dil biliyorum: ...'],
        grammarFocus: 'Language abilities'
      },
      {
        id: 'pq10',
        question: 'Why are you learning Turkish?',
        questionTurkish: 'Neden Türkçe öğreniyorsunuz?',
        category: 'personal',
        difficulty: 3,
        suggestedAnswers: ['Çünkü ...', '... için öğreniyorum', 'Amacım ...'],
        grammarFocus: 'Reasons and purposes'
      }
    ],
    'lesson-3': [
      {
        id: 'pq11',
        question: 'What is your daily routine?',
        questionTurkish: 'Günlük rutininiz nasıl?',
        category: 'personal',
        difficulty: 3,
        suggestedAnswers: ['Sabah ...', 'Her gün ...', 'Genellikle ...'],
        grammarFocus: 'Daily routines and time expressions'
      },
      {
        id: 'pq12',
        question: 'What are your future plans?',
        questionTurkish: 'Gelecek planlarınız neler?',
        category: 'personal',
        difficulty: 4,
        suggestedAnswers: ['Gelecekte ...', 'Planım ...', '... yapmayı planlıyorum'],
        grammarFocus: 'Future tense and planning'
      }
    ],
    'default': [
      {
        id: 'pq13',
        question: 'Tell me about yourself',
        questionTurkish: 'Kendinizden bahsedin',
        category: 'personal',
        difficulty: 2,
        suggestedAnswers: ['Ben ...', 'Kendim hakkında ...', 'Kişiliğim ...'],
        grammarFocus: 'Self-description'
      },
      {
        id: 'pq14',
        question: 'What makes you happy?',
        questionTurkish: 'Sizi ne mutlu eder?',
        category: 'personal',
        difficulty: 3,
        suggestedAnswers: ['... beni mutlu eder', 'Mutlu olduğum zaman ...', 'Sevdiğim şeyler ...'],
        grammarFocus: 'Emotions and preferences'
      },
      {
        id: 'pq15',
        question: 'Describe your hometown',
        questionTurkish: 'Memleketinizi tarif edin',
        category: 'personal',
        difficulty: 3,
        suggestedAnswers: ['Memleketim ...', 'Doğduğum yer ...', 'Şehrim ...'],
        grammarFocus: 'Place descriptions'
      }
    ]
  };

  return questionsByLesson[lessonId] || questionsByLesson['default'];
};

// Generate fresh question batches for additional practice
const generateFreshQuestionBatch = (lessonId: string, batchNumber: number): PersonalQuestion[] => {
  const freshQuestions: PersonalQuestion[] = [
    {
      id: `fresh-${batchNumber}-1`,
      question: 'What is your favorite season and why?',
      questionTurkish: 'En sevdiğiniz mevsim hangisi ve neden?',
      category: 'personal',
      difficulty: 3,
      suggestedAnswers: ['En sevdiğim mevsim...', 'Çünkü...', '... mevsimini seviyorum'],
      grammarFocus: 'Preferences and reasons'
    },
    {
      id: `fresh-${batchNumber}-2`,
      question: 'Describe your ideal weekend',
      questionTurkish: 'İdeal hafta sonunuzu tarif edin',
      category: 'personal',
      difficulty: 3,
      suggestedAnswers: ['İdeal hafta sonum...', 'Hafta sonları...', 'Genellikle...'],
      grammarFocus: 'Time expressions and activities'
    },
    {
      id: `fresh-${batchNumber}-3`,
      question: 'What Turkish food would you like to try?',
      questionTurkish: 'Hangi Türk yemeğini denemek istersiniz?',
      category: 'food',
      difficulty: 2,
      suggestedAnswers: ['... denemek istiyorum', 'Türk mutfağından...', 'Özellikle...'],
      grammarFocus: 'Desire expressions and food vocabulary'
    },
    {
      id: `fresh-${batchNumber}-4`,
      question: 'How do you usually spend your evenings?',
      questionTurkish: 'Akşamlarınızı genellikle nasıl geçiriyorsunuz?',
      category: 'personal',
      difficulty: 2,
      suggestedAnswers: ['Akşamları...', 'Genellikle...', 'Evde...'],
      grammarFocus: 'Daily routines and time expressions'
    },
    {
      id: `fresh-${batchNumber}-5`,
      question: 'What would you like to learn about Turkish culture?',
      questionTurkish: 'Türk kültürü hakkında ne öğrenmek istersiniz?',
      category: 'culture',
      difficulty: 3,
      suggestedAnswers: ['Türk kültürü hakkında...', '... öğrenmek istiyorum', 'Özellikle...'],
      grammarFocus: 'Cultural topics and learning expressions'
    }
  ];

  return freshQuestions;
};

export default function YaSizPersonalization({
  questions,
  onComplete,
  allowAudio = true,
  maxQuestions = 5,
  lessonId,
  additionalBatches
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
  const [currentBatch, setCurrentBatch] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState<PersonalQuestion[]>(questions);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [completedBatches, setCompletedBatches] = useState<number[]>([]);
  const [maxBatches] = useState(5); // Maximum 5 additional batches
  const [currentSlide, setCurrentSlide] = useState(0); // For slide view
  const [slideResponses, setSlideResponses] = useState<UserResponse[]>([]);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [grammarCheck, setGrammarCheck] = useState<{correct: boolean, suggestions: string[]} | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const questionsToShow = currentQuestions.slice(0, Math.min(maxQuestions, currentQuestions.length));

  // Initialize with at least 5 questions
  useEffect(() => {
    const initializeQuestions = () => {
      let questionList = [...questions];

      // Ensure we have at least 5 questions by generating variations if needed
      while (questionList.length < 5) {
        const baseQuestion = questionList[questionList.length % questionList.length];
        const variation = generateQuestionVariation(baseQuestion, questionList.length, lessonId);
        questionList.push(variation);
      }

      setCurrentQuestions(questionList);

      // Show load more button if we have additional batches
      if (additionalBatches && additionalBatches.length > 0) {
        setShowLoadMore(true);
      }
    };

    initializeQuestions();
  }, [questions, lessonId, additionalBatches]);

  const loadMoreQuestions = () => {
    if (currentBatch < maxBatches) {
      // Generate fresh questions for this batch
      const newBatch = generateFreshQuestionBatch(lessonId || 'default', currentBatch + 1);
      setCurrentQuestions([...currentQuestions, ...newBatch]);
      setCurrentBatch(currentBatch + 1);
      setCompletedBatches([...completedBatches, currentBatch]);

      // Hide load more if reached max batches
      if (currentBatch + 1 >= maxBatches) {
        setShowLoadMore(false);
      }
    }
  };

  // Simple grammar and spelling check
  const checkResponse = (response: string): {correct: boolean, suggestions: string[]} => {
    const suggestions: string[] = [];
    let correct = true;

    // Basic Turkish grammar checks
    if (response.length < 3) {
      correct = false;
      suggestions.push('Cevabınız çok kısa. Lütfen daha detaylı yazın.');
    }

    // Check for common Turkish patterns
    if (response.includes('Ben') && !response.includes('im') && !response.includes('um') && !response.includes('yorum')) {
      suggestions.push('Türkçede "Ben" ile başlayan cümlelerde fiil çekimi önemlidir.');
    }

    // Check capitalization
    if (response[0] && response[0] !== response[0].toUpperCase()) {
      suggestions.push('Cümle büyük harfle başlamalıdır.');
    }

    // Check for period
    if (!response.endsWith('.') && !response.endsWith('!') && !response.endsWith('?')) {
      suggestions.push('Cümle noktalama işareti ile bitmelidir.');
    }

    return { correct: correct && suggestions.length === 0, suggestions };
  };

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
      setShowFeedback('Please enter your response or switch to audio recording.');
      return;
    }

    if (responseType === 'audio' && !audioBlob) {
      setShowFeedback('Please record your response or switch to text input.');
      return;
    }

    // Check grammar for text responses
    if (responseType === 'text') {
      const grammarResult = checkResponse(textInput);
      setGrammarCheck(grammarResult);

      if (!grammarResult.correct) {
        setShowFeedback('Grammar suggestions available - check below!');
        return;
      } else {
        setShowFeedback('Excellent Turkish! ✅');
      }
    } else {
      setShowFeedback('Audio response recorded! 🎤');
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

    // Auto-advance to next question after 2 seconds
    setTimeout(() => {
      // Reset for next question
      setTextInput('');
      setAudioBlob(null);
      setShowSuggestions(false);
      setShowFeedback(null);
      setGrammarCheck(null);

      if (currentQuestionIndex < questionsToShow.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setSessionComplete(true);
        onComplete(newResponses);
      }
    }, 2000);
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
          <span>Question {currentQuestionIndex + 1} of {Math.min(currentQuestions.length, maxQuestions)}</span>
          <span>Category: {currentQuestion.category}</span>
          <span>Difficulty: {'⭐'.repeat(currentQuestion.difficulty)}</span>
          {currentBatch > 0 && <span>Batch {currentBatch + 1}</span>}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / Math.min(currentQuestions.length, maxQuestions)) * 100}%` }}
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

      {/* Feedback Display */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-4 rounded-lg ${
            showFeedback.includes('✅')
              ? 'bg-green-50 border border-green-200 text-green-800'
              : showFeedback.includes('🎤')
              ? 'bg-blue-50 border border-blue-200 text-blue-800'
              : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
          }`}
        >
          <div className="font-medium">{showFeedback}</div>
        </motion.div>
      )}

      {/* Grammar Check Results */}
      {grammarCheck && !grammarCheck.correct && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg"
        >
          <h4 className="font-medium text-orange-800 mb-2">💡 Turkish Grammar Suggestions:</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            {grammarCheck.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setGrammarCheck(null)}
            className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            Got it! Continue
          </button>
        </motion.div>
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
      {/* Load More Questions Button */}
      {showLoadMore && !sessionComplete && (
        <div className="text-center mt-6">
          <button
            onClick={loadMoreQuestions}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            💭 Load More Questions (Batch {currentBatch + 2})
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Get {additionalBatches?.[currentBatch]?.length || 5} more personalization questions
          </p>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-500">
        Responses given: {responses.length} | Remaining: {Math.min(currentQuestions.length, maxQuestions) - currentQuestionIndex - 1}
        {completedBatches.length > 0 && (
          <span> | Batches completed: {completedBatches.length + 1}</span>
        )}
      </div>
    </div>
  );
}
