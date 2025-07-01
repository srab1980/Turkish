'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle, 
  Lock,
  ChevronRight,
  Target,
  Headphones,
  MessageSquare,
  PenTool,
  Loader2
} from 'lucide-react';
import { curriculumService, type Course, type Unit, type Lesson, type Exercise } from '@/lib/curriculum-service';
import { useToast } from '@/components/ui/toast';

interface CourseContentData {
  course: Course;
  units: Unit[];
  lessons: Lesson[];
  exercises: Exercise[];
}

export default function CoursePage() {
  const params = useParams();
  const courseId = params.id as string; // Using 'id' instead of 'courseId'
  const { showToast, ToastContainer } = useToast();
  
  const [courseData, setCourseData] = useState<CourseContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  useEffect(() => {
    loadCourseContent();
  }, [courseId]);

  const loadCourseContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const curriculumData = await curriculumService.getCurriculumData();
      
      // Find the specific course
      const course = curriculumData.courses.find(c => c.id === courseId);
      if (!course) {
        throw new Error(`Course not found with ID: ${courseId}`);
      }

      // Get units for this course
      const units = curriculumService.getUnitsByCourse(curriculumData.units, courseId);
      
      // Get all lessons for these units
      const lessons = units.flatMap(unit => 
        curriculumService.getLessonsByUnit(curriculumData.lessons, unit.id)
      );
      
      // Get all exercises for these lessons
      const exercises = lessons.flatMap(lesson =>
        curriculumService.getExercisesByLesson(curriculumData.exercises, lesson.id)
      );

      setCourseData({
        course,
        units,
        lessons,
        exercises
      });

      // Auto-select first unit
      if (units.length > 0) {
        setSelectedUnit(units[0].id);
      }

    } catch (err) {
      console.error('Error loading course content:', err);
      setError('Failed to load course content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    // Navigate to the lesson content page
    window.location.href = `/lesson/${lessonId}`;
  };

  const getLessonIcon = (lessonType: string) => {
    switch (lessonType) {
      case 'vocabulary': return <BookOpen className="h-4 w-4" />;
      case 'grammar': return <PenTool className="h-4 w-4" />;
      case 'conversation': return <MessageSquare className="h-4 w-4" />;
      case 'listening': return <Headphones className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getLessonTypeColor = (lessonType: string) => {
    switch (lessonType) {
      case 'vocabulary': return 'bg-blue-100 text-blue-700';
      case 'grammar': return 'bg-green-100 text-green-700';
      case 'conversation': return 'bg-purple-100 text-purple-700';
      case 'listening': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading course content...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !courseData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-red-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold">Error Loading Course</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={loadCourseContent}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const { course, units, lessons, exercises } = courseData;
  const selectedUnitData = units.find(u => u.id === selectedUnit);
  const unitLessons = selectedUnitData ? 
    lessons.filter(l => l.unitId === selectedUnit) : [];

  return (
    <MainLayout>
      <ToastContainer />
      <div className="space-y-6">
        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-blue-100">{course.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.estimatedHours} hours</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{lessons.length} lessons</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>{exercises.length} exercises</span>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white text-blue-600">
              {course.level}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Units Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Units</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {units.map((unit, index) => (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedUnit === unit.id 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Unit {unit.unitNumber}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {unit.title}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Lessons Content */}
          <div className="lg:col-span-3">
            {selectedUnitData && (
              <div className="space-y-4">
                {/* Unit Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Unit {selectedUnitData.unitNumber}: {selectedUnitData.title}</CardTitle>
                        <p className="text-muted-foreground mt-1">{selectedUnitData.description}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {unitLessons.length} lessons • {selectedUnitData.estimatedHours} hours
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Lessons List */}
                <div className="space-y-3">
                  {unitLessons.map((lesson, index) => {
                    const lessonExercises = exercises.filter(e => e.lessonId === lesson.id);
                    
                    return (
                      <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                                {lesson.lessonNumber}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-medium">{lesson.title}</h3>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getLessonTypeColor(lesson.lessonType)}`}
                                  >
                                    {getLessonIcon(lesson.lessonType)}
                                    <span className="ml-1">{lesson.lessonType}</span>
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {lesson.description}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span>{lesson.estimatedMinutes} minutes</span>
                                  <span>{lessonExercises.length} exercises</span>
                                  <span>Level {lesson.difficultyLevel}</span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleStartLesson(lesson.id)}
                              size="sm"
                              className="ml-4"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
