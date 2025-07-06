import { NextResponse } from 'next/server';
import { curriculumApi } from '@/lib/curriculum-api';

export async function GET() {
  try {
    const allLessons = curriculumApi.getAllLessons();
    const lessonIds = allLessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      unitId: lesson.unitId
    }));

    return NextResponse.json({
      success: true,
      totalLessons: allLessons.length,
      lessonIds: lessonIds.slice(0, 10), // First 10 for debugging
      firstLessonId: lessonIds[0]?.id,
      sampleLesson: allLessons[0]
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
