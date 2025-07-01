// Mock API service for development when backend is not available
export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  totalUnits: number;
  estimatedHours: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  courseId: string;
  title: string;
  description: string;
  unitNumber: number;
  estimatedHours: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  lessonNumber: number;
  estimatedMinutes: number;
  difficultyLevel: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Turkish A1 Complete Course',
    description: 'Complete beginner Turkish course following Istanbul Book curriculum',
    level: 'A1',
    totalUnits: 12,
    estimatedHours: 120,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Turkish A2 Intermediate',
    description: 'Intermediate Turkish course for A2 level students',
    level: 'A2',
    totalUnits: 15,
    estimatedHours: 150,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockUnits: Unit[] = [
  {
    id: '1',
    courseId: '1',
    title: 'MERHABA - Hello',
    description: 'Introduction to Turkish greetings and basic expressions',
    unitNumber: 1,
    estimatedHours: 10,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    courseId: '1',
    title: 'TANIŞMA - Meeting People',
    description: 'Learning how to introduce yourself and others',
    unitNumber: 2,
    estimatedHours: 15,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    courseId: '1',
    title: 'AİLE - Family',
    description: 'Family members and relationships vocabulary',
    unitNumber: 3,
    estimatedHours: 15,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    courseId: '1',
    title: 'GÜNLÜK HAYAT - Daily Life',
    description: 'Daily routines and activities',
    unitNumber: 4,
    estimatedHours: 15,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    courseId: '1',
    title: 'ZAMAN - Time',
    description: 'Time expressions, days, months, seasons',
    unitNumber: 5,
    estimatedHours: 15,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    courseId: '1',
    title: 'YEMEK - Food',
    description: 'Food vocabulary and dining expressions',
    unitNumber: 6,
    estimatedHours: 15,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    courseId: '1',
    title: 'ALIŞVERİŞ - Shopping',
    description: 'Shopping vocabulary and market conversations',
    unitNumber: 7,
    estimatedHours: 15,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '8',
    courseId: '1',
    title: 'ULAŞIM - Transportation',
    description: 'Transportation methods and directions',
    unitNumber: 8,
    estimatedHours: 15,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '9',
    courseId: '1',
    title: 'SAĞLIK - Health',
    description: 'Health vocabulary and medical expressions',
    unitNumber: 9,
    estimatedHours: 15,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '10',
    courseId: '1',
    title: 'HAVA DURUMU - Weather',
    description: 'Weather conditions and seasonal activities',
    unitNumber: 10,
    estimatedHours: 15,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '11',
    courseId: '1',
    title: 'HOBILER - Hobbies',
    description: 'Leisure activities and personal interests',
    unitNumber: 11,
    estimatedHours: 15,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '12',
    courseId: '1',
    title: 'TATİL - Vacation',
    description: 'Travel vocabulary and holiday expressions',
    unitNumber: 12,
    estimatedHours: 15,
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockLessons: Lesson[] = [
  // Unit 1: MERHABA - Hello
  { id: '1', unitId: '1', title: 'Basic Greetings', description: 'Learn essential Turkish greetings', lessonNumber: 1, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '2', unitId: '1', title: 'Introducing Yourself', description: 'Learn how to introduce yourself in Turkish', lessonNumber: 2, estimatedMinutes: 50, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '3', unitId: '1', title: 'Polite Expressions', description: 'Learn please, thank you, and excuse me', lessonNumber: 3, estimatedMinutes: 40, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 2: TANIŞMA - Meeting People
  { id: '4', unitId: '2', title: 'Personal Information', description: 'Share your name, age, and nationality', lessonNumber: 1, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '5', unitId: '2', title: 'Countries and Nationalities', description: 'Learn country names and nationalities', lessonNumber: 2, estimatedMinutes: 50, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '6', unitId: '2', title: 'Asking Questions', description: 'Learn to ask where are you from?', lessonNumber: 3, estimatedMinutes: 40, difficultyLevel: 'A1', lessonType: 'grammar', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 3: AİLE - Family
  { id: '7', unitId: '3', title: 'Family Members', description: 'Learn vocabulary for family members', lessonNumber: 1, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '8', unitId: '3', title: 'Describing Family', description: 'Talk about your family members', lessonNumber: 2, estimatedMinutes: 50, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '9', unitId: '3', title: 'Possessive Pronouns', description: 'Learn my, your, his, her in Turkish', lessonNumber: 3, estimatedMinutes: 40, difficultyLevel: 'A1', lessonType: 'grammar', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 4: GÜNLÜK HAYAT - Daily Life
  { id: '10', unitId: '4', title: 'Daily Activities', description: 'Learn verbs for daily activities', lessonNumber: 1, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '11', unitId: '4', title: 'Present Tense', description: 'Learn present tense conjugation', lessonNumber: 2, estimatedMinutes: 55, difficultyLevel: 'A1', lessonType: 'grammar', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '12', unitId: '4', title: 'Daily Routine Conversation', description: 'Talk about your daily routine', lessonNumber: 3, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 5: ZAMAN - Time
  { id: '13', unitId: '5', title: 'Telling Time', description: 'Learn to tell time in Turkish', lessonNumber: 1, estimatedMinutes: 50, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '14', unitId: '5', title: 'Days and Months', description: 'Learn days of the week and months', lessonNumber: 2, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '15', unitId: '5', title: 'Making Appointments', description: 'Schedule meetings and appointments', lessonNumber: 3, estimatedMinutes: 50, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 6: YEMEK - Food
  { id: '16', unitId: '6', title: 'Food Vocabulary', description: 'Learn names of common foods', lessonNumber: 1, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '17', unitId: '6', title: 'At the Restaurant', description: 'Order food at a restaurant', lessonNumber: 2, estimatedMinutes: 50, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '18', unitId: '6', title: 'Food Preferences', description: 'Express likes and dislikes about food', lessonNumber: 3, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 7: ALIŞVERİŞ - Shopping
  { id: '19', unitId: '7', title: 'Shopping Vocabulary', description: 'Learn shopping and market vocabulary', lessonNumber: 1, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '20', unitId: '7', title: 'Numbers and Prices', description: 'Learn numbers and how to ask prices', lessonNumber: 2, estimatedMinutes: 50, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '21', unitId: '7', title: 'At the Market', description: 'Practice shopping conversations', lessonNumber: 3, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 8: ULAŞIM - Transportation
  { id: '22', unitId: '8', title: 'Transportation Vocabulary', description: 'Learn transportation methods', lessonNumber: 1, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '23', unitId: '8', title: 'Giving Directions', description: 'Learn to give and ask for directions', lessonNumber: 2, estimatedMinutes: 50, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '24', unitId: '8', title: 'Location Prepositions', description: 'Learn prepositions for locations', lessonNumber: 3, estimatedMinutes: 40, difficultyLevel: 'A1', lessonType: 'grammar', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 9: SAĞLIK - Health
  { id: '25', unitId: '9', title: 'Body Parts', description: 'Learn vocabulary for body parts', lessonNumber: 1, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '26', unitId: '9', title: 'Health Problems', description: 'Express health problems and symptoms', lessonNumber: 2, estimatedMinutes: 50, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '27', unitId: '9', title: 'At the Doctor', description: 'Practice doctor visit conversations', lessonNumber: 3, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 10: HAVA DURUMU - Weather
  { id: '28', unitId: '10', title: 'Weather Vocabulary', description: 'Learn weather conditions and seasons', lessonNumber: 1, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '29', unitId: '10', title: 'Talking About Weather', description: 'Discuss weather and seasons', lessonNumber: 2, estimatedMinutes: 40, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '30', unitId: '10', title: 'Seasonal Activities', description: 'Learn activities for different seasons', lessonNumber: 3, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 11: HOBILER - Hobbies
  { id: '31', unitId: '11', title: 'Hobby Vocabulary', description: 'Learn vocabulary for hobbies and interests', lessonNumber: 1, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '32', unitId: '11', title: 'Talking About Hobbies', description: 'Discuss your hobbies and interests', lessonNumber: 2, estimatedMinutes: 50, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '33', unitId: '11', title: 'Frequency Adverbs', description: 'Learn always, sometimes, never', lessonNumber: 3, estimatedMinutes: 40, difficultyLevel: 'A1', lessonType: 'grammar', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 12: TATİL - Vacation
  { id: '34', unitId: '12', title: 'Travel Vocabulary', description: 'Learn travel and vacation vocabulary', lessonNumber: 1, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '35', unitId: '12', title: 'Past Tense', description: 'Learn past tense for vacation stories', lessonNumber: 2, estimatedMinutes: 55, difficultyLevel: 'A1', lessonType: 'grammar', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '36', unitId: '12', title: 'Vacation Stories', description: 'Tell stories about your vacation', lessonNumber: 3, estimatedMinutes: 50, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }
];

const mockExercises: Exercise[] = [
  // Unit 1: MERHABA - Hello
  { id: '1', lessonId: '1', title: 'Greeting Vocabulary Match', description: 'Match Turkish greetings with their meanings', type: 'matching', estimatedMinutes: 10, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '2', lessonId: '1', title: 'Greeting Pronunciation', description: 'Practice pronouncing Turkish greetings correctly', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '3', lessonId: '2', title: 'Self Introduction Practice', description: 'Practice introducing yourself using Ben... Adım...', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '4', lessonId: '2', title: 'Introduction Fill-in-Blanks', description: 'Complete introduction sentences', type: 'fill-in-blanks', estimatedMinutes: 10, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '5', lessonId: '3', title: 'Polite Expressions Quiz', description: 'Practice please, thank you, excuse me', type: 'quiz', estimatedMinutes: 12, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 2: TANIŞMA - Meeting People
  { id: '6', lessonId: '4', title: 'Personal Info Dialogue', description: 'Practice sharing personal information', type: 'dialogue', estimatedMinutes: 15, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '7', lessonId: '5', title: 'Countries Matching', description: 'Match countries with nationalities', type: 'matching', estimatedMinutes: 12, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '8', lessonId: '6', title: 'Question Formation', description: 'Practice forming questions in Turkish', type: 'grammar', estimatedMinutes: 15, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 3: AİLE - Family
  { id: '9', lessonId: '7', title: 'Family Vocabulary Quiz', description: 'Test your family member vocabulary', type: 'quiz', estimatedMinutes: 10, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '10', lessonId: '8', title: 'Family Description', description: 'Describe your family members', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '11', lessonId: '9', title: 'Possessive Practice', description: 'Practice possessive pronouns', type: 'grammar', estimatedMinutes: 12, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 4: GÜNLÜK HAYAT - Daily Life
  { id: '12', lessonId: '10', title: 'Daily Activities Vocabulary', description: 'Learn daily activity verbs', type: 'vocabulary', estimatedMinutes: 15, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '13', lessonId: '11', title: 'Present Tense Conjugation', description: 'Practice present tense verb forms', type: 'grammar', estimatedMinutes: 20, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '14', lessonId: '12', title: 'Daily Routine Speaking', description: 'Talk about your daily routine', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 5: ZAMAN - Time
  { id: '15', lessonId: '13', title: 'Time Telling Practice', description: 'Practice telling time in Turkish', type: 'listening', estimatedMinutes: 15, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '16', lessonId: '14', title: 'Calendar Vocabulary', description: 'Learn days and months vocabulary', type: 'vocabulary', estimatedMinutes: 12, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '17', lessonId: '15', title: 'Appointment Dialogue', description: 'Practice making appointments', type: 'dialogue', estimatedMinutes: 18, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },

  // Unit 6: YEMEK - Food
  { id: '18', lessonId: '16', title: 'Food Vocabulary Quiz', description: 'Test your food vocabulary knowledge', type: 'quiz', estimatedMinutes: 12, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '19', lessonId: '17', title: 'Restaurant Ordering', description: 'Practice ordering food at a restaurant', type: 'dialogue', estimatedMinutes: 20, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: '20', lessonId: '18', title: 'Food Preferences Speaking', description: 'Express your food likes and dislikes', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1', isPublished: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }
];

class MockApiService {
  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getCourses(): Promise<Course[]> {
    await this.delay();
    return mockCourses;
  }

  async getCourse(id: string): Promise<Course | null> {
    await this.delay();
    return mockCourses.find(course => course.id === id) || null;
  }

  async getUnits(courseId?: string): Promise<Unit[]> {
    await this.delay();
    if (courseId) {
      return mockUnits.filter(unit => unit.courseId === courseId);
    }
    return mockUnits;
  }

  async getLessons(unitId?: string): Promise<Lesson[]> {
    await this.delay();
    if (unitId) {
      return mockLessons.filter(lesson => lesson.unitId === unitId);
    }
    return mockLessons;
  }

  async getLesson(id: string): Promise<Lesson | null> {
    await this.delay();
    return mockLessons.find(lesson => lesson.id === id) || null;
  }

  async getExercises(lessonId?: string): Promise<Exercise[]> {
    await this.delay();
    if (lessonId) {
      return mockExercises.filter(exercise => exercise.lessonId === lessonId);
    }
    return mockExercises;
  }

  async getExercise(id: string): Promise<Exercise | null> {
    await this.delay();
    return mockExercises.find(exercise => exercise.id === id) || null;
  }

  // User progress mock data
  async getUserProgress(userId: string) {
    await this.delay();
    return {
      currentLevel: 'A1',
      levelProgress: 75,
      totalXP: 1250,
      completedLessons: 12,
      totalLessons: 24,
      streak: 5,
      averageAccuracy: 87
    };
  }

  // Lesson content mock
  async getLessonContent(lessonId: string) {
    await this.delay();
    return {
      id: lessonId,
      title: 'Basic Greetings',
      subLessons: [
        {
          id: '1',
          type: 'preparation',
          title: 'Lesson Introduction',
          content: 'Welcome to Turkish greetings lesson!'
        },
        {
          id: '2',
          type: 'vocabulary',
          title: 'Greeting Words',
          content: 'Learn basic greeting vocabulary'
        },
        {
          id: '3',
          type: 'listening',
          title: 'Listen to Greetings',
          content: 'Practice listening to Turkish greetings'
        },
        {
          id: '4',
          type: 'speaking',
          title: 'Practice Speaking',
          content: 'Practice pronouncing Turkish greetings'
        }
      ]
    };
  }
}

export const mockApiService = new MockApiService();
export default mockApiService;
