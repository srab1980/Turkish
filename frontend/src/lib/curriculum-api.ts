// Real Curriculum API Service
// Based on Istanbul Turkish for Foreigners A1 Level textbooks
// Ders Kitabı (Course Book) + Çalışma Kitabı (Workbook)

import { Course, Unit, Lesson, Exercise, ExerciseType, VocabularyItem, Question } from '@/types/lesson.types';

// A1 Level: 6 Units (Courses), each with 3 Lessons
// Each lesson has 7 components: Reading, Writing, Speaking, Listening, Vocabulary, Grammar, Turkish Culture
// Plus final exam at the end of each unit

const A1_CURRICULUM_STRUCTURE = {
  level: 'A1',
  totalUnits: 6,
  lessonsPerUnit: 3,
  componentsPerLesson: 7,
  componentTypes: [
    'reading',      // Okuma
    'writing',      // Yazma  
    'speaking',     // Konuşma
    'listening',    // Dinleme
    'vocabulary',   // Kelimeler
    'grammar',      // Dil Bilgisi
    'culture'       // Türk Kültürü
  ] as ExerciseType[]
};

// Real A1 Course based on Istanbul Turkish textbook
const A1_COURSE: Course = {
  id: 'a1-istanbul-turkish',
  title: 'İstanbul Yabancılar İçin Türkçe A1',
  description: 'Complete A1 level Turkish course based on Istanbul University curriculum',
  language: 'English',
  targetLanguage: 'Turkish',
  difficultyLevel: 'A1',
  estimatedHours: 90, // 6 units × 15 hours each
  isPublished: true,
  units: [], // Will be populated below
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Real A1 Units based on Istanbul Turkish textbook
const A1_UNITS: Omit<Unit, 'lessons'>[] = [
  {
    id: 'unit-1',
    courseId: 'a1-istanbul-turkish',
    title: 'Tanışma ve Selamlaşma (Meeting and Greeting)',
    description: 'Basic introductions, greetings, and personal information',
    unitNumber: 1,
    estimatedHours: 15,
    difficultyLevel: 'A1',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'unit-2', 
    courseId: 'a1-istanbul-turkish',
    title: 'Aile ve Kişisel Bilgiler (Family and Personal Information)',
    description: 'Family members, personal details, and basic descriptions',
    unitNumber: 2,
    estimatedHours: 15,
    difficultyLevel: 'A1',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'unit-3',
    courseId: 'a1-istanbul-turkish', 
    title: 'Günlük Yaşam (Daily Life)',
    description: 'Daily routines, time, and basic activities',
    unitNumber: 3,
    estimatedHours: 15,
    difficultyLevel: 'A1',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'unit-4',
    courseId: 'a1-istanbul-turkish',
    title: 'Yemek ve İçecek (Food and Drinks)', 
    description: 'Food vocabulary, ordering, and dining experiences',
    unitNumber: 4,
    estimatedHours: 15,
    difficultyLevel: 'A1',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'unit-5',
    courseId: 'a1-istanbul-turkish',
    title: 'Alışveriş ve Giyim (Shopping and Clothing)',
    description: 'Shopping vocabulary, clothing, and basic transactions',
    unitNumber: 5,
    estimatedHours: 15,
    difficultyLevel: 'A1',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'unit-6',
    courseId: 'a1-istanbul-turkish',
    title: 'Seyahat ve Ulaşım (Travel and Transportation)',
    description: 'Transportation, directions, and travel vocabulary',
    unitNumber: 6,
    estimatedHours: 15,
    difficultyLevel: 'A1',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Generate lessons for each unit (3 lessons per unit)
const generateLessonsForUnit = (unit: Omit<Unit, 'lessons'>): Lesson[] => {
  const lessons: Lesson[] = [];

  for (let lessonNum = 1; lessonNum <= 3; lessonNum++) {
    const lessonId = `${unit.id}-lesson-${lessonNum}`;
    
    // Generate exercises for this lesson (7 components)
    const exercises: Exercise[] = A1_CURRICULUM_STRUCTURE.componentTypes.map((type, index) => ({
      id: `${lessonId}-${type}`,
      lessonId,
      title: getExerciseTitle(type),
      description: getExerciseDescription(type),
      type,
      data: generateExerciseData(type, unit.unitNumber, lessonNum),
      points: getExercisePoints(type),
      estimatedMinutes: getExerciseMinutes(type),
      difficultyLevel: 'A1',
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    lessons.push({
      id: lessonId,
      unitId: unit.id,
      title: getLessonTitle(unit.unitNumber, lessonNum),
      description: getLessonDescription(unit.unitNumber, lessonNum),
      lessonNumber: lessonNum,
      estimatedMinutes: 60, // 1 hour per lesson
      difficultyLevel: 'A1',
      isPublished: true,
      exercises,
      prerequisites: lessonNum > 1 ? [`${unit.id}-lesson-${lessonNum - 1}`] : [],
      learningObjectives: getLearningObjectives(unit.unitNumber, lessonNum),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return lessons;
};

// Helper functions for generating lesson content
const getExerciseTitle = (type: ExerciseType): string => {
  const titles: Record<ExerciseType, string> = {
    reading: 'Okuma (Reading)',
    writing: 'Yazma (Writing)',
    speaking: 'Konuşma (Speaking)',
    listening: 'Dinleme (Listening)',
    vocabulary: 'Kelimeler (Vocabulary)',
    grammar: 'Dil Bilgisi (Grammar)',
    culture: 'Türk Kültürü (Turkish Culture)',
    flashcards: 'Kelime Kartları (Flashcards)',
    picture_matching: 'Resim Eşleştirme (Picture Matching)',
    audio_listening: 'Ses Dinleme (Audio Listening)',
    sentence_builder: 'Cümle Kurma (Sentence Builder)',
    word_scramble: 'Kelime Karıştırma (Word Scramble)',
    mini_games: 'Mini Oyunlar (Mini Games)',
    pronunciation: 'Telaffuz (Pronunciation)',
    error_detection: 'Hata Bulma (Error Detection)',
    grammar_animation: 'Gramer Animasyonu (Grammar Animation)',
    personalization: 'Kişiselleştirme (Personalization)',
    dialogue: 'Diyalog (Dialogue)',
    quiz: 'Quiz',
    fill_in_blanks: 'Boşluk Doldurma (Fill in Blanks)',
    matching: 'Eşleştirme (Matching)'
  };
  return titles[type] || type;
};

const getExerciseDescription = (type: ExerciseType): string => {
  const descriptions: Record<ExerciseType, string> = {
    reading: 'Practice reading comprehension with Turkish texts',
    writing: 'Develop writing skills through guided exercises',
    speaking: 'Practice pronunciation and speaking skills',
    listening: 'Improve listening comprehension with audio exercises',
    vocabulary: 'Learn and practice new Turkish vocabulary',
    grammar: 'Master Turkish grammar rules and structures',
    culture: 'Explore Turkish culture and traditions',
    flashcards: 'Review vocabulary with interactive flashcards',
    picture_matching: 'Match pictures with Turkish words',
    audio_listening: 'Listen and comprehend Turkish audio',
    sentence_builder: 'Build correct Turkish sentences',
    word_scramble: 'Unscramble Turkish words',
    mini_games: 'Fun games to reinforce learning',
    pronunciation: 'Practice Turkish pronunciation',
    error_detection: 'Find and correct Turkish grammar errors',
    grammar_animation: 'Learn grammar through animations',
    personalization: 'Personalized learning questions',
    dialogue: 'Practice conversational Turkish',
    quiz: 'Test your Turkish knowledge',
    fill_in_blanks: 'Complete sentences with correct words',
    matching: 'Match related Turkish concepts'
  };
  return descriptions[type] || `Practice ${type} skills`;
};

const getExercisePoints = (type: ExerciseType): number => {
  const points: Record<ExerciseType, number> = {
    reading: 100,
    writing: 100,
    speaking: 100,
    listening: 100,
    vocabulary: 80,
    grammar: 90,
    culture: 70,
    flashcards: 50,
    picture_matching: 40,
    audio_listening: 80,
    sentence_builder: 70,
    word_scramble: 30,
    mini_games: 60,
    pronunciation: 80,
    error_detection: 70,
    grammar_animation: 60,
    personalization: 50,
    dialogue: 90,
    quiz: 100,
    fill_in_blanks: 60,
    matching: 50
  };
  return points[type] || 50;
};

const getExerciseMinutes = (type: ExerciseType): number => {
  const minutes: Record<ExerciseType, number> = {
    reading: 15,
    writing: 20,
    speaking: 10,
    listening: 12,
    vocabulary: 8,
    grammar: 15,
    culture: 10,
    flashcards: 5,
    picture_matching: 3,
    audio_listening: 8,
    sentence_builder: 7,
    word_scramble: 3,
    mini_games: 10,
    pronunciation: 8,
    error_detection: 7,
    grammar_animation: 6,
    personalization: 5,
    dialogue: 12,
    quiz: 15,
    fill_in_blanks: 6,
    matching: 5
  };
  return minutes[type] || 5;
};

const getLessonTitle = (unitNumber: number, lessonNumber: number): string => {
  const lessonTitles: Record<string, string[]> = {
    '1': [
      'Merhaba! (Hello!)',
      'Kendimi Tanıtıyorum (Introducing Myself)',
      'Sayılar ve Alfabe (Numbers and Alphabet)'
    ],
    '2': [
      'Ailem (My Family)',
      'Kişisel Bilgiler (Personal Information)',
      'Fiziksel Özellikler (Physical Features)'
    ],
    '3': [
      'Günlük Rutinler (Daily Routines)',
      'Saat ve Zaman (Time and Clock)',
      'Haftanın Günleri (Days of the Week)'
    ],
    '4': [
      'Yemek Zamanı (Meal Time)',
      'Restoranda (At the Restaurant)',
      'Türk Mutfağı (Turkish Cuisine)'
    ],
    '5': [
      'Alışveriş Merkezinde (At the Shopping Mall)',
      'Kıyafetler (Clothes)',
      'Renkler ve Bedenler (Colors and Sizes)'
    ],
    '6': [
      'Ulaşım Araçları (Transportation)',
      'Yol Tarifi (Directions)',
      'Seyahat Planları (Travel Plans)'
    ]
  };

  return lessonTitles[unitNumber.toString()]?.[lessonNumber - 1] || `Ders ${lessonNumber}`;
};

const getLessonDescription = (unitNumber: number, lessonNumber: number): string => {
  const descriptions: Record<string, string[]> = {
    '1': [
      'Learn basic greetings and how to say hello in Turkish',
      'Practice introducing yourself and asking about others',
      'Master Turkish numbers 1-20 and the Turkish alphabet'
    ],
    '2': [
      'Learn family member names and relationships',
      'Practice sharing personal information',
      'Describe physical appearance and characteristics'
    ],
    '3': [
      'Talk about daily activities and routines',
      'Learn to tell time and express time-related concepts',
      'Practice days of the week and scheduling'
    ],
    '4': [
      'Learn food vocabulary and meal-related expressions',
      'Practice ordering food and dining conversations',
      'Explore Turkish cuisine and food culture'
    ],
    '5': [
      'Navigate shopping environments and transactions',
      'Learn clothing vocabulary and shopping expressions',
      'Practice describing colors, sizes, and preferences'
    ],
    '6': [
      'Learn transportation vocabulary and travel expressions',
      'Practice asking for and giving directions',
      'Plan trips and discuss travel arrangements'
    ]
  };

  return descriptions[unitNumber.toString()]?.[lessonNumber - 1] || `Lesson ${lessonNumber} description`;
};

const getLearningObjectives = (unitNumber: number, lessonNumber: number): string[] => {
  const objectives: Record<string, string[][]> = {
    '1': [
      ['Greet people in Turkish', 'Use basic courtesy expressions', 'Introduce yourself'],
      ['State your name and nationality', 'Ask about others\' information', 'Use personal pronouns'],
      ['Count from 1-20', 'Spell words using Turkish alphabet', 'Recognize Turkish sounds']
    ],
    '2': [
      ['Name family members', 'Describe family relationships', 'Talk about family size'],
      ['Share personal details', 'Ask about age and occupation', 'Use possessive forms'],
      ['Describe appearance', 'Use adjectives for physical features', 'Compare people']
    ],
    '3': [
      ['Describe daily activities', 'Use time expressions', 'Talk about routines'],
      ['Tell time accurately', 'Express duration', 'Schedule activities'],
      ['Name days of the week', 'Plan weekly activities', 'Use temporal expressions']
    ],
    '4': [
      ['Name common foods', 'Express food preferences', 'Discuss meals'],
      ['Order food in restaurants', 'Ask about menu items', 'Handle dining situations'],
      ['Describe Turkish dishes', 'Discuss cooking methods', 'Express taste preferences']
    ],
    '5': [
      ['Navigate shopping environments', 'Ask about prices', 'Make purchases'],
      ['Name clothing items', 'Describe clothing', 'Express preferences'],
      ['Use color vocabulary', 'Discuss sizes', 'Compare items']
    ],
    '6': [
      ['Name transportation methods', 'Discuss travel options', 'Buy tickets'],
      ['Ask for directions', 'Give directions', 'Describe locations'],
      ['Plan trips', 'Discuss travel experiences', 'Use future tense']
    ]
  };

  return objectives[unitNumber.toString()]?.[lessonNumber - 1] || ['Complete lesson objectives'];
};

const generateExerciseData = (type: ExerciseType, unitNumber: number, lessonNumber: number): any => {
  // This will be expanded with real content from the textbooks
  // For now, providing basic structure

  switch (type) {
    case 'vocabulary':
      return { vocabularyItems: getVocabularyForLesson(unitNumber, lessonNumber) };
    case 'grammar':
      return { rule: getGrammarRuleForLesson(unitNumber, lessonNumber) };
    case 'reading':
      return { text: getReadingTextForLesson(unitNumber, lessonNumber) };
    case 'listening':
      return { audioUrl: getAudioForLesson(unitNumber, lessonNumber) };
    case 'speaking':
      return { prompts: getSpeakingPromptsForLesson(unitNumber, lessonNumber) };
    case 'writing':
      return { prompts: getWritingPromptsForLesson(unitNumber, lessonNumber) };
    case 'culture':
      return { content: getCultureContentForLesson(unitNumber, lessonNumber) };
    default:
      return { items: [] };
  }
};

// Helper functions to generate content (to be expanded with real textbook content)
const getVocabularyForLesson = (unitNumber: number, lessonNumber: number): VocabularyItem[] => {
  // Sample vocabulary - will be replaced with real textbook content
  const vocabularyByUnit: Record<string, VocabularyItem[][]> = {
    '1': [
      [
        { id: '1-1-1', turkish: 'Merhaba', english: 'Hello', pronunciation: 'mer-ha-ba' },
        { id: '1-1-2', turkish: 'Günaydın', english: 'Good morning', pronunciation: 'gün-ay-dın' },
        { id: '1-1-3', turkish: 'İyi akşamlar', english: 'Good evening', pronunciation: 'i-yi ak-şam-lar' },
        { id: '1-1-4', turkish: 'Hoşça kal', english: 'Goodbye', pronunciation: 'hoş-ça kal' },
        { id: '1-1-5', turkish: 'Teşekkürler', english: 'Thank you', pronunciation: 'te-şek-kür-ler' }
      ],
      [
        { id: '1-2-1', turkish: 'Ben', english: 'I', pronunciation: 'ben' },
        { id: '1-2-2', turkish: 'Sen', english: 'You', pronunciation: 'sen' },
        { id: '1-2-3', turkish: 'Adım', english: 'My name', pronunciation: 'a-dım' },
        { id: '1-2-4', turkish: 'Türkiye', english: 'Turkey', pronunciation: 'tür-ki-ye' },
        { id: '1-2-5', turkish: 'Öğrenci', english: 'Student', pronunciation: 'öğ-ren-ci' }
      ],
      [
        { id: '1-3-1', turkish: 'Bir', english: 'One', pronunciation: 'bir' },
        { id: '1-3-2', turkish: 'İki', english: 'Two', pronunciation: 'i-ki' },
        { id: '1-3-3', turkish: 'Üç', english: 'Three', pronunciation: 'üç' },
        { id: '1-3-4', turkish: 'Dört', english: 'Four', pronunciation: 'dört' },
        { id: '1-3-5', turkish: 'Beş', english: 'Five', pronunciation: 'beş' }
      ]
    ]
  };

  return vocabularyByUnit[unitNumber.toString()]?.[lessonNumber - 1] || [];
};

const getGrammarRuleForLesson = (unitNumber: number, lessonNumber: number): any => {
  // Sample grammar rules - will be replaced with real textbook content
  return {
    id: `grammar-${unitNumber}-${lessonNumber}`,
    title: 'Turkish Grammar Rule',
    description: 'Basic Turkish grammar concept',
    animation: 'grammar-animation',
    difficulty: 1,
    examples: []
  };
};

const getReadingTextForLesson = (unitNumber: number, lessonNumber: number): any => {
  return {
    title: 'Reading Exercise',
    content: 'Sample Turkish text for reading practice...',
    questions: []
  };
};

const getAudioForLesson = (unitNumber: number, lessonNumber: number): string => {
  return `/audio/unit-${unitNumber}/lesson-${lessonNumber}.mp3`;
};

const getSpeakingPromptsForLesson = (unitNumber: number, lessonNumber: number): any[] => {
  return [
    { id: '1', prompt: 'Introduce yourself in Turkish', difficulty: 1 }
  ];
};

const getWritingPromptsForLesson = (unitNumber: number, lessonNumber: number): any[] => {
  return [
    { id: '1', prompt: 'Write a short introduction about yourself', difficulty: 1 }
  ];
};

const getCultureContentForLesson = (unitNumber: number, lessonNumber: number): any => {
  return {
    title: 'Turkish Culture',
    content: 'Learn about Turkish culture and traditions...',
    images: [],
    videos: []
  };
};

// Build complete curriculum with all units and lessons
const buildCompleteCurriculum = (): { course: Course; units: Unit[]; lessons: Lesson[] } => {
  const unitsWithLessons: Unit[] = A1_UNITS.map(unit => ({
    ...unit,
    lessons: generateLessonsForUnit(unit)
  }));

  const allLessons: Lesson[] = unitsWithLessons.flatMap(unit => unit.lessons);

  const courseWithUnits: Course = {
    ...A1_COURSE,
    units: unitsWithLessons
  };

  return {
    course: courseWithUnits,
    units: unitsWithLessons,
    lessons: allLessons
  };
};

// Export the curriculum API
export const curriculumApi = {
  getCourse: () => A1_COURSE,
  getUnits: () => A1_UNITS,
  getUnit: (unitId: string) => A1_UNITS.find(unit => unit.id === unitId),
  getLesson: (lessonId: string) => {
    const { lessons } = buildCompleteCurriculum();
    return lessons.find(lesson => lesson.id === lessonId);
  },
  getAllLessons: () => {
    const { lessons } = buildCompleteCurriculum();
    return lessons;
  },
  getLessonsForUnit: (unitId: string) => {
    const unit = A1_UNITS.find(u => u.id === unitId);
    return unit ? generateLessonsForUnit(unit) : [];
  },
  getCompleteCurriculum: buildCompleteCurriculum,

  // Search and filter functions
  searchLessons: (query: string) => {
    const { lessons } = buildCompleteCurriculum();
    return lessons.filter(lesson =>
      lesson.title.toLowerCase().includes(query.toLowerCase()) ||
      lesson.description.toLowerCase().includes(query.toLowerCase())
    );
  },

  filterLessonsByDifficulty: (difficulty: string) => {
    const { lessons } = buildCompleteCurriculum();
    return lessons.filter(lesson => lesson.difficultyLevel === difficulty);
  },

  getLessonsByCategory: (category: string) => {
    const { lessons } = buildCompleteCurriculum();
    return lessons.filter(lesson =>
      lesson.exercises.some(exercise => exercise.type === category)
    );
  }
};

export default curriculumApi;
