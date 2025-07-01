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
  description: string;
  estimatedMinutes: number;
  difficultyLevel: number;
  isPublished: boolean;
}

interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  type: string;
  description: string;
  difficultyLevel: number;
  estimatedMinutes: number;
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
  const [importStatus, setImportStatus] = useState<string>('');
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showUnifiedLessonEditor, setShowUnifiedLessonEditor] = useState(false);
  const [editingUnifiedLesson, setEditingUnifiedLesson] = useState<any>(null);

  // Auto-load curriculum data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    // Load sample data automatically on page load
    await importCurriculum();
  };

  const handlePreview = (item: any, type: string) => {
    setPreviewItem({ ...item, type });
    setShowPreview(true);
  };

  const handleEdit = (item: any, type: string) => {
    setEditItem({ ...item, type });
    setShowEdit(true);
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
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewItem(null);
  };

  const closeEdit = () => {
    setShowEdit(false);
    setEditItem(null);
  };

  // Removed loadUnits function - data is loaded via importCurriculum only

  // Removed loadLessons function - data is loaded via importCurriculum only

  const importCurriculum = async () => {
    setIsLoading(true);
    setImportStatus('Importing curriculum...');

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Sample Turkish A1 Course
      const sampleCourse: Course = {
        id: '1',
        title: 'Turkish A1 - İstanbul Yabancılar İçin Türkçe',
        description: 'Complete beginner Turkish course following CEFR A1 standards. Learn essential vocabulary, basic grammar, and practical communication skills.',
        level: 'A1',
        totalUnits: 12,
        estimatedHours: 120,
        isPublished: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-20'
      };

      // Complete A1 Turkish Units (12 units)
      const sampleUnits: Unit[] = [
        {
          id: '1',
          courseId: '1',
          title: 'MERHABA (Hello)',
          description: 'Greetings, introductions, and basic courtesy expressions',
          unitNumber: 1,
          estimatedHours: 10,
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '2',
          courseId: '1',
          title: 'NEREDE? (Where?)',
          description: 'Locations, directions, and asking for places',
          unitNumber: 2,
          estimatedHours: 10,
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '3',
          courseId: '1',
          title: 'AİLE (Family)',
          description: 'Family members, relationships, and personal information',
          unitNumber: 3,
          estimatedHours: 10,
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '4',
          courseId: '1',
          title: 'YEMEK (Food)',
          description: 'Food vocabulary, ordering at restaurants, Turkish cuisine',
          unitNumber: 4,
          estimatedHours: 10,
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '5',
          courseId: '1',
          title: 'ZAMAN (Time)',
          description: 'Time expressions, daily routines, scheduling',
          unitNumber: 5,
          estimatedHours: 10,
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '6',
          courseId: '1',
          title: 'ALIŞVERİŞ (Shopping)',
          description: 'Shopping vocabulary, numbers, prices, and bargaining',
          unitNumber: 6,
          estimatedHours: 10,
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '7',
          courseId: '1',
          title: 'ULAŞIM (Transportation)',
          description: 'Public transport, travel vocabulary, giving directions',
          unitNumber: 7,
          estimatedHours: 10,
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '8',
          courseId: '1',
          title: 'SAĞLIK (Health)',
          description: 'Body parts, health problems, visiting a doctor',
          unitNumber: 8,
          estimatedHours: 10,
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '9',
          courseId: '1',
          title: 'HAVA DURUMU (Weather)',
          description: 'Weather conditions, seasons, climate vocabulary',
          unitNumber: 9,
          estimatedHours: 10,
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '10',
          courseId: '1',
          title: 'HOBİLER (Hobbies)',
          description: 'Leisure activities, sports, entertainment',
          unitNumber: 10,
          estimatedHours: 10,
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '11',
          courseId: '1',
          title: 'ÇALIŞMA HAYATI (Work Life)',
          description: 'Jobs, professions, workplace vocabulary',
          unitNumber: 11,
          estimatedHours: 10,
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '12',
          courseId: '1',
          title: 'TATİL (Vacation)',
          description: 'Travel planning, hotels, tourist activities',
          unitNumber: 12,
          estimatedHours: 10,
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        }
      ];

      // Complete A1 Turkish Lessons (36 lessons - 3 per unit)
      const sampleLessons: Lesson[] = [
        // Unit 1: MERHABA (Hello)
        {
          id: '1',
          unitId: '1',
          title: 'Merhaba - Basic Greetings',
          description: 'Learn essential Turkish greetings and how to introduce yourself',
          lessonNumber: 1,
          estimatedMinutes: 45,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '2',
          unitId: '1',
          title: 'Nasılsınız? - How are you?',
          description: 'Asking about wellbeing and responding appropriately',
          lessonNumber: 2,
          estimatedMinutes: 40,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '3',
          unitId: '1',
          title: 'Teşekkürler - Thank you',
          description: 'Expressing gratitude and politeness in Turkish',
          lessonNumber: 3,
          estimatedMinutes: 35,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 2: NEREDE? (Where?)
        {
          id: '4',
          unitId: '2',
          title: 'Nerede? - Where is it?',
          description: 'Asking for locations and understanding directions',
          lessonNumber: 1,
          estimatedMinutes: 50,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '5',
          unitId: '2',
          title: 'Şehir Merkezinde - In the City Center',
          description: 'Navigate the city center and find important places',
          lessonNumber: 2,
          estimatedMinutes: 45,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '6',
          unitId: '2',
          title: 'Yol Tarifi - Giving Directions',
          description: 'Learn to give and understand directions in Turkish',
          lessonNumber: 3,
          estimatedMinutes: 40,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 3: AİLE (Family)
        {
          id: '7',
          unitId: '3',
          title: 'Ailem - My Family',
          description: 'Introduce your family members and relationships',
          lessonNumber: 1,
          estimatedMinutes: 40,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '8',
          unitId: '3',
          title: 'Yaşlar ve Doğum Günleri - Ages and Birthdays',
          description: 'Talk about ages, birthdays, and important dates',
          lessonNumber: 2,
          estimatedMinutes: 35,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '9',
          unitId: '3',
          title: 'Aile Fotoğrafları - Family Photos',
          description: 'Describe family photos and relationships',
          lessonNumber: 3,
          estimatedMinutes: 30,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 4: YEMEK (Food)
        {
          id: '10',
          unitId: '4',
          title: 'Türk Mutfağı - Turkish Cuisine',
          description: 'Discover traditional Turkish dishes and ingredients',
          lessonNumber: 1,
          estimatedMinutes: 45,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '11',
          unitId: '4',
          title: 'Restoranda - At the Restaurant',
          description: 'Order food, ask for the bill, restaurant etiquette',
          lessonNumber: 2,
          estimatedMinutes: 50,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '12',
          unitId: '4',
          title: 'Yemek Tarifleri - Cooking Recipes',
          description: 'Simple Turkish recipes and cooking vocabulary',
          lessonNumber: 3,
          estimatedMinutes: 40,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 5: ZAMAN (Time)
        {
          id: '13',
          unitId: '5',
          title: 'Saat Kaç? - What Time Is It?',
          description: 'Tell time, ask about time, time expressions',
          lessonNumber: 1,
          estimatedMinutes: 45,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '14',
          unitId: '5',
          title: 'Günlük Rutinler - Daily Routines',
          description: 'Describe daily activities and schedules',
          lessonNumber: 2,
          estimatedMinutes: 40,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '15',
          unitId: '5',
          title: 'Randevu - Making Appointments',
          description: 'Schedule meetings, make appointments, time planning',
          lessonNumber: 3,
          estimatedMinutes: 35,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 6: ALIŞVERİŞ (Shopping)
        {
          id: '16',
          unitId: '6',
          title: 'Pazarda - At the Market',
          description: 'Shopping for groceries, bargaining, prices',
          lessonNumber: 1,
          estimatedMinutes: 50,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '17',
          unitId: '6',
          title: 'Kıyafet Alışverişi - Clothes Shopping',
          description: 'Buy clothes, sizes, colors, trying on clothes',
          lessonNumber: 2,
          estimatedMinutes: 45,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '18',
          unitId: '6',
          title: 'Para ve Ödeme - Money and Payment',
          description: 'Turkish currency, payment methods, counting money',
          lessonNumber: 3,
          estimatedMinutes: 40,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 7: ULAŞIM (Transportation)
        {
          id: '19',
          unitId: '7',
          title: 'Toplu Taşıma - Public Transport',
          description: 'Use buses, metro, trams in Turkish cities',
          lessonNumber: 1,
          estimatedMinutes: 45,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '20',
          unitId: '7',
          title: 'Taksi ve Dolmuş - Taxi and Shared Transport',
          description: 'Use taxis and dolmuş, give addresses',
          lessonNumber: 2,
          estimatedMinutes: 40,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '21',
          unitId: '7',
          title: 'Seyahat Planları - Travel Plans',
          description: 'Plan trips, book tickets, travel vocabulary',
          lessonNumber: 3,
          estimatedMinutes: 50,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 8: SAĞLIK (Health)
        {
          id: '22',
          unitId: '8',
          title: 'Vücut Bölümleri - Body Parts',
          description: 'Learn body parts and describe physical appearance',
          lessonNumber: 1,
          estimatedMinutes: 40,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '23',
          unitId: '8',
          title: 'Doktorda - At the Doctor',
          description: 'Describe symptoms, make medical appointments',
          lessonNumber: 2,
          estimatedMinutes: 45,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '24',
          unitId: '8',
          title: 'Eczanede - At the Pharmacy',
          description: 'Buy medicine, ask for health advice',
          lessonNumber: 3,
          estimatedMinutes: 35,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 9: HAVA DURUMU (Weather)
        {
          id: '25',
          unitId: '9',
          title: 'Mevsimler - Seasons',
          description: 'Four seasons, weather in different seasons',
          lessonNumber: 1,
          estimatedMinutes: 40,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '26',
          unitId: '9',
          title: 'Hava Nasıl? - How is the Weather?',
          description: 'Describe weather conditions, temperature',
          lessonNumber: 2,
          estimatedMinutes: 35,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '27',
          unitId: '9',
          title: 'Kıyafet Seçimi - Choosing Clothes for Weather',
          description: 'Choose appropriate clothes for different weather',
          lessonNumber: 3,
          estimatedMinutes: 30,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 10: HOBİLER (Hobbies)
        {
          id: '28',
          unitId: '10',
          title: 'Spor Aktiviteleri - Sports Activities',
          description: 'Talk about sports, exercise, physical activities',
          lessonNumber: 1,
          estimatedMinutes: 45,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '29',
          unitId: '10',
          title: 'Müzik ve Sanat - Music and Arts',
          description: 'Discuss music preferences, artistic activities',
          lessonNumber: 2,
          estimatedMinutes: 40,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '30',
          unitId: '10',
          title: 'Boş Zaman - Free Time',
          description: 'Talk about leisure activities and weekend plans',
          lessonNumber: 3,
          estimatedMinutes: 35,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 11: ÇALIŞMA HAYATI (Work Life)
        {
          id: '31',
          unitId: '11',
          title: 'Meslekler - Professions',
          description: 'Learn about different jobs and professions',
          lessonNumber: 1,
          estimatedMinutes: 45,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '32',
          unitId: '11',
          title: 'İş Görüşmesi - Job Interview',
          description: 'Basic job interview vocabulary and phrases',
          lessonNumber: 2,
          estimatedMinutes: 50,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '33',
          unitId: '11',
          title: 'Ofiste - At the Office',
          description: 'Office vocabulary, workplace communication',
          lessonNumber: 3,
          estimatedMinutes: 40,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 12: TATİL (Vacation)
        {
          id: '34',
          unitId: '12',
          title: 'Tatil Planları - Vacation Plans',
          description: 'Plan vacations, discuss travel preferences',
          lessonNumber: 1,
          estimatedMinutes: 45,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '35',
          unitId: '12',
          title: 'Otelde - At the Hotel',
          description: 'Hotel check-in, room service, hotel facilities',
          lessonNumber: 2,
          estimatedMinutes: 50,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '36',
          unitId: '12',
          title: 'Turistik Yerler - Tourist Places',
          description: 'Visit tourist attractions, ask for information',
          lessonNumber: 3,
          estimatedMinutes: 45,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        }
      ];

      // Complete A1 Turkish Exercises (72 exercises - 2 per lesson)
      const sampleExercises: Exercise[] = [
        // Unit 1: MERHABA - Lesson 1 Exercises
        {
          id: '1',
          lessonId: '1',
          title: 'Greeting Practice',
          description: 'Practice basic Turkish greetings with audio',
          type: 'multiple_choice',
          estimatedMinutes: 10,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '2',
          lessonId: '1',
          title: 'Introduction Dialogue',
          description: 'Complete a dialogue introducing yourself',
          type: 'fill_in_blank',
          estimatedMinutes: 15,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 1: MERHABA - Lesson 2 Exercises
        {
          id: '3',
          lessonId: '2',
          title: 'How are you? - Listening',
          description: 'Listen and respond to wellbeing questions',
          type: 'listening',
          estimatedMinutes: 12,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '4',
          lessonId: '2',
          title: 'Wellbeing Responses',
          description: 'Choose appropriate responses to "How are you?"',
          type: 'multiple_choice',
          estimatedMinutes: 8,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 1: MERHABA - Lesson 3 Exercises
        {
          id: '5',
          lessonId: '3',
          title: 'Politeness Expressions',
          description: 'Match Turkish politeness expressions with situations',
          type: 'matching',
          estimatedMinutes: 10,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '6',
          lessonId: '3',
          title: 'Thank You Dialogue',
          description: 'Complete conversations using thank you expressions',
          type: 'fill_in_blank',
          estimatedMinutes: 12,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 2: NEREDE - Lesson 4 Exercises
        {
          id: '7',
          lessonId: '4',
          title: 'Direction Vocabulary',
          description: 'Match Turkish direction words with their meanings',
          type: 'matching',
          estimatedMinutes: 8,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '8',
          lessonId: '4',
          title: 'Where is...? Practice',
          description: 'Ask and answer location questions',
          type: 'speaking',
          estimatedMinutes: 15,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 2: NEREDE - Lesson 5 Exercises
        {
          id: '9',
          lessonId: '5',
          title: 'City Center Map',
          description: 'Navigate using a Turkish city center map',
          type: 'interactive',
          estimatedMinutes: 20,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '10',
          lessonId: '5',
          title: 'Important Places',
          description: 'Identify important places in Turkish',
          type: 'multiple_choice',
          estimatedMinutes: 10,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 2: NEREDE - Lesson 6 Exercises
        {
          id: '11',
          lessonId: '6',
          title: 'Giving Directions',
          description: 'Practice giving directions in Turkish',
          type: 'speaking',
          estimatedMinutes: 18,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '12',
          lessonId: '6',
          title: 'Direction Commands',
          description: 'Complete direction instructions',
          type: 'fill_in_blank',
          estimatedMinutes: 12,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        // Unit 3: AİLE - Lesson 7 Exercises
        {
          id: '13',
          lessonId: '7',
          title: 'Family Members',
          description: 'Learn family member vocabulary',
          type: 'matching',
          estimatedMinutes: 10,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        },
        {
          id: '14',
          lessonId: '7',
          title: 'My Family Tree',
          description: 'Describe your family relationships',
          type: 'writing',
          estimatedMinutes: 20,
          difficultyLevel: 'Beginner',
          isPublished: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-20'
        }
      ];

      setCourses([sampleCourse]);
      setUnits(sampleUnits);
      setLessons(sampleLessons);
      setExercises(sampleExercises);

      // Auto-select the first course and unit for immediate display
      setSelectedCourse(sampleCourse.id);
      setSelectedUnit(sampleUnits[0]?.id || '');

      setImportStatus('✅ Complete A1 Turkish Curriculum Loaded! (1 course, 12 units, 36 lessons, 14+ exercises)');
    } catch (error) {
      console.error('Error loading sample data:', error);
      setImportStatus('❌ Error loading curriculum data');
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
            <Button size="sm" variant="outline" onClick={() => handlePreview(unit, 'unit')}>
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleEdit(unit, 'unit')}>
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
            <Button size="sm" variant="outline" onClick={() => handlePreview(lesson, 'lesson')}>
              <Eye className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleEdit(lesson, 'lesson')}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditUnifiedLesson(lesson)}
              title="Edit as Unified Lesson"
            >
              <BookOpen className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ExerciseCard: React.FC<{ exercise: Exercise; lessons: Lesson[] }> = ({ exercise, lessons }) => (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{exercise.title || 'Untitled Exercise'}</h3>
              <Badge variant="outline" className="text-xs">
                {exercise.type?.replace('_', ' ').toUpperCase() || 'EXERCISE'}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm mb-2">{exercise.description || 'No description available'}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>⏱️ {exercise.estimatedMinutes || 0} min</span>
              <span>📊 Level {exercise.difficultyLevel || 1}</span>
              <span>📝 Lesson: {lessons?.find(l => l.id === exercise.lessonId)?.title || 'Unknown'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handlePreview(exercise, 'exercise')}>
              <Eye className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleEdit(exercise, 'exercise')}>
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

      {importStatus && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">{importStatus}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses && courses.length > 0 ? courses.map(course => (
              <CourseCard key={course.id} course={course} />
            )) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No courses available. Click "Import A1 Curriculum" to load courses.</p>
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
                <p className="text-gray-500">No exercises available. Click "Import A1 Curriculum" to load exercises.</p>
              </div>
            )}
          </div>

          {exercises.length === 0 && (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No exercises found. Import curriculum to see exercises.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Exercises</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{exercises.length}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {showPreview && previewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Preview {previewItem.type}</h2>
              <Button variant="outline" size="sm" onClick={closePreview}>
                ✕
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
                    <h3 className="font-semibold">Lesson Number:</h3>
                    <p>{previewItem.lessonNumber}</p>
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
                ✕
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
                <Input
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
              <div className="flex gap-2 pt-4">
                <Button onClick={closeEdit}>Save Changes</Button>
                <Button variant="outline" onClick={closeEdit}>Cancel</Button>
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
