'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GrammarRule {
  id: string;
  title: string;
  description: string;
  summary: string; // Simple summary of the grammar rule
  examples: GrammarExample[];
  animation: AnimationType;
  difficulty: number;
  lessonId?: string; // To vary content by lesson
  additionalBatches?: GrammarExample[][]; // Additional practice batches
}

interface GrammarExample {
  base: string;
  suffix: string;
  result: string;
  translation: string;
  explanation: string;
}

type AnimationType = 'vowel_harmony' | 'plural_suffix' | 'possessive_suffix' | 'case_suffix';

interface AnimatedGrammarLessonProps {
  rule: GrammarRule;
  onComplete: () => void;
  onNext?: () => void;
}

// Helper function to get grammar variations based on lesson and animation type
const getGrammarVariations = (animationType: AnimationType, lessonId: string): GrammarExample[] => {
  const baseVariations: Record<AnimationType, Record<string, GrammarExample[]>> = {
    vowel_harmony: {
      'lesson-1': [
        { id: 'vh1', base: 'ev', suffix: 'ler', result: 'evler', translation: 'houses', explanation: 'Front vowel + front vowel suffix' },
        { id: 'vh2', base: 'kız', suffix: 'lar', result: 'kızlar', translation: 'girls', explanation: 'Back vowel + back vowel suffix' },
        { id: 'vh3', base: 'göz', suffix: 'ler', result: 'gözler', translation: 'eyes', explanation: 'Front rounded vowel + front suffix' },
        { id: 'vh4', base: 'top', suffix: 'lar', result: 'toplar', translation: 'balls', explanation: 'Back rounded vowel + back suffix' },
        { id: 'vh5', base: 'kitap', suffix: 'lar', result: 'kitaplar', translation: 'books', explanation: 'Back vowel + back vowel suffix' }
      ],
      'lesson-2': [
        { id: 'vh6', base: 'çiçek', suffix: 'ler', result: 'çiçekler', translation: 'flowers', explanation: 'Front vowel + front vowel suffix' },
        { id: 'vh7', base: 'masa', suffix: 'lar', result: 'masalar', translation: 'tables', explanation: 'Back vowel + back vowel suffix' },
        { id: 'vh8', base: 'pencere', suffix: 'ler', result: 'pencereler', translation: 'windows', explanation: 'Front vowel + front vowel suffix' },
        { id: 'vh9', base: 'kapı', suffix: 'lar', result: 'kapılar', translation: 'doors', explanation: 'Back vowel + back vowel suffix' },
        { id: 'vh10', base: 'öğretmen', suffix: 'ler', result: 'öğretmenler', translation: 'teachers', explanation: 'Front vowel + front vowel suffix' }
      ],
      'default': [
        { id: 'vh11', base: 'araba', suffix: 'lar', result: 'arabalar', translation: 'cars', explanation: 'Back vowel + back vowel suffix' },
        { id: 'vh12', base: 'elma', suffix: 'lar', result: 'elmalar', translation: 'apples', explanation: 'Front vowel + front vowel suffix' },
        { id: 'vh13', base: 'okul', suffix: 'lar', result: 'okullar', translation: 'schools', explanation: 'Back vowel + back vowel suffix' },
        { id: 'vh14', base: 'şehir', suffix: 'ler', result: 'şehirler', translation: 'cities', explanation: 'Front vowel + front vowel suffix' },
        { id: 'vh15', base: 'hayvan', suffix: 'lar', result: 'hayvanlar', translation: 'animals', explanation: 'Back vowel + back vowel suffix' }
      ]
    },
    plural_suffix: {
      'lesson-1': [
        { id: 'ps1', base: 'çocuk', suffix: 'lar', result: 'çocuklar', translation: 'children', explanation: 'Plural suffix for back vowel words' },
        { id: 'ps2', base: 'kedi', suffix: 'ler', result: 'kediler', translation: 'cats', explanation: 'Plural suffix for front vowel words' },
        { id: 'ps3', base: 'köpek', suffix: 'ler', result: 'köpekler', translation: 'dogs', explanation: 'Plural suffix for front vowel words' },
        { id: 'ps4', base: 'kuş', suffix: 'lar', result: 'kuşlar', translation: 'birds', explanation: 'Plural suffix for back vowel words' },
        { id: 'ps5', base: 'balık', suffix: 'lar', result: 'balıklar', translation: 'fish', explanation: 'Plural suffix for back vowel words' }
      ],
      'default': [
        { id: 'ps6', base: 'ağaç', suffix: 'lar', result: 'ağaçlar', translation: 'trees', explanation: 'Plural suffix for back vowel words' },
        { id: 'ps7', base: 'çiçek', suffix: 'ler', result: 'çiçekler', translation: 'flowers', explanation: 'Plural suffix for front vowel words' },
        { id: 'ps8', base: 'meyve', suffix: 'ler', result: 'meyveler', translation: 'fruits', explanation: 'Plural suffix for front vowel words' },
        { id: 'ps9', base: 'sebze', suffix: 'ler', result: 'sebzeler', translation: 'vegetables', explanation: 'Plural suffix for front vowel words' },
        { id: 'ps10', base: 'yemek', suffix: 'ler', result: 'yemekler', translation: 'foods', explanation: 'Plural suffix for front vowel words' }
      ]
    },
    possessive_suffix: {
      'default': [
        { id: 'pos1', base: 'ev', suffix: 'im', result: 'evim', translation: 'my house', explanation: 'First person possessive suffix' },
        { id: 'pos2', base: 'araba', suffix: 'n', result: 'araban', translation: 'your car', explanation: 'Second person possessive suffix' },
        { id: 'pos3', base: 'kitap', suffix: 'ı', result: 'kitabı', translation: 'his/her book', explanation: 'Third person possessive suffix' },
        { id: 'pos4', base: 'okul', suffix: 'umuz', result: 'okulumuz', translation: 'our school', explanation: 'First person plural possessive' },
        { id: 'pos5', base: 'öğretmen', suffix: 'iniz', result: 'öğretmeniniz', translation: 'your teacher', explanation: 'Second person plural possessive' }
      ]
    },
    case_suffix: {
      'default': [
        { id: 'cs1', base: 'ev', suffix: 'e', result: 'eve', translation: 'to the house', explanation: 'Dative case suffix' },
        { id: 'cs2', base: 'okul', suffix: 'da', result: 'okulda', translation: 'at school', explanation: 'Locative case suffix' },
        { id: 'cs3', base: 'kitap', suffix: 'ı', result: 'kitabı', translation: 'the book (object)', explanation: 'Accusative case suffix' },
        { id: 'cs4', base: 'çanta', suffix: 'dan', result: 'çantadan', translation: 'from the bag', explanation: 'Ablative case suffix' },
        { id: 'cs5', base: 'masa', suffix: 'nın', result: 'masanın', translation: 'of the table', explanation: 'Genitive case suffix' }
      ]
    }
  };

  const lessonVariations = baseVariations[animationType][lessonId] || baseVariations[animationType]['default'];
  return lessonVariations;
};

