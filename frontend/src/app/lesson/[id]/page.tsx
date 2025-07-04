'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { curriculumService } from '@/lib/curriculum-service';
import InteractiveLessonRouter from '@/components/lessons/InteractiveLessonRouter';
import { UserProgressProvider } from '@/contexts/UserProgressContext';
import { motion } from 'framer-motion';

// Mock data generator for interactive exercises
const generateInteractiveExercises = (lessonData: any) => {
  const exercises = [];
  
  // Add flashcards for vocabulary lessons
  if (lessonData.lessonType === 'vocabulary' || lessonData.lessonType === 'VOCABULARY') {
    exercises.push({
      id: `${lessonData.id}-flashcards`,
      type: 'flashcards',
      data: {
        vocabularyItems: [
          { id: '1', turkish: 'Merhaba', english: 'Hello', pronunciation: 'mer-ha-ba' },
          { id: '2', turkish: 'Teşekkürler', english: 'Thank you', pronunciation: 'te-shek-kür-ler' },
          { id: '3', turkish: 'Günaydın', english: 'Good morning', pronunciation: 'gün-ay-dın' },
          { id: '4', turkish: 'İyi akşamlar', english: 'Good evening', pronunciation: 'i-yi ak-sham-lar' },
          { id: '5', turkish: 'Hoşça kal', english: 'Goodbye', pronunciation: 'hosh-cha kal' }
        ]
      },
      points: 50
    });

    exercises.push({
      id: `${lessonData.id}-picture-matching`,
      type: 'picture_matching',
      data: {
        title: 'Match Turkish Words with Pictures',
        items: [
          { id: '1', turkish: 'Ev', english: 'House', imageUrl: '/images/house.svg' },
          { id: '2', turkish: 'Araba', english: 'Car', imageUrl: '/images/car.svg' },
          { id: '3', turkish: 'Kitap', english: 'Book', imageUrl: '/images/book.svg' },
          { id: '4', turkish: 'Su', english: 'Water', imageUrl: '/images/water.svg' }
        ]
      },
      points: 40
    });
  }

  // Add grammar exercises for grammar lessons
  if (lessonData.lessonType === 'grammar' || lessonData.lessonType === 'GRAMMAR') {
    exercises.push({
      id: `${lessonData.id}-grammar-animation`,
      type: 'grammar_animation',
      data: {
        rule: {
          id: 'vowel-harmony-1',
          title: 'Turkish Vowel Harmony',
          description: 'Learn how vowels change in Turkish suffixes',
          animation: 'vowel_harmony',
          difficulty: 2,
          examples: [
            {
              base: 'ev',
              suffix: 'ler',
              result: 'evler',
              translation: 'houses',
              explanation: 'The suffix -ler is used because "ev" contains the front vowel "e"'
            },
            {
              base: 'araba',
              suffix: 'lar',
              result: 'arabalar',
              translation: 'cars',
              explanation: 'The suffix -lar is used because "araba" contains the back vowel "a"'
            }
          ]
        }
      },
      points: 60
    });

    exercises.push({
      id: `${lessonData.id}-sentence-builder`,
      type: 'sentence_builder',
      data: {
        exercises: [
          {
            id: 'sentence-1',
            instruction: 'Build the sentence: "I am a student"',
            correctSentence: 'Ben bir öğrenciyim',
            translation: 'I am a student',
            wordTiles: [
              { id: 'ben', word: 'Ben', type: 'subject', correctPosition: 0, translation: 'I' },
              { id: 'bir', word: 'bir', type: 'article', correctPosition: 1, translation: 'a/an' },
              { id: 'ogrenci', word: 'öğrenciyim', type: 'verb', correctPosition: 2, translation: 'am a student' }
            ],
            grammarFocus: 'Subject + Article + Predicate',
            difficulty: 1,
            hints: ['Start with the subject pronoun', 'Add the article', 'End with the predicate']
          }
        ]
      },
      points: 50
    });
  }

  // Add reading exercises for reading lessons
  if (lessonData.lessonType === 'reading' || lessonData.lessonType === 'READING') {
    exercises.push({
      id: `${lessonData.id}-interactive-reading`,
      type: 'reading',
      data: {
        passage: {
          id: 'reading-1',
          title: 'Türkiye\'de Bir Gün',
          content: 'Merhaba! Benim adım Ahmet. Ben Türkiye\'de yaşıyorum. Her sabah erken kalkıyorum. Kahvaltı yapıyorum ve işe gidiyorum. Akşam eve geldiğimde televizyon izliyorum.',
          level: 'A1',
          topic: 'Daily Life',
          estimatedTime: 5,
          vocabulary: [
            { turkish: 'merhaba', english: 'hello', pronunciation: 'mer-ha-ba' },
            { turkish: 'adım', english: 'my name', pronunciation: 'a-dım' },
            { turkish: 'yaşıyorum', english: 'I live', pronunciation: 'ya-shı-yo-rum' },
            { turkish: 'sabah', english: 'morning', pronunciation: 'sa-bah' },
            { turkish: 'kahvaltı', english: 'breakfast', pronunciation: 'kah-val-tı' }
          ],
          comprehensionQuestions: [
            {
              id: 'q1',
              question: 'What is the person\'s name?',
              options: ['Ali', 'Mehmet', 'Ahmet', 'Mustafa'],
              correctAnswer: 2,
              explanation: 'The text says "Benim adım Ahmet" which means "My name is Ahmet"'
            }
          ]
        }
      },
      points: 70
    });
  }

  // Add personalization exercise
  exercises.push({
    id: `${lessonData.id}-personalization`,
    type: 'personalization',
    data: {
      questions: [
        {
          id: 'personal-1',
          question: 'What is your name and where are you from?',
          questionTurkish: 'Adınız ne ve nerelisiniz?',
          category: 'personal',
          difficulty: 1,
          suggestedAnswers: [
            'Benim adım [name]. Ben [country]\'den geliyorum.',
            'Ben [name]. [city]\'de yaşıyorum.'
          ]
        }
      ],
      maxQuestions: 1
    },
    points: 30
  });

  // Add mini-game
  exercises.push({
    id: `${lessonData.id}-mini-game`,
    type: 'mini_games',
    data: {
      games: [
        {
          id: 'memory-1',
          title: 'Turkish-English Memory Match',
          titleTurkish: 'Türkçe-İngilizce Hafıza Oyunu',
          type: 'memory_match',
          difficulty: 2,
          instructions: 'Match Turkish words with their English translations',
          data: {
            pairs: [
              { id: 'pair1', turkish: 'Merhaba', english: 'Hello' },
              { id: 'pair2', turkish: 'Teşekkürler', english: 'Thank you' },
              { id: 'pair3', turkish: 'Evet', english: 'Yes' },
              { id: 'pair4', turkish: 'Hayır', english: 'No' }
            ]
          }
        }
      ]
    },
    points: 40
  });

  return exercises;
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      setError(null);
      const curriculumData = await curriculumService.getCurriculumData();
      const lesson = curriculumData.lessons.find(l => l.id === lessonId);
      
      if (!lesson) {
        setError('Lesson not found');
        return;
      }

      // Transform lesson data to include interactive exercises
      const interactiveLesson = {
        ...lesson,
        exercises: generateInteractiveExercises(lesson),
        difficulty: lesson.difficultyLevel || 1,
        estimatedTime: lesson.estimatedDuration || 15
      };

      setLessonData(interactiveLesson);
    } catch (error) {
      console.error('Failed to load lesson:', error);
      setError('Failed to load lesson data');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = (lessonId: string, score: number, timeSpent: number) => {
    console.log('Lesson completed:', { lessonId, score, timeSpent });
    // Here you would typically save progress to the backend
    // For now, we'll just redirect back to courses
    setTimeout(() => {
      router.push('/courses');
    }, 3000);
  };

  const handleExerciseComplete = (exerciseId: string, score: number, timeSpent: number) => {
    console.log('Exercise completed:', { exerciseId, score, timeSpent });
    // Here you would typically save exercise progress to the backend
  };

  if (loading) {
    return (
      <UserProgressProvider>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <span className="ml-3 text-lg text-gray-600">Loading lesson...</span>
        </div>
      </UserProgressProvider>
    );
  }

  if (error || !lessonData) {
    return (
      <UserProgressProvider>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Lesson Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The requested lesson could not be found.'}</p>
            <button
              onClick={() => router.push('/courses')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </UserProgressProvider>
    );
  }

  return (
    <UserProgressProvider>
      <InteractiveLessonRouter
        lesson={lessonData}
        userProgress={{}} // You would load actual user progress here
        onLessonComplete={handleLessonComplete}
        onExerciseComplete={handleExerciseComplete}
      />
    </UserProgressProvider>
  );
}
