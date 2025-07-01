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
  BarChart3
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  totalUnits: number;
  estimatedHours: number;
  isPublished: boolean;
}

interface Unit {
  id: string;
  courseId: string;
  title: string;
  unitNumber: number;
  description: string;
  estimatedHours: number;
  isPublished: boolean;
}

interface Lesson {
  id: string;
  unitId: string;
  title: string;
  lessonNumber: number;
  lessonType: string;
  estimatedDuration: number;
  difficultyLevel: number;
  isPublished: boolean;
}

const CurriculumManager: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [activeTab, setActiveTab] = useState('courses');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadUnits(selectedCourse);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedUnit) {
      loadLessons(selectedUnit);
    }
  }, [selectedUnit]);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnits = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/units`);
      const data = await response.json();
      setUnits(data);
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const loadLessons = async (unitId: string) => {
    try {
      const response = await fetch(`/api/units/${unitId}/lessons`);
      const data = await response.json();
      setLessons(data);
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  const importCurriculum = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/curriculum/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await loadCourses();
        alert('Curriculum imported successfully!');
      } else {
        alert('Error importing curriculum');
      }
    } catch (error) {
      console.error('Error importing curriculum:', error);
      alert('Error importing curriculum');
    } finally {
      setIsLoading(false);
    }
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
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Units:</span> {course.totalUnits}
          </div>
          <div>
            <span className="font-medium">Hours:</span> {course.estimatedHours}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setSelectedCourse(course.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Units
          </Button>
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="outline">
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const UnitCard: React.FC<{ unit: Unit }> = ({ unit }) => (
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
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {unit.estimatedHours} hours
          </span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setSelectedUnit(unit.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Lessons
            </Button>
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LessonCard: React.FC<{ lesson: Lesson }> = ({ lesson }) => (
    <Card className="mb-2 hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium">
              Lesson {lesson.lessonNumber}: {lesson.title}
            </h4>
            <div className="flex gap-4 text-sm text-gray-600 mt-1">
              <span>Type: {lesson.lessonType}</span>
              <span>Duration: {lesson.estimatedDuration}min</span>
              <span>Level: {lesson.difficultyLevel}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={lesson.isPublished ? "default" : "secondary"} className="text-xs">
              {lesson.isPublished ? "Published" : "Draft"}
            </Badge>
            <Button size="sm" variant="outline">
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Curriculum Management</h1>
        <div className="flex gap-2">
          <Button onClick={importCurriculum} disabled={isLoading}>
            <Upload className="h-4 w-4 mr-2" />
            Import A1 Curriculum
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="units" className="mt-6">
          {selectedCourse ? (
            <div>
              <div className="mb-4">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {units.map(unit => (
                  <UnitCard key={unit.id} unit={unit} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Select a course to view its units</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          {selectedUnit ? (
            <div>
              <div className="mb-4 flex gap-4">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>
                        Unit {unit.unitNumber}: {unit.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {lessons.map(lesson => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Select a unit to view its lessons</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{courses.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Units</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{units.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{lessons.length}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CurriculumManager;