// Generate fresh example batches for additional practice
const generateFreshExampleBatch = (animationType: AnimationType, lessonId: string, batchNumber: number): GrammarExample[] => {
  const allVariations = getGrammarVariations(animationType, lessonId);
  const batchSize = 5;
  const startIndex = (batchNumber - 1) * batchSize;

  // If we run out of predefined examples, generate new ones
  if (startIndex >= allVariations.length) {
    const baseVariations = allVariations;
    const newExamples: GrammarExample[] = [];

    for (let i = 0; i < batchSize; i++) {
      const baseExample = baseVariations[i % baseVariations.length];
      const newExample: GrammarExample = {
        id: `${baseExample.id}-batch${batchNumber}-${i}`,
        base: generateNewWord(animationType, batchNumber, i),
        suffix: baseExample.suffix,
        result: generateNewWord(animationType, batchNumber, i) + baseExample.suffix,
        translation: generateNewTranslation(animationType, batchNumber, i),
        explanation: baseExample.explanation
      };
      newExamples.push(newExample);
    }
    return newExamples;
  }

  return allVariations.slice(startIndex, startIndex + batchSize);
};

// Helper function to generate new words for fresh batches
const generateNewWord = (animationType: AnimationType, batchNumber: number, index: number): string => {
  const wordSets: Record<AnimationType, string[]> = {
    vowel_harmony: ['bahçe', 'deniz', 'güneş', 'yıldız', 'çilek', 'portakal', 'elma', 'armut', 'kiraz', 'üzüm'],
    plural_suffix: ['kalem', 'defter', 'masa', 'sandalye', 'pencere', 'kapı', 'duvar', 'tavan', 'zemin', 'lamba'],
    possessive_suffix: ['telefon', 'bilgisayar', 'çanta', 'ayakkabı', 'gözlük', 'saat', 'anahtar', 'cüzdan', 'şapka', 'eldiven'],
    case_suffix: ['park', 'hastane', 'market', 'restoran', 'kütüphane', 'müze', 'sinema', 'tiyatro', 'stadyum', 'havaalanı']
  };

  const words = wordSets[animationType];
  return words[(batchNumber * 5 + index) % words.length];
};

