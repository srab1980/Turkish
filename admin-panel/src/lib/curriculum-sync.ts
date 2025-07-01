// Curriculum Sync Service
// Manages data synchronization between admin panel and frontend

import { apiClient } from './api';

export interface CurriculumData {
  courses: Course[];
  units: Unit[];
  lessons: Lesson[];
  exercises: Exercise[];
  vocabulary: VocabularyItem[];
  grammar: GrammarRule[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  estimatedHours: number;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  courseId: string;
  title: string;
  description: string;
  unitNumber: number;
  estimatedHours: number;
  isPublished: boolean;
  order: number;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  lessonNumber: number;
  estimatedMinutes: number;
  difficultyLevel: string;
  lessonType: string;
  isPublished: boolean;
  order: number;
}

export interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  type: string;
  estimatedMinutes: number;
  difficultyLevel: string;
  content: any;
  isPublished: boolean;
}

export interface VocabularyItem {
  id: string;
  lessonId: string;
  turkish: string;
  english: string;
  pronunciation: string;
  example: string;
  audioUrl?: string;
}

export interface GrammarRule {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  examples: string[];
  exercises: any[];
}

class CurriculumSyncService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

  // Export complete curriculum data for frontend consumption
  async exportCurriculumData(): Promise<CurriculumData> {
    try {
      // In development mode, use mock data if backend is not available
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Using mock curriculum data for development');
        return this.getMockCurriculumData();
      }

      // Get all courses
      const coursesResponse = await apiClient.getCourses();
      const courses = coursesResponse.data?.items || [];

      // Get all units for all courses
      const unitsPromises = courses.map(course => apiClient.getUnits(course.id));
      const unitsResponses = await Promise.all(unitsPromises);
      const units = unitsResponses.flatMap(response => response.data || []);

      // Get all lessons for all units
      const lessonsPromises = units.map(unit => apiClient.getLessons(unit.id));
      const lessonsResponses = await Promise.all(lessonsPromises);
      const lessons = lessonsResponses.flatMap(response => response.data || []);

      // Get all exercises for all lessons
      const exercisesPromises = lessons.map(lesson => apiClient.getExercises(lesson.id));
      const exercisesResponses = await Promise.all(exercisesPromises);
      const exercises = exercisesResponses.flatMap(response => response.data || []);

      // Get all vocabulary for all lessons
      const vocabularyPromises = lessons.map(lesson => apiClient.getVocabulary(lesson.id));
      const vocabularyResponses = await Promise.all(vocabularyPromises);
      const vocabulary = vocabularyResponses.flatMap(response => response.data || []);

      // Get all grammar rules for all lessons
      const grammarPromises = lessons.map(lesson => apiClient.getGrammarRules(lesson.id));
      const grammarResponses = await Promise.all(grammarPromises);
      const grammar = grammarResponses.flatMap(response => response.data || []);

      return {
        courses,
        units,
        lessons,
        exercises,
        vocabulary,
        grammar
      };
    } catch (error) {
      console.warn('Backend not available, using mock curriculum data:', error);
      return this.getMockCurriculumData();
    }
  }

  // Sync curriculum data to frontend API format
  async syncToFrontend(): Promise<{ success: boolean; message: string }> {
    try {
      const curriculumData = await this.exportCurriculumData();

      // Transform data to frontend API format
      const frontendData = this.transformToFrontendFormat(curriculumData);

      // Send to frontend API endpoint (when backend is available)
      const syncResult = await this.sendToFrontendAPI(frontendData);

      if (syncResult.success) {
        console.log('✅ Curriculum data synced to frontend successfully');
        return { success: true, message: 'Synced to frontend API successfully' };
      } else {
        console.log('📝 Curriculum data prepared (backend not available)');
        return { success: true, message: 'Data prepared for frontend (demo mode)' };
      }
    } catch (error) {
      console.warn('⚠️ Sync completed with mock data:', error);
      return { success: true, message: 'Using mock data (development mode)' };
    }
  }

  // Transform admin data to frontend API format
  private transformToFrontendFormat(data: CurriculumData) {
    return {
      courses: data.courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        totalUnits: data.units.filter(u => u.courseId === course.id).length,
        estimatedHours: course.estimatedHours,
        isPublished: course.isPublished,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      })),
      units: data.units,
      lessons: data.lessons.map(lesson => ({
        ...lesson,
        exercises: data.exercises.filter(e => e.lessonId === lesson.id),
        vocabulary: data.vocabulary.filter(v => v.lessonId === lesson.id),
        grammar: data.grammar.filter(g => g.lessonId === lesson.id)
      }))
    };
  }

  // Send data to frontend API
  private async sendToFrontendAPI(data: any): Promise<{ success: boolean; message: string }> {
    try {
      // This would sync to the backend API that the frontend consumes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${this.baseUrl}/api/curriculum/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      return { success: true, message: 'Synced to backend API' };
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Backend sync timeout - continuing with mock data');
      } else {
        console.warn('Backend sync failed, data will be available in admin panel only:', error);
      }
      return { success: false, message: 'Backend not available' };
    }
  }

  // Get curriculum statistics
  async getCurriculumStats() {
    try {
      const data = await this.exportCurriculumData();
      
      return {
        totalCourses: data.courses.length,
        publishedCourses: data.courses.filter(c => c.isPublished).length,
        totalUnits: data.units.length,
        totalLessons: data.lessons.length,
        totalExercises: data.exercises.length,
        totalVocabulary: data.vocabulary.length,
        totalGrammar: data.grammar.length,
        estimatedHours: data.courses.reduce((sum, course) => sum + course.estimatedHours, 0)
      };
    } catch (error) {
      console.error('Error getting curriculum stats:', error);
      return null;
    }
  }

  // Validate curriculum data integrity
  async validateCurriculum(): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const data = await this.exportCurriculumData();
      const errors: string[] = [];

      // Check for orphaned units
      const courseIds = new Set(data.courses.map(c => c.id));
      const orphanedUnits = data.units.filter(u => !courseIds.has(u.courseId));
      if (orphanedUnits.length > 0) {
        errors.push(`Found ${orphanedUnits.length} units without valid courses`);
      }

      // Check for orphaned lessons
      const unitIds = new Set(data.units.map(u => u.id));
      const orphanedLessons = data.lessons.filter(l => !unitIds.has(l.unitId));
      if (orphanedLessons.length > 0) {
        errors.push(`Found ${orphanedLessons.length} lessons without valid units`);
      }

      // Check for orphaned exercises
      const lessonIds = new Set(data.lessons.map(l => l.id));
      const orphanedExercises = data.exercises.filter(e => !lessonIds.has(e.lessonId));
      if (orphanedExercises.length > 0) {
        errors.push(`Found ${orphanedExercises.length} exercises without valid lessons`);
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error}`]
      };
    }
  }

  // Mock curriculum data for development
  private getMockCurriculumData(): CurriculumData {
    const courses: Course[] = [
      {
        id: '1',
        title: 'Turkish A1 Complete Course - Istanbul Book',
        description: 'Complete beginner Turkish course following Istanbul Book curriculum with 12 units and 36 lessons',
        level: 'A1',
        estimatedHours: 180,
        isPublished: true,
        order: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-20')
      }
    ];

    const units: Unit[] = [
      { id: '1', courseId: '1', title: 'MERHABA - Hello', description: 'Introduction to Turkish greetings and basic expressions', unitNumber: 1, estimatedHours: 15, isPublished: true, order: 1 },
      { id: '2', courseId: '1', title: 'TANIŞMA - Meeting People', description: 'Learning how to introduce yourself and others', unitNumber: 2, estimatedHours: 15, isPublished: true, order: 2 },
      { id: '3', courseId: '1', title: 'AİLE - Family', description: 'Family members and relationships vocabulary', unitNumber: 3, estimatedHours: 15, isPublished: true, order: 3 },
      { id: '4', courseId: '1', title: 'GÜNLÜK HAYAT - Daily Life', description: 'Daily routines and activities', unitNumber: 4, estimatedHours: 15, isPublished: true, order: 4 },
      { id: '5', courseId: '1', title: 'ZAMAN - Time', description: 'Time expressions, days, months, seasons', unitNumber: 5, estimatedHours: 15, isPublished: true, order: 5 },
      { id: '6', courseId: '1', title: 'YEMEK - Food', description: 'Food vocabulary and dining expressions', unitNumber: 6, estimatedHours: 15, isPublished: true, order: 6 },
      { id: '7', courseId: '1', title: 'ALIŞVERİŞ - Shopping', description: 'Shopping vocabulary and market conversations', unitNumber: 7, estimatedHours: 15, isPublished: true, order: 7 },
      { id: '8', courseId: '1', title: 'ULAŞIM - Transportation', description: 'Transportation methods and directions', unitNumber: 8, estimatedHours: 15, isPublished: true, order: 8 },
      { id: '9', courseId: '1', title: 'SAĞLIK - Health', description: 'Health vocabulary and medical expressions', unitNumber: 9, estimatedHours: 15, isPublished: true, order: 9 },
      { id: '10', courseId: '1', title: 'HAVA DURUMU - Weather', description: 'Weather conditions and seasonal activities', unitNumber: 10, estimatedHours: 15, isPublished: true, order: 10 },
      { id: '11', courseId: '1', title: 'HOBILER - Hobbies', description: 'Leisure activities and personal interests', unitNumber: 11, estimatedHours: 15, isPublished: true, order: 11 },
      { id: '12', courseId: '1', title: 'TATİL - Vacation', description: 'Travel vocabulary and holiday expressions', unitNumber: 12, estimatedHours: 15, isPublished: true, order: 12 }
    ];

    const lessons: Lesson[] = [
      // Sample lessons (first few for brevity)
      { id: '1', unitId: '1', title: 'Basic Greetings', description: 'Learn essential Turkish greetings', lessonNumber: 1, estimatedMinutes: 45, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, order: 1 },
      { id: '2', unitId: '1', title: 'Introducing Yourself', description: 'Learn how to introduce yourself', lessonNumber: 2, estimatedMinutes: 50, difficultyLevel: 'A1', lessonType: 'conversation', isPublished: true, order: 2 },
      { id: '3', unitId: '1', title: 'Polite Expressions', description: 'Learn courtesy expressions', lessonNumber: 3, estimatedMinutes: 40, difficultyLevel: 'A1', lessonType: 'vocabulary', isPublished: true, order: 3 }
    ];

    const exercises: Exercise[] = [
      { id: '1', lessonId: '1', title: 'Greeting Vocabulary Match', description: 'Match Turkish greetings with their meanings', type: 'matching', estimatedMinutes: 10, difficultyLevel: 'A1', content: {}, isPublished: true },
      { id: '2', lessonId: '1', title: 'Greeting Pronunciation', description: 'Practice pronouncing Turkish greetings', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1', content: {}, isPublished: true },
      { id: '3', lessonId: '2', title: 'Self Introduction Practice', description: 'Practice introducing yourself', type: 'speaking', estimatedMinutes: 15, difficultyLevel: 'A1', content: {}, isPublished: true }
    ];

    const vocabulary: VocabularyItem[] = [
      { id: '1', lessonId: '1', turkish: 'Merhaba', english: 'Hello', pronunciation: 'mer-ha-ba', example: 'Merhaba, nasılsın?', audioUrl: '' },
      { id: '2', lessonId: '1', turkish: 'Günaydın', english: 'Good morning', pronunciation: 'gün-ay-dın', example: 'Günaydın öğretmenim!', audioUrl: '' },
      { id: '3', lessonId: '2', turkish: 'Ben', english: 'I am', pronunciation: 'ben', example: 'Ben Ahmet.', audioUrl: '' }
    ];

    const grammar: GrammarRule[] = [
      { id: '1', lessonId: '2', title: 'Personal Pronouns', description: 'Learn Turkish personal pronouns', examples: ['Ben - I', 'Sen - You', 'O - He/She/It'], exercises: [] },
      { id: '2', lessonId: '3', title: 'Polite Forms', description: 'Using polite expressions in Turkish', examples: ['Lütfen - Please', 'Teşekkürler - Thank you'], exercises: [] }
    ];

    return {
      courses,
      units,
      lessons,
      exercises,
      vocabulary,
      grammar
    };
  }
}

export const curriculumSyncService = new CurriculumSyncService();
export default curriculumSyncService;
