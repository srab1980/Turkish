'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import UnifiedLessonEditor from './UnifiedLessonEditor';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download,
  Eye,
  Settings,
  Users,
  BarChart3,
  RefreshCw,
  Save,
  X,
  AlertTriangle
} from 'lucide-react';

// Import the real curriculum API from the frontend
const FRONTEND_API_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

// Real curriculum interfaces matching the frontend
interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  totalUnits: number;
  estimatedHours: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Unit {
  id: string;
  courseId: string;
  title: string;
  unitNumber: number;
  description: string;
  estimatedHours: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Lesson {
  id: string;
  unitId: string;
  title: string;
  lessonNumber?: number;
  description: string;
  estimatedMinutes: number;
  difficultyLevel: string;
  isPublished: boolean;
  exercises: Exercise[];
  createdAt?: string;
  updatedAt?: string;
}

interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  type: string;
  description: string;
  difficultyLevel: number;
  estimatedMinutes: number;
  isPublished?: boolean;
  content?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface CurriculumStats {
  totalCourses: number;
  totalUnits: number;
  totalLessons: number;
  totalExercises: number;
  publishedLessons: number;
  draftLessons: number;
}

const CurriculumManager: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [activeTab, setActiveTab] = useState('courses');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [stats, setStats] = useState<CurriculumStats | null>(null);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [showUnifiedLessonEditor, setShowUnifiedLessonEditor] = useState(false);
  const [editingUnifiedLesson, setEditingUnifiedLesson] = useState<any>(null);

  // Auto-load real curriculum data on component mount
  useEffect(() => {
    loadRealCurriculumData();
  }, []);

  // Load real curriculum data from the frontend API
  const loadRealCurriculumData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Fetch curriculum data from the frontend API
      const response = await fetch(`${FRONTEND_API_URL}/api/test-curriculum`);
      if (!response.ok) {
        throw new Error(`Failed to fetch curriculum: ${response.statusText}`);
      }
      
      const curriculumData = await response.json();
      
      // Extract data from the curriculum
      const course = curriculumData.course;
      const unitsData = curriculumData.units || [];
      const lessonsData = curriculumData.lessons || [];
      const exercisesData = curriculumData.exercises || [];
      
      // Set the data
      setCourses([course]);
      setUnits(unitsData);
      setLessons(lessonsData);
      setExercises(exercisesData);
      
      // Calculate stats
      const statsData: CurriculumStats = {
        totalCourses: 1,
        totalUnits: unitsData.length,
        totalLessons: lessonsData.length,
        totalExercises: exercisesData.length,
        publishedLessons: lessonsData.filter((l: Lesson) => l.isPublished).length,
        draftLessons: lessonsData.filter((l: Lesson) => !l.isPublished).length,
      };
      setStats(statsData);
      
      // Auto-select first course and unit
      setSelectedCourse(course.id);
      if (unitsData.length > 0) {
        setSelectedUnit(unitsData[0].id);
      }
      
      setSuccess(`✅ Loaded real curriculum: ${lessonsData.length} lessons, ${exercisesData.length} exercises`);
      
    } catch (err) {
      console.error('Failed to load curriculum:', err);
      setError(`Failed to load curriculum: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Fallback to empty state
      setCourses([]);
      setUnits([]);
      setLessons([]);
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD Operations
  const handlePreview = (item: any, type: string) => {
    setPreviewItem({ ...item, type });
    setShowPreview(true);
  };

  const handleEdit = (item: any, type: string) => {
    setEditItem({ ...item, type, originalItem: { ...item } });
    setShowEdit(true);
  };

  const handleDelete = (item: any, type: string) => {
    setDeleteItem({ ...item, type });
    setShowDelete(true);
  };

  const handleSave = async () => {
    if (!editItem) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Here you would normally save to backend
      // For now, we'll update the local state
      const { type, originalItem, ...updatedItem } = editItem;
      
      switch (type) {
        case 'course':
          setCourses(prev => prev.map(c => c.id === updatedItem.id ? updatedItem : c));
          break;
        case 'unit':
          setUnits(prev => prev.map(u => u.id === updatedItem.id ? updatedItem : u));
          break;
        case 'lesson':
          setLessons(prev => prev.map(l => l.id === updatedItem.id ? updatedItem : l));
          break;
        case 'exercise':
          setExercises(prev => prev.map(e => e.id === updatedItem.id ? updatedItem : e));
          break;
      }
      
      setSuccess(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`);
      setShowEdit(false);
      setEditItem(null);
      
    } catch (err) {
      setError(`Failed to save ${editItem.type}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Here you would normally delete from backend
      // For now, we'll remove from local state
      const { type, id } = deleteItem;
      
      switch (type) {
        case 'course':
          setCourses(prev => prev.filter(c => c.id !== id));
          break;
        case 'unit':
          setUnits(prev => prev.filter(u => u.id !== id));
          // Also remove related lessons and exercises
          setLessons(prev => prev.filter(l => l.unitId !== id));
          setExercises(prev => prev.filter(e => {
            const lesson = lessons.find(l => l.id === e.lessonId);
            return lesson?.unitId !== id;
          }));
          break;
        case 'lesson':
          setLessons(prev => prev.filter(l => l.id !== id));
          // Also remove related exercises
          setExercises(prev => prev.filter(e => e.lessonId !== id));
          break;
        case 'exercise':
          setExercises(prev => prev.filter(e => e.id !== id));
          break;
      }
      
      setSuccess(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      setShowDelete(false);
      setDeleteItem(null);
      
    } catch (err) {
      setError(`Failed to delete ${deleteItem.type}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUnifiedLesson = (lesson?: any) => {
    setEditingUnifiedLesson(lesson);
    setShowUnifiedLessonEditor(true);
  };

  const handleSaveUnifiedLesson = (lesson: any) => {
    // Here you would save the lesson to the backend
    console.log('Saving unified lesson:', lesson);
    setShowUnifiedLessonEditor(false);
    setEditingUnifiedLesson(null);
    setSuccess('✅ Unified lesson saved successfully');
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewItem(null);
  };

  const closeEdit = () => {
    setShowEdit(false);
    setEditItem(null);
  };

  const closeDelete = () => {
    setShowDelete(false);
    setDeleteItem(null);
  };

  // Refresh curriculum data
  const refreshCurriculum = async () => {
    await loadRealCurriculumData();
  };

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {course.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{course.description}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={course.isPublished ? "default" : "secondary"}>
              {course.isPublished ? "Published" : "Draft"}
            </Badge>
            <Badge variant="outline">{course.level}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="font-medium">Units:</span> {course.totalUnits}
          </div>
          <div>
            <span className="font-medium">Hours:</span> {course.estimatedHours}
          </div>
          <div>
            <span className="font-medium">Lessons:</span> {lessons.filter(l => units.find(u => u.courseId === course.id && u.id === l.unitId)).length}
          </div>
          <div>
            <span className="font-medium">Exercises:</span> {exercises.filter(e => {
              const lesson = lessons.find(l => l.id === e.lessonId);
              return lesson && units.find(u => u.courseId === course.id && u.id === lesson.unitId);
            }).length}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedCourse(course.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Units
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleEdit(course, 'course')}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={() => handlePreview(course, 'course')}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(course, 'course')}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const UnitCard: React.FC<{ unit: Unit }> = ({ unit }) => {
    const unitLessons = lessons.filter(l => l.unitId === unit.id);
    const unitExercises = exercises.filter(e => {
      const lesson = lessons.find(l => l.id === e.lessonId);
      return lesson?.unitId === unit.id;
    });

    return (
      <Card className="mb-3 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                Unit {unit.unitNumber}: {unit.title}
              </CardTitle>
              <p className="text-sm text-gray-600">{unit.description}</p>
            </div>
            <Badge variant={unit.isPublished ? "default" : "secondary"}>
              {unit.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div>
              <span className="font-medium">Lessons:</span> {unitLessons.length}
            </div>
            <div>
              <span className="font-medium">Exercises:</span> {unitExercises.length}
            </div>
            <div>
              <span className="font-medium">Hours:</span> {unit.estimatedHours}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedUnit(unit.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Lessons
            </Button>
            <Button size="sm" variant="outline" onClick={() => handlePreview(unit, 'unit')}>
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleEdit(unit, 'unit')}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(unit, 'unit')}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const LessonCard: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
    const lessonExercises = exercises.filter(e => e.lessonId === lesson.id);
    const unit = units.find(u => u.id === lesson.unitId);

    return (
      <Card className="mb-2 hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium mb-1">
                {lesson.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>📚 Unit: {unit?.title || 'Unknown'}</span>
                <span>⏱️ {lesson.estimatedMinutes}min</span>
                <span>📊 {lesson.difficultyLevel}</span>
                <span>🎮 {lessonExercises.length} exercises</span>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <Badge variant={lesson.isPublished ? "default" : "secondary"} className="text-xs">
                {lesson.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => handlePreview(lesson, 'lesson')}>
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleEdit(lesson, 'lesson')}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditUnifiedLesson(lesson)}
              title="Edit as Unified Lesson"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Unified
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(lesson, 'lesson')}>
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ExerciseCard: React.FC<{ exercise: Exercise; lessons: Lesson[] }> = ({ exercise, lessons }) => {
    const lesson = lessons.find(l => l.id === exercise.lessonId);
    const unit = units.find(u => u.id === lesson?.unitId);

    return (
      <Card className="mb-4 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{exercise.title || 'Untitled Exercise'}</h3>
                <Badge variant="outline" className="text-xs">
                  {exercise.type?.replace('_', ' ').toUpperCase() || 'EXERCISE'}
                </Badge>
                {exercise.isPublished !== undefined && (
                  <Badge variant={exercise.isPublished ? "default" : "secondary"} className="text-xs">
                    {exercise.isPublished ? "Published" : "Draft"}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-2">{exercise.description || 'No description available'}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>⏱️ {exercise.estimatedMinutes || 0} min</span>
                <span>📊 Level {exercise.difficultyLevel || 1}</span>
                <span>📝 Lesson: {lesson?.title || 'Unknown'}</span>
                <span>📚 Unit: {unit?.title || 'Unknown'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handlePreview(exercise, 'exercise')}>
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleEdit(exercise, 'exercise')}>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(exercise, 'exercise')}>
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Curriculum Management</h1>
        <div className="flex gap-2">
          <Button onClick={refreshCurriculum} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">Loading curriculum data...</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
          <TabsTrigger value="units">Units ({units.length})</TabsTrigger>
          <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
          <TabsTrigger value="exercises">Exercises ({exercises.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses && courses.length > 0 ? courses.map(course => (
              <CourseCard key={course.id} course={course} />
            )) : (
              <div className="text-center py-12 col-span-2">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No courses available. Click "Refresh Data" to load courses.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="units" className="mt-6">
          <div>
            <div className="mb-4">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses && courses.length > 0 ? courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {units && units.length > 0 ? (
                selectedCourse ?
                  units.filter(unit => unit.courseId === selectedCourse).map(unit => (
                    <UnitCard key={unit.id} unit={unit} />
                  )) :
                  units.map(unit => (
                    <UnitCard key={unit.id} unit={unit} />
                  ))
              ) : (
                <div className="text-center py-8 col-span-2">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No units available. Data will load automatically.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          <div>
            <div className="mb-4 flex gap-4 items-center">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses && courses.length > 0 ? courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {units && units.length > 0 ? units.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      Unit {unit.unitNumber}: {unit.title}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
              <Button
                onClick={() => handleEditUnifiedLesson()}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Unified Lesson
              </Button>
            </div>
            <div className="space-y-2">
              {lessons && lessons.length > 0 ? (
                selectedUnit ?
                  lessons.filter(lesson => lesson.unitId === selectedUnit).map(lesson => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  )) :
                  lessons.map(lesson => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No lessons available. Data will load automatically.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="exercises" className="mt-6">
          <div className="mb-4 flex gap-4">
            <Select value={selectedLesson} onValueChange={setSelectedLesson}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by lesson" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lessons</SelectItem>
                {lessons && lessons.length > 0 ? lessons.map(lesson => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                )) : null}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {exercises && exercises.length > 0 ? (
              exercises
                .filter(exercise => !selectedLesson || selectedLesson === 'all' || exercise.lessonId === selectedLesson)
                .map(exercise => (
                  <ExerciseCard key={exercise.id} exercise={exercise} lessons={lessons} />
                ))
            ) : (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No exercises found. Refresh data to see exercises.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalCourses || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Units</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalUnits || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalLessons || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Exercises</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalExercises || 0}</div>
              </CardContent>
            </Card>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lesson Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Published:</span>
                      <span className="font-bold text-green-600">{stats.publishedLessons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Draft:</span>
                      <span className="font-bold text-yellow-600">{stats.draftLessons}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Avg Exercises per Lesson:</span>
                      <span className="font-bold">{stats.totalLessons > 0 ? Math.round(stats.totalExercises / stats.totalLessons) : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Lessons per Unit:</span>
                      <span className="font-bold">{stats.totalUnits > 0 ? Math.round(stats.totalLessons / stats.totalUnits) : 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {showPreview && previewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Preview {previewItem.type}</h2>
              <Button variant="outline" size="sm" onClick={closePreview}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Title:</h3>
                <p>{previewItem.title}</p>
              </div>
              {previewItem.description && (
                <div>
                  <h3 className="font-semibold">Description:</h3>
                  <p>{previewItem.description}</p>
                </div>
              )}
              {previewItem.type === 'course' && (
                <>
                  <div>
                    <h3 className="font-semibold">Level:</h3>
                    <p>{previewItem.level}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Total Units:</h3>
                    <p>{previewItem.totalUnits}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Estimated Hours:</h3>
                    <p>{previewItem.estimatedHours}</p>
                  </div>
                </>
              )}
              {previewItem.type === 'unit' && (
                <>
                  <div>
                    <h3 className="font-semibold">Unit Number:</h3>
                    <p>{previewItem.unitNumber}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Estimated Hours:</h3>
                    <p>{previewItem.estimatedHours}</p>
                  </div>
                </>
              )}
              {previewItem.type === 'lesson' && (
                <>
                  <div>
                    <h3 className="font-semibold">Estimated Minutes:</h3>
                    <p>{previewItem.estimatedMinutes}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Difficulty Level:</h3>
                    <p>{previewItem.difficultyLevel}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Exercises:</h3>
                    <p>{previewItem.exercises?.length || 0} exercises</p>
                  </div>
                </>
              )}
              {previewItem.type === 'exercise' && (
                <>
                  <div>
                    <h3 className="font-semibold">Type:</h3>
                    <p>{previewItem.type?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Estimated Minutes:</h3>
                    <p>{previewItem.estimatedMinutes}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Difficulty Level:</h3>
                    <p>{previewItem.difficultyLevel}</p>
                  </div>
                </>
              )}
              <div>
                <h3 className="font-semibold">Status:</h3>
                <Badge variant={previewItem.isPublished ? "default" : "secondary"}>
                  {previewItem.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit {editItem.type}</h2>
              <Button variant="outline" size="sm" onClick={closeEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title:</label>
                <Input
                  value={editItem.title}
                  onChange={(e) => setEditItem({...editItem, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description:</label>
                <Textarea
                  value={editItem.description || ''}
                  onChange={(e) => setEditItem({...editItem, description: e.target.value})}
                />
              </div>
              {editItem.type === 'lesson' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Minutes:</label>
                  <Input
                    type="number"
                    value={editItem.estimatedMinutes || ''}
                    onChange={(e) => setEditItem({...editItem, estimatedMinutes: parseInt(e.target.value)})}
                  />
                </div>
              )}
              {editItem.type === 'exercise' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Exercise Type:</label>
                  <Select value={editItem.type} onValueChange={(value) => setEditItem({...editItem, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flashcards">Flashcards</SelectItem>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
                      <SelectItem value="listening">Listening</SelectItem>
                      <SelectItem value="speaking">Speaking</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={closeEdit}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && deleteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">Confirm Delete</h2>
              <Button variant="outline" size="sm" onClick={closeDelete}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="font-medium">Are you sure you want to delete this {deleteItem.type}?</p>
                  <p className="text-sm text-gray-600">"{deleteItem.title}"</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                This action cannot be undone. {deleteItem.type === 'unit' && 'All lessons and exercises in this unit will also be deleted.'}
                {deleteItem.type === 'lesson' && 'All exercises in this lesson will also be deleted.'}
              </p>
              <div className="flex gap-2 pt-4">
                <Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {deleteItem.type}
                </Button>
                <Button variant="outline" onClick={closeDelete}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Lesson Editor */}
      <UnifiedLessonEditor
        lesson={editingUnifiedLesson}
        isOpen={showUnifiedLessonEditor}
        onClose={() => setShowUnifiedLessonEditor(false)}
        onSave={handleSaveUnifiedLesson}
      />
    </div>
  );
};

export default CurriculumManager;