// Comprehensive Turkish to English dictionary for accurate base word translations
const getTurkishBaseTranslation = (turkishWord: string): string => {
  const turkishToEnglish: Record<string, string> = {
    // Vowel harmony examples
    'ev': 'house',
    'kız': 'girl',
    'göz': 'eye',
    'top': 'ball',
    'kitap': 'book',
    'çiçek': 'flower',
    'masa': 'table',
    'pencere': 'window',
    'kapı': 'door',
    'öğretmen': 'teacher',
    'araba': 'car',
    'elma': 'apple',
    'okul': 'school',
    'şehir': 'city',
    'hayvan': 'animal',

    // Plural suffix examples
    'çocuk': 'child',
    'kedi': 'cat',
    'köpek': 'dog',
    'kuş': 'bird',
    'balık': 'fish',
    'ağaç': 'tree',
    'meyve': 'fruit',
    'sebze': 'vegetable',
    'yemek': 'food',

    // Additional vocabulary
    'bahçe': 'garden',
    'deniz': 'sea',
    'güneş': 'sun',
    'yıldız': 'star',
    'çilek': 'strawberry',
    'portakal': 'orange',
    'armut': 'pear',
    'kiraz': 'cherry',
    'üzüm': 'grape',
    'kalem': 'pen',
    'defter': 'notebook',
    'sandalye': 'chair',
    'duvar': 'wall',
    'tavan': 'ceiling',
    'zemin': 'floor',
    'lamba': 'lamp',
    'telefon': 'phone',
    'bilgisayar': 'computer',
    'çanta': 'bag',
    'ayakkabı': 'shoe',
    'gözlük': 'glasses',
    'saat': 'watch',
    'anahtar': 'key',
    'cüzdan': 'wallet',
    'şapka': 'hat',
    'eldiven': 'glove',
    'park': 'park',
    'hastane': 'hospital',
    'market': 'market',
    'restoran': 'restaurant',
    'kütüphane': 'library',
    'müze': 'museum',
    'sinema': 'cinema',
    'tiyatro': 'theater',
    'stadyum': 'stadium',
    'havaalanı': 'airport'
  };

  return turkishToEnglish[turkishWord] || turkishWord;
};

// Helper function to generate new translations using Turkish dictionary
const generateNewTranslation = (animationType: AnimationType, batchNumber: number, index: number): string => {
  // Get the Turkish word first
  const turkishWord = generateNewWord(animationType, batchNumber, index);
  // Get the English translation from our dictionary
  const baseTranslation = getTurkishBaseTranslation(turkishWord);

  // For plural suffixes, return the plural form
  if (animationType === 'vowel_harmony' || animationType === 'plural_suffix') {
    // Simple pluralization rules
    if (baseTranslation.endsWith('y')) {
      return baseTranslation.slice(0, -1) + 'ies';
    } else if (baseTranslation.endsWith('s') || baseTranslation.endsWith('sh') || baseTranslation.endsWith('ch') || baseTranslation.endsWith('x') || baseTranslation.endsWith('z')) {
      return baseTranslation + 'es';
    } else if (baseTranslation === 'child') {
      return 'children';
    } else if (baseTranslation === 'fish') {
      return 'fish';
    } else {
      return baseTranslation + 's';
    }
  }

  // For other types, return the base translation
  return baseTranslation;
};

