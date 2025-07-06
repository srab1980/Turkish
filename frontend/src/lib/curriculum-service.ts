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
  exercises?: Exercise[]; // Optional exercises array
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
  private baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8080';
  private useMockApi = true; // Use rich mock data by default, AI service as enhancement

  async getCurriculumData(): Promise<CurriculumData> {
    try {
      // Try backend first, fallback to mock if it fails
      if (!this.useMockApi) {
        try {
          console.log('Attempting to fetch curriculum data from:', `${this.baseUrl}/api/v1/curriculum/curriculum-data`);
          const response = await fetch(`${this.baseUrl}/api/v1/curriculum/curriculum-data`);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log('Successfully received curriculum data from AI service:', result);

          // Transform AI service response to our curriculum data format
          return this.transformAIResponseToCurriculumData(result);
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

      // Enrich lessons with their exercises
      const enrichedLessons = lessons.map(lesson => ({
        ...lesson,
        exercises: exercises.filter(exercise => exercise.lessonId === lesson.id)
      }));

      return {
        courses,
        units,
        lessons: enrichedLessons,
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

  // Transform AI service response to our curriculum data format
  private transformAIResponseToCurriculumData(aiResponse: any): CurriculumData {
    const curriculum = aiResponse.curriculum;

    // Create courses from AI response
    const courses: Course[] = [{
      id: 'ai-generated-course',
      title: curriculum.title || 'Turkish A1 Course',
      description: curriculum.description || 'AI-generated Turkish language course',
      level: 'A1',
      totalUnits: curriculum.units?.length || 12,
      estimatedHours: curriculum.estimated_duration || 36,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }];

    // Create units from AI response
    const units: Unit[] = curriculum.units?.map((unit: any, index: number) => ({
      id: `unit-${index + 1}`,
      courseId: 'ai-generated-course',
      title: unit.title || `Unit ${index + 1}`,
      description: unit.description || `Learning unit ${index + 1}`,
      unitNumber: index + 1,
      estimatedHours: unit.estimated_hours || 3,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })) || [];

    // Create lessons from AI response
    const lessons: Lesson[] = [];
    curriculum.units?.forEach((unit: any, unitIndex: number) => {
      unit.lessons?.forEach((lesson: any, lessonIndex: number) => {
        const lessonTitle = typeof lesson === 'string' ? lesson : lesson.title;
        const lessonDescription = typeof lesson === 'string' ? `Learn about ${lesson.toLowerCase()}` : lesson.description;

        lessons.push({
          id: `lesson-${unitIndex + 1}-${lessonIndex + 1}`,
          unitId: `unit-${unitIndex + 1}`,
          title: lessonTitle,
          description: lessonDescription,
          lessonNumber: lessonIndex + 1,
          estimatedMinutes: 30,
          difficultyLevel: curriculum.target_level || 'A1',
          lessonType: 'mixed',
          isPublished: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
    });

    // Create basic exercises
    const exercises: Exercise[] = lessons.map((lesson, index) => ({
      id: `exercise-${index + 1}`,
      lessonId: lesson.id,
      title: `${lesson.title} Practice`,
      description: `Practice exercises for ${lesson.title}`,
      type: 'multiple_choice',
      estimatedMinutes: 10,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    return {
      courses,
      units,
      lessons,
      exercises
    };
  }

  // Generate new lessons using AI service
  async generateNewLessons(topic: string, level: string = 'A1'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/teacher/create-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${topic} Lesson`,
          topic: topic,
          target_level: level,
          lesson_type: 'vocabulary',
          duration_minutes: 30,
          learning_objectives: [`Learn about ${topic}`],
          include_exercises: true,
          exercise_count: 3,
          include_vocabulary: true,
          vocabulary_count: 5,
          include_grammar: false,
          cultural_context: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating new lessons:', error);
      throw error;
    }
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
