import { NextResponse } from 'next/server';
import { curriculumApi } from '@/lib/curriculum-api';

export async function GET() {
  try {
    console.log('🔍 Testing curriculum API...');

    // Test curriculum generation
    const curriculum = curriculumApi.getCompleteCurriculum();
    const allLessons = curriculumApi.getAllLessons();
    const units = curriculumApi.getUnits();

    console.log('📊 Curriculum stats:', {
      totalLessons: allLessons.length,
      totalUnits: units.length,
      firstLessonId: allLessons[0]?.id
    });

    // Test specific lesson lookup
    const testLessonId = 'unit-1-lesson-1';
    const testLesson = curriculumApi.getLesson(testLessonId);

    const lessonIds = allLessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      unitId: lesson.unitId,
      exerciseCount: lesson.exercises.length
    }));

    return NextResponse.json({
      success: true,
      totalLessons: allLessons.length,
      totalUnits: units.length,
      lessonIds: lessonIds,
      testLessonId,
      testLessonFound: !!testLesson,
      testLessonData: testLesson ? {
        id: testLesson.id,
        title: testLesson.title,
        exerciseCount: testLesson.exercises.length
      } : null,
      firstFiveLessonIds: lessonIds.slice(0, 5).map(l => l.id)
    });
  } catch (error) {
    console.error('❌ Curriculum API test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
