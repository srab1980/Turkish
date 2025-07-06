/**
 * TypeScript interfaces for Turkish Learning App
 * Provides type safety for lesson and exercise data
 */

// Base interfaces
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Difficulty levels
export type DifficultyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// Exercise types
export type ExerciseType = 
  | 'flashcards'
  | 'picture_matching'
  | 'audio_listening'
  | 'sentence_builder'
  | 'word_scramble'
  | 'reading'
  | 'mini_games'
  | 'pronunciation'
  | 'error_detection'
  | 'grammar_animation'
  | 'personalization'
  | 'vocabulary'
  | 'dialogue'
  | 'quiz'
  | 'speaking'
  | 'fill_in_blanks'
  | 'listening'
  | 'matching';

// Vocabulary item interface
export interface VocabularyItem {
  id: string;
  turkish: string;
  english: string;
  pronunciation?: string;
  imageUrl?: string;
  audioUrl?: string;
}

// Question interface for quizzes and personalization
export interface Question {
  id: string;
  question: string;
  questionTurkish?: string;
  options?: string[];
  correctAnswer?: number | string;
  explanation?: string;
  category?: string;
  difficulty?: number;
  suggestedAnswers?: string[];
}

// Word tile for sentence builder
export interface WordTile {
  id: string;
  word: string;
  type: 'subject' | 'verb' | 'object' | 'article' | 'adjective' | 'adverb';
  correctPosition: number;
  translation?: string;
}

// Sentence builder exercise
export interface SentenceBuilderExercise {
  id: string;
  instruction: string;
  correctSentence: string;
  translation: string;
  wordTiles: WordTile[];
  grammarFocus: string;
  difficulty: number;
  hints?: string[];
}

// Grammar rule for animations
export interface GrammarRule {
  id: string;
  title: string;
  description: string;
  animation: string;
  difficulty: number;
  examples: Array<{
    base: string;
    suffix: string;
    result: string;
    translation: string;
    explanation: string;
  }>;
}

// Exercise data union type
export type ExerciseData = 
  | { vocabularyItems: VocabularyItem[] }
  | { questions: Question[]; maxQuestions?: number }
  | { exercises: SentenceBuilderExercise[] }
  | { rule: GrammarRule }
  | { pairs: Array<{ id: string; left: string; right: string }> }
  | { games: any[] }
  | { words: VocabularyItem[] }
  | { sentences: any[] }
  | { prompts: any[] }
  | { conversation: any[] }
  | { audioUrl: string; transcript: string; questions: Question[] }
  | { items: Array<{ id: string; turkish: string; english: string; imageUrl: string }> };

// Exercise interface
export interface Exercise extends BaseEntity {
  lessonId: string;
  title: string;
  description: string;
  type: ExerciseType;
  data: ExerciseData;
  points: number;
  estimatedMinutes: number;
  difficultyLevel: DifficultyLevel;
  isPublished: boolean;
}

// Lesson interface
export interface Lesson extends BaseEntity {
  unitId: string;
  title: string;
  description: string;
  lessonNumber: number;
  estimatedMinutes: number;
  difficultyLevel: DifficultyLevel;
  isPublished: boolean;
  exercises: Exercise[];
  prerequisites?: string[];
  learningObjectives?: string[];
}

// Unit interface
export interface Unit extends BaseEntity {
  courseId: string;
  title: string;
  description: string;
  unitNumber: number;
  estimatedHours: number;
  difficultyLevel: DifficultyLevel;
  isPublished: boolean;
  lessons: Lesson[];
}

// Course interface
export interface Course extends BaseEntity {
  title: string;
  description: string;
  language: string;
  targetLanguage: string;
  difficultyLevel: DifficultyLevel;
  estimatedHours: number;
  isPublished: boolean;
  units: Unit[];
}

// User progress interfaces
export interface ExerciseProgress {
  exerciseId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  attempts: number;
  lastAttemptAt: string;
  bestScore: number;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  exerciseProgress: ExerciseProgress[];
  startedAt: string;
  completedAt?: string;
}

export interface UnitProgress {
  unitId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  lessonProgress: LessonProgress[];
  startedAt: string;
  completedAt?: string;
}

export interface UserProgress {
  userId: string;
  courseId: string;
  overallScore: number;
  totalTimeSpent: number;
  unitsCompleted: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  unitProgress: UnitProgress[];
  createdAt: string;
  updatedAt: string;
}

// API response interfaces
export interface CurriculumData {
  courses: Course[];
  units: Unit[];
  lessons: Lesson[];
  exercises: Exercise[];
}

// Component prop interfaces
export interface LessonPageProps {
  params: { id: string };
}

export interface InteractiveLessonRouterProps {
  lesson: Lesson;
  userProgress: Partial<UserProgress>;
  onLessonComplete: (lessonId: string, score: number, timeSpent: number) => void;
  onExerciseComplete: (exerciseId: string, score: number, timeSpent: number) => void;
}

// Error interfaces
export interface LessonError {
  code: string;
  message: string;
  context?: string;
  timestamp: string;
}

// Utility types
export type PartialExercise = Partial<Exercise> & Pick<Exercise, 'id' | 'type'>;
export type LessonWithoutExercises = Omit<Lesson, 'exercises'>;
export type ExerciseWithoutData = Omit<Exercise, 'data'>;

// Type guards
export const isVocabularyExercise = (data: ExerciseData): data is { vocabularyItems: VocabularyItem[] } => {
  return 'vocabularyItems' in data;
};

export const isQuestionExercise = (data: ExerciseData): data is { questions: Question[] } => {
  return 'questions' in data;
};

export const isSentenceBuilderExercise = (data: ExerciseData): data is { exercises: SentenceBuilderExercise[] } => {
  return 'exercises' in data;
};

export const isGrammarExercise = (data: ExerciseData): data is { rule: GrammarRule } => {
  return 'rule' in data;
};
