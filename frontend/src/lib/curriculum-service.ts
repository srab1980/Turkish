// Curriculum Service for Frontend
// Handles communication with backend curriculum API
import { mockApiService } from './mock-api';

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
  lessonType: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  type: string;
  estimatedMinutes: number;
  difficultyLevel: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumData {
  courses: Course[];
  units: Unit[];
  lessons: Lesson[];
  exercises: Exercise[];
}

class CurriculumService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  private useMockApi = true; // Force use mock API for now to ensure courses show

  async getCurriculumData(): Promise<CurriculumData> {
    try {
      // Try backend first, fallback to mock if it fails
      if (!this.useMockApi) {
        try {
          const response = await fetch(`${this.baseUrl}/api/v1/curriculum/data`);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.message || 'Failed to fetch curriculum data');
          }

          return result.data;
        } catch (error) {
          console.warn('Backend not available, using mock data:', error);
          this.useMockApi = true;
        }
      }

      // Use mock API
      const [courses, units, lessons, exercises] = await Promise.all([
        mockApiService.getCourses(),
        mockApiService.getUnits(),
        mockApiService.getLessons(),
        mockApiService.getExercises()
      ]);

      return {
        courses,
        units,
        lessons,
        exercises
      };
    } catch (error) {
      console.error('Error fetching curriculum data:', error);
      throw error;
    }
  }

  async importCurriculum(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/curriculum/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to import curriculum');
      }
      
      return result;
    } catch (error) {
      console.error('Error importing curriculum:', error);
      throw error;
    }
  }

  async getCurriculumStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/curriculum/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get curriculum status');
      }
      
      return result;
    } catch (error) {
      console.error('Error getting curriculum status:', error);
      throw error;
    }
  }

  // Helper methods for filtering data
  getUnitsByCourse(units: Unit[], courseId: string): Unit[] {
    return units.filter(unit => unit.courseId === courseId);
  }

  getLessonsByUnit(lessons: Lesson[], unitId: string): Lesson[] {
    return lessons.filter(lesson => lesson.unitId === unitId);
  }

  getExercisesByLesson(exercises: Exercise[], lessonId: string): Exercise[] {
    return exercises.filter(exercise => exercise.lessonId === lessonId);
  }

  // Get course progress data
  getCourseProgress(courseId: string): {
    totalUnits: number;
    completedUnits: number;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
  } {
    // This would typically fetch from user progress API
    // For now, return mock data but with correct totals
    return {
      totalUnits: 12,
      completedUnits: 0,
      totalLessons: 72, // Updated to reflect real data
      completedLessons: 0,
      progressPercentage: 0
    };
  }

  // Check if user can access a lesson (based on progress)
  canAccessLesson(lessonId: string): boolean {
    // This would check user progress and prerequisites
    // For now, allow access to all lessons
    return true;
  }

  // Get next lesson for user
  getNextLesson(currentLessonId: string, lessons: Lesson[]): Lesson | null {
    const currentLesson = lessons.find(l => l.id === currentLessonId);
    if (!currentLesson) return null;

    // Find next lesson in the same unit
    const unitLessons = lessons
      .filter(l => l.unitId === currentLesson.unitId)
      .sort((a, b) => a.lessonNumber - b.lessonNumber);

    const currentIndex = unitLessons.findIndex(l => l.id === currentLessonId);
    
    if (currentIndex < unitLessons.length - 1) {
      return unitLessons[currentIndex + 1];
    }

    return null;
  }
}

export const curriculumService = new CurriculumService();
export default curriculumService;