export default function AnimatedGrammarLesson({ rule, onComplete, onNext }: AnimatedGrammarLessonProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'intro' | 'demonstration' | 'practice' | 'complete'>('intro');
  const [currentBatch, setCurrentBatch] = useState(0); // 0 = main, 1-5 = additional batches
  const [currentExamples, setCurrentExamples] = useState<GrammarExample[]>(rule.examples);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [completedBatches, setCompletedBatches] = useState<number[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [pronunciationQuality, setPronunciationQuality] = useState<'professional' | 'enhanced' | 'basic'>('basic');

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
        console.log('Available voices loaded:', voices.length);

        // Log Turkish voices specifically
        const turkishVoices = voices.filter(voice =>
          voice.lang.startsWith('tr') ||
          voice.name.toLowerCase().includes('turkish')
        );

        if (turkishVoices.length > 0) {
          console.log('Turkish voices found:', turkishVoices.map(v => `${v.name} (${v.lang})`));
          setPronunciationQuality('enhanced');
        } else {
          console.log('No Turkish voices found, will use optimized fallback');
          setPronunciationQuality('basic');
        }
      }
    };

    // Load voices immediately if available
    loadVoices();

    // Also listen for voiceschanged event (some browsers load voices asynchronously)
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    // Force voice loading after a short delay (some browsers need this)
    const timer = setTimeout(loadVoices, 100);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      clearTimeout(timer);
    };
  }, []);

  // Enhanced Turkish pronunciation - Direct browser synthesis with optimization
  const playAudio = async (text: string, language: 'turkish' | 'english' = 'turkish') => {
    console.log(`Playing audio for: "${text}" in ${language}`);

    try {
      if (language === 'turkish') {
        // Use optimized Turkish pronunciation directly
        playOptimizedTurkishAudio(text);
      } else {
        // Use browser synthesis for English
        playBrowserSynthesis(text, language);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      // Final fallback
      playBrowserSynthesis(text, language);
    }
  };

  // Optimized Turkish pronunciation with best available voices
  const playOptimizedTurkishAudio = (text: string) => {
    try {
      console.log('Playing optimized Turkish audio for:', text);
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Get all available voices
      const voices = speechSynthesis.getVoices();
      console.log(`Found ${voices.length} voices`);

      // Find the best Turkish voice
      let selectedVoice = null;

      // Priority 1: Native Turkish voices
      selectedVoice = voices.find(voice =>
        voice.lang === 'tr-TR' || voice.lang === 'tr'
      );

      // Priority 2: Turkish voices with any variant
      if (!selectedVoice) {
        selectedVoice = voices.find(voice =>
          voice.lang.startsWith('tr') ||
          voice.name.toLowerCase().includes('turkish') ||
          voice.name.toLowerCase().includes('türk')
        );
      }

      // Priority 3: High-quality voices that handle Turkish well
      if (!selectedVoice) {
        selectedVoice = voices.find(voice =>
          voice.name.toLowerCase().includes('neural') ||
          voice.name.toLowerCase().includes('premium') ||
          voice.name.toLowerCase().includes('enhanced') ||
          voice.name.toLowerCase().includes('wavenet')
        );
      }

      // Priority 4: Female voices (often better for Turkish)
      if (!selectedVoice) {
        selectedVoice = voices.find(voice =>
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('woman')
        );
      }

      // Use the selected voice or default
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Using voice:', selectedVoice.name, selectedVoice.lang);
      } else {
        console.log('Using default voice');
      }

      // Optimize settings for Turkish
      utterance.lang = 'tr-TR';
      utterance.rate = 0.75; // Slower for learning
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Add event handlers
      utterance.onstart = () => {
        console.log('Turkish speech started');
        setPronunciationQuality('enhanced');
      };

      utterance.onend = () => {
        console.log('Turkish speech completed');
      };

      utterance.onerror = (event) => {
        console.error('Turkish speech error:', event.error);
        setPronunciationQuality('basic');
      };

      // Speak the text
      speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('Optimized Turkish audio failed:', error);
      // Final fallback
      playBrowserSynthesis(text, 'turkish');
    }
  };

  // Professional Turkish TTS using multiple services
  const tryHighQualityTTS = async (text: string): Promise<boolean> => {
    try {
      // Try OpenAI TTS first (most professional)
      const openAISuccess = await tryOpenAITTS(text);
      if (openAISuccess) return true;

      // Try Google Cloud TTS as fallback
      const googleSuccess = await tryGoogleTTS(text);
      if (googleSuccess) return true;

      // Try Azure Cognitive Services as second fallback
      const azureSuccess = await tryAzureTTS(text);
      if (azureSuccess) return true;

      return false;
    } catch (error) {
      console.log('All high-quality TTS services failed:', error);
      return false;
    }
  };

  // OpenAI TTS API - Professional quality
  const tryOpenAITTS = async (text: string): Promise<boolean> => {
    try {
      console.log('Trying OpenAI TTS for:', text);

      const response = await fetch('/api/tts/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: 'alloy', // OpenAI voice that works well with Turkish
          language: 'tr'
        }),
      });

      console.log('OpenAI TTS response status:', response.status);

      if (response.ok) {
        const audioBlob = await response.blob();
        console.log('Audio blob size:', audioBlob.size);

        if (audioBlob.size > 0) {
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            console.log(`OpenAI TTS completed for: ${text}`);
          };

          audio.onerror = (e) => {
            console.error('Audio playback error:', e);
            URL.revokeObjectURL(audioUrl);
          };

          await audio.play();
          setPronunciationQuality('professional');
          return true;
        }
      } else {
        const errorText = await response.text();
        console.log('OpenAI TTS API error:', response.status, errorText);
      }
      return false;
    } catch (error) {
      console.error('OpenAI TTS failed:', error);
      return false;
    }
  };

  // Google Cloud TTS fallback
  const tryGoogleTTS = async (text: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/tts/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          languageCode: 'tr-TR',
          voiceName: 'tr-TR-Wavenet-E' // High-quality Turkish voice
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          console.log(`Google TTS completed for: ${text}`);
        };

        await audio.play();
        setPronunciationQuality('professional');
        return true;
      }
      return false;
    } catch (error) {
      console.log('Google TTS failed:', error);
      return false;
    }
  };

  // Azure Cognitive Services TTS fallback
  const tryAzureTTS = async (text: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/tts/azure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: 'tr-TR-EmelNeural', // High-quality Turkish neural voice
          language: 'tr-TR'
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          console.log(`Azure TTS completed for: ${text}`);
        };

        await audio.play();
        return true;
      }
      return false;
    } catch (error) {
      console.log('Azure TTS failed:', error);
      return false;
    }
  };

  // Enhanced Turkish pronunciation with native browser voices
  const fallbackToPhoneticPronunciation = (text: string) => {
    try {
      console.log('Using fallback pronunciation for:', text);
      speechSynthesis.cancel();

      // First try to use actual Turkish with best available Turkish voice
      const success = tryNativeTurkishVoice(text);
      if (success) {
        console.log('Using native Turkish voice');
        return;
      }

      // If no Turkish voice, use enhanced phonetic pronunciation
      console.log('Using enhanced phonetic pronunciation');
      usePhoneticPronunciation(text);
    } catch (error) {
      console.error('Enhanced pronunciation failed:', error);
      // Final fallback - basic browser synthesis
      playBrowserSynthesis(text, 'turkish');
    }
  };

  // Try to use native Turkish voices from the browser
  const tryNativeTurkishVoice = (text: string): boolean => {
    try {
      const voices = speechSynthesis.getVoices();

      // Look for high-quality Turkish voices in order of preference
      const turkishVoices = voices.filter(voice =>
        voice.lang.startsWith('tr') ||
        voice.lang.includes('TR') ||
        voice.name.toLowerCase().includes('turkish') ||
        voice.name.toLowerCase().includes('türk')
      );

      // Prefer neural/premium voices
      const premiumVoice = turkishVoices.find(voice =>
        voice.name.toLowerCase().includes('neural') ||
        voice.name.toLowerCase().includes('premium') ||
        voice.name.toLowerCase().includes('wavenet') ||
        voice.name.toLowerCase().includes('enhanced')
      );

      const selectedVoice = premiumVoice || turkishVoices[0];

      if (selectedVoice) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.lang = 'tr-TR';
        utterance.rate = 0.8; // Slightly slower for learning
        utterance.pitch = 1.0;
        utterance.volume = 1;

        utterance.onend = () => {
          console.log(`Native Turkish pronunciation completed for: ${text} using ${selectedVoice.name}`);
        };

        utterance.onerror = (event) => {
          console.log('Native Turkish voice error:', event.error);
        };

        speechSynthesis.speak(utterance);
        setPronunciationQuality('enhanced');
        return true;
      }

      return false;
    } catch (error) {
      console.log('Native Turkish voice failed:', error);
      return false;
    }
  };

  // Enhanced phonetic pronunciation as final fallback
  const usePhoneticPronunciation = (text: string) => {
    // Use the original text with best available voice settings
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = speechSynthesis.getVoices();

    // Try to find any voice that might handle Turkish better
    const bestVoice = voices.find(voice =>
      voice.lang.startsWith('tr') ||
      voice.lang.startsWith('de') || // German voices often handle Turkish sounds better
      voice.lang.startsWith('it') || // Italian voices for vowel sounds
      (voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female'))
    ) || voices[0];

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    // Use Turkish language code even with non-Turkish voice
    utterance.lang = 'tr-TR';
    utterance.rate = 0.7; // Slower for clarity
    utterance.pitch = 1.1; // Slightly higher for Turkish
    utterance.volume = 1;

    utterance.onend = () => {
      console.log(`Enhanced fallback pronunciation completed for: ${text}`);
    };

    utterance.onerror = (event) => {
      console.log('Enhanced fallback pronunciation error:', event.error);
    };

    speechSynthesis.speak(utterance);
  };

  // Create phonetic approximation for unknown Turkish words
  const createPhoneticApproximation = (text: string): string => {
    return text
      .replace(/ş/g, 'sh')
      .replace(/ç/g, 'ch')
      .replace(/ğ/g, 'gh')
      .replace(/ı/g, 'uh')
      .replace(/ö/g, 'uh')
      .replace(/ü/g, 'ü')
      .replace(/j/g, 'zh')
      .toLowerCase();
  };

  // Get phonetic guide for display
  const getPhoneticGuide = (text: string): string => {
    const turkishPhonetics: Record<string, string> = {
      'okul': 'oh-KOOL',
      'şehir': 'sheh-HEER',
      'ev': 'ehv',
      'kız': 'kuhz',
      'göz': 'guhz',
      'top': 'tohp',
      'kitap': 'kee-TAHP',
      'çiçek': 'chee-CHEHK',
      'masa': 'mah-SAH',
      'pencere': 'pehn-jeh-REH',
      'kapı': 'kah-PUH',
      'öğretmen': 'uh-reht-MEHN',
      'araba': 'ah-rah-BAH',
      'elma': 'ehl-MAH',
      'hayvan': 'hahy-VAHN',
      'çocuk': 'choh-JOOK',
      'kedi': 'keh-DEE',
      'köpek': 'kuh-PEHK',
      'kuş': 'koosh',
      'balık': 'bah-LUHK'
    };

    return turkishPhonetics[text.toLowerCase()] || createPhoneticApproximation(text);
  };

  // Browser synthesis for English and fallback
  const playBrowserSynthesis = (text: string, language: 'turkish' | 'english') => {
    try {
      console.log(`Using browser synthesis for: "${text}" in ${language}`);
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      if (language === 'turkish') {
        utterance.lang = 'tr-TR';
        const voices = speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);

        const turkishVoice = voices.find(voice => voice.lang.startsWith('tr'));
        if (turkishVoice) {
          utterance.voice = turkishVoice;
          console.log('Using Turkish voice:', turkishVoice.name);
        } else {
          console.log('No Turkish voice found, using default');
        }
        utterance.rate = 0.7;
      } else {
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
      }

      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        console.log('Speech started');
      };

      utterance.onend = () => {
        console.log('Speech ended');
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
      };

      speechSynthesis.speak(utterance);
      setPronunciationQuality('basic');
    } catch (error) {
      console.error('Browser synthesis failed:', error);
    }
  };
  const [maxBatches] = useState(5); // Maximum 5 additional batches
  const [showSummary, setShowSummary] = useState(false);

  const example = currentExamples[currentExample];

  // Initialize with at least 5 examples
  useEffect(() => {
    const initializeExamples = () => {
      let examples = [...rule.examples];

      // Ensure we have at least 5 examples by generating variations if needed
      while (examples.length < 5) {
        const baseExample = examples[examples.length % examples.length];
        const variation = generateExampleVariation(baseExample, examples.length, rule.lessonId);
        examples.push(variation);
      }

      setCurrentExamples(examples);

      // Show load more button if we have additional batches
      if (rule.additionalBatches && rule.additionalBatches.length > 0) {
        setShowLoadMore(true);
      }
    };

    initializeExamples();
  }, [rule]);

  useEffect(() => {
    // Auto-advance through animation phases
    const timer = setTimeout(() => {
      if (animationPhase === 'intro') {
        setAnimationPhase('demonstration');
      } else if (animationPhase === 'demonstration' && currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [animationPhase, currentStep]);

  // Generate example variations based on lesson ID and grammar rule
  const generateExampleVariation = (baseExample: GrammarExample, index: number, lessonId?: string): GrammarExample => {
    const variations = getGrammarVariations(rule.animation, lessonId || 'default');
    const variation = variations[index % variations.length];

    return {
      id: `${baseExample.id}-var-${index}`,
      base: variation.base,
      suffix: variation.suffix,
      result: variation.result,
      translation: variation.translation,
      explanation: variation.explanation
    };
  };

  const loadMoreExamples = () => {
    if (currentBatch < maxBatches) {
      // Generate fresh examples for this batch
      const newBatch = generateFreshExampleBatch(rule.animation, rule.lessonId || 'default', currentBatch + 1);
      setCurrentExamples([...currentExamples, ...newBatch]);
      setCurrentBatch(currentBatch + 1);
      setCompletedBatches([...completedBatches, currentBatch]);

      // Hide load more if reached max batches
      if (currentBatch + 1 >= maxBatches) {
        setShowLoadMore(false);
      }
    }
  };

  const showGrammarSummary = () => {
    setShowSummary(true);
  };

  const nextExample = () => {
    if (currentExample < currentExamples.length - 1) {
      setCurrentExample(currentExample + 1);
      setCurrentStep(0);
      setAnimationPhase('demonstration');
    } else {
      // After completing 5 slides, show summary
      if (currentExample + 1 >= 5 && !showSummary) {
        setShowSummary(true);
      } else {
        setAnimationPhase('complete');
      }
    }
  };

  const renderVowelHarmonyAnimation = () => {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 p-8">
        {/* Base Word with Translation */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          onAnimationComplete={() => {
            // Pronounce the base word when it appears
            setTimeout(() => playAudio(example.base, 'turkish'), 500);
          }}
          className="text-center"
        >
          <div className="text-4xl font-bold text-blue-600 bg-blue-100 px-6 py-3 rounded-lg border-2 border-blue-300 cursor-pointer mb-2 hover:bg-blue-200 transition-colors relative group"
            onClick={() => playAudio(example.base, 'turkish')}
            title={`Click to hear pronunciation: ${getPhoneticGuide(example.base)}`}
          >
            🔊 {example.base}
            {/* Phonetic guide tooltip */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {getPhoneticGuide(example.base)}
            </div>
          </div>
          <div className="text-sm text-gray-600 italic">
            "{getTurkishBaseTranslation(example.base)}" (base word)
          </div>
          <div className="text-xs text-blue-500 mt-1 flex items-center justify-center gap-1">
            <span>🎙️</span>
            <span>Turkish pronunciation</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold border ${
              pronunciationQuality === 'professional'
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200'
                : pronunciationQuality === 'enhanced'
                ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              {pronunciationQuality === 'professional' ? '🌟 AI-Powered' :
               pronunciationQuality === 'enhanced' ? '⚡ Enhanced' : '🔧 Basic'}
            </span>
            {voicesLoaded && (
              <button
                onClick={() => playAudio('test', 'turkish')}
                className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                title="Test audio"
              >
                🔊 Test
              </button>
            )}
          </div>
        </motion.div>

        {/* Animation Row */}
        <div className="flex items-center justify-center space-x-4">
          {/* Base Word (smaller) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-2xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg"
          >
            {example.base}
          </motion.div>

          {/* Plus Sign */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-2xl font-bold text-gray-600"
          >
            +
          </motion.div>

          {/* Suffix */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-green-600 bg-green-100 px-4 py-2 rounded-lg">
              {example.suffix}
            </div>
          </motion.div>

          {/* Equals Sign */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8 }}
            className="text-2xl font-bold text-gray-600"
          >
            =
          </motion.div>

          {/* Result */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.2, type: "spring", stiffness: 200 }}
            onAnimationComplete={() => {
              // Pronounce the result when it appears
              setTimeout(() => playAudio(example.result, 'turkish'), 300);
            }}
            className="text-2xl font-bold text-purple-600 bg-purple-100 px-4 py-2 rounded-lg border-2 border-purple-300 cursor-pointer hover:bg-purple-200 transition-colors relative group"
            onClick={() => playAudio(example.result, 'turkish')}
            title={`Click to hear pronunciation: ${getPhoneticGuide(example.result)}`}
          >
            🔊 {example.result}
            {/* Phonetic guide tooltip */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {getPhoneticGuide(example.result)}
            </div>
          </motion.div>
        </div>

        {/* Vowel Harmony Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6 }}
          className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-full border border-green-200"
        >
          ✨ Vowel Harmony Applied! ✨
        </motion.div>

        {/* English Translation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.2 }}
          className="text-lg text-gray-600 italic bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 cursor-pointer"
          onClick={() => playAudio(example.translation, 'english')}
        >
          🔊 "{example.translation}"
        </motion.div>
      </div>
    );
  };

  const renderPluralSuffixAnimation = () => {
    const letters = example.suffix.split('');
    
    return (
      <div className="flex flex-col items-center space-y-6 p-8">
        {/* Word */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onAnimationComplete={() => {
            // Pronounce the base word when it appears
            setTimeout(() => playAudio(example.base, 'turkish'), 500);
          }}
          className="text-4xl font-bold text-blue-600 cursor-pointer"
          onClick={() => playAudio(example.base, 'turkish')}
        >
          {example.base}
        </motion.div>

        {/* Suffix Animation */}
        <div className="flex items-center space-x-2">
          {letters.map((letter, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotate: 180 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 1 + index * 0.3, type: "spring" }}
              className="text-3xl font-bold text-green-600 bg-green-100 w-12 h-12 flex items-center justify-center rounded-full"
            >
              {letter}
            </motion.div>
          ))}
        </div>

        {/* Snap Together Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3, type: "spring", stiffness: 300 }}
          onAnimationComplete={() => {
            // Pronounce the result when it appears
            setTimeout(() => playAudio(example.result, 'turkish'), 300);
          }}
          className="text-4xl font-bold text-purple-600 bg-purple-100 px-6 py-3 rounded-lg border-4 border-purple-300 cursor-pointer"
          onClick={() => playAudio(example.result, 'turkish')}
        >
          {example.result}
        </motion.div>

        {/* Sound Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2 }}
          className="text-2xl"
        >
          ✨ *snap* ✨
        </motion.div>

        {/* English Translation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4 }}
          className="text-lg text-gray-600 italic bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 cursor-pointer"
          onClick={() => playAudio(example.translation, 'english')}
        >
          🔊 "{example.translation}"
        </motion.div>
      </div>
    );
  };

  const renderPossessiveSuffixAnimation = () => {
    return (
      <div className="flex flex-col items-center space-y-8 p-8">
        {/* Person Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-4"
        >
          <div className="text-6xl">👤</div>
          <div className="text-2xl font-bold text-blue-600">
            {example.base.includes('benim') ? 'Benim' : 
             example.base.includes('senin') ? 'Senin' : 
             example.base.includes('onun') ? 'Onun' : 'My/Your/His'}
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl"
        >
          ⬇️
        </motion.div>

        {/* Word Transformation */}
        <div className="flex items-center space-x-4">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="text-3xl font-bold text-gray-600"
          >
            {example.base.split(' ').pop()}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
            className="text-2xl"
          >
            +
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2 }}
            className="text-3xl font-bold text-green-600 bg-green-100 px-3 py-1 rounded"
          >
            {example.suffix}
          </motion.div>
        </div>

        {/* Result */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, type: "spring" }}
          className="text-4xl font-bold text-purple-600 bg-purple-100 px-6 py-3 rounded-lg border-2 border-purple-300"
        >
          {example.result}
        </motion.div>

        {/* Translation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="text-lg text-gray-600 italic"
        >
          "{example.translation}"
        </motion.div>
      </div>
    );
  };

  const renderAnimation = () => {
    switch (rule.animation) {
      case 'vowel_harmony':
        return renderVowelHarmonyAnimation();
      case 'plural_suffix':
        return renderPluralSuffixAnimation();
      case 'possessive_suffix':
        return renderPossessiveSuffixAnimation();
      default:
        return renderVowelHarmonyAnimation();
    }
  };

  const previousExample = () => {
    if (currentExample > 0) {
      setCurrentExample(currentExample - 1);
      setCurrentStep(0);
      setAnimationPhase('intro');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{rule.title}</h1>
        <p className="text-lg text-gray-600 mb-4">{rule.description}</p>
        <div className="flex justify-center space-x-4 text-sm text-gray-500">
          <span>Example {currentExample + 1} of {currentExamples.length}</span>
          <span>Difficulty: {'⭐'.repeat(rule.difficulty)}</span>
          {currentBatch > 0 && <span>Batch {currentBatch + 1}</span>}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentExample + 1) / currentExamples.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Animation Area */}
      <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 min-h-96 mb-8">
        <AnimatePresence mode="wait">
          {animationPhase !== 'complete' && (
            <motion.div
              key={currentExample}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {renderAnimation()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion Message */}
        {animationPhase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-96 text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Lesson Complete!</h2>
            <p className="text-lg text-green-600 mb-6">
              You've mastered {rule.title}!
            </p>
            <button
              onClick={onComplete}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Continue Learning
            </button>
          </motion.div>
        )}
      </div>

      {/* Explanation Panel */}
      {animationPhase !== 'complete' && (
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-blue-800">
              Explanation: {example.base} → {example.result}
            </h3>
            <span className="text-blue-600">
              {showExplanation ? '▼' : '▶'}
            </span>
          </button>
          
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 text-blue-700"
              >
                <p className="mb-2">{example.explanation}</p>
                <p className="italic">Translation: "{example.translation}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation Controls */}
      {animationPhase !== 'complete' && (
        <div className="flex justify-between items-center">
          <button
            onClick={previousExample}
            disabled={currentExample === 0}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          <div className="flex space-x-2">
            {currentExamples.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentExample(index);
                  setCurrentStep(0);
                  setAnimationPhase('intro');
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentExample ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextExample}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentExample === currentExamples.length - 1 ? 'Complete' : 'Next →'}
          </button>
        </div>
      )}

      {/* Grammar Rule Summary */}
      {showSummary && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Grammar Rule Summary</h2>
            <div className="text-lg text-blue-700 mb-6 leading-relaxed">
              {rule.summary || rule.description}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowSummary(false);
                  setShowLoadMore(true);
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                📚 Load More Examples
              </button>
              <button
                onClick={() => {
                  setShowSummary(false);
                  setAnimationPhase('complete');
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Complete Lesson
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Load More Examples Button */}
      {showLoadMore && !showSummary && animationPhase !== 'complete' && currentBatch < maxBatches && (
        <div className="text-center mt-6">
          <button
            onClick={loadMoreExamples}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            📚 Load More Examples (Batch {currentBatch + 1}/{maxBatches})
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Get 5 more fresh practice examples to master this rule
          </p>
        </div>
      )}


    </div>
  );
}
