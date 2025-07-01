'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export enum SubLessonType {
  PREPARATION = 'preparation',
  READING = 'reading',
  GRAMMAR = 'grammar',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  WRITING = 'writing',
  VOCABULARY = 'vocabulary',
  CULTURE = 'culture',
  INTERACTIVE = 'interactive',
  CLASSROOM = 'classroom',
  FUN_LEARNING = 'fun_learning',
  REVIEW = 'review',
  ASSESSMENT = 'assessment'
}

interface SubLesson {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  type: SubLessonType;
  content: Record<string, unknown>;
  learningObjectives: string[];
  estimatedDuration: number;
  difficultyLevel: number;
  orderIndex: number;
  isPublished: boolean;
  isRequired: boolean;
  audioUrl?: string;
  videoUrl?: string;
  imageUrls?: string[];
  exercises: Record<string, unknown>[];
  vocabularyItems: Record<string, unknown>[];
  grammarRules: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
}

interface UnifiedLesson {
  id: string;
  title: string;
  description: string;
  unitId: string;
  unitTitle: string;
  courseTitle: string;
  level: string;
  subLessons: SubLesson[];
  totalEstimatedTime: number;
  overallProgress: number;
}

interface UnifiedLessonEditorProps {
  lesson?: UnifiedLesson;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lesson: UnifiedLesson) => void;
}

const getSubLessonIcon = (type: SubLessonType) => {
  switch (type) {
    case SubLessonType.PREPARATION: return "🎯"
    case SubLessonType.READING: return "📖"
    case SubLessonType.GRAMMAR: return "📝"
    case SubLessonType.LISTENING: return "🎧"
    case SubLessonType.SPEAKING: return "🗣️"
    case SubLessonType.WRITING: return "✍️"
    case SubLessonType.VOCABULARY: return "📚"
    case SubLessonType.CULTURE: return "🏛️"
    case SubLessonType.INTERACTIVE: return "💬"
    case SubLessonType.CLASSROOM: return "🏫"
    case SubLessonType.FUN_LEARNING: return "🎮"
    case SubLessonType.REVIEW: return "🔄"
    case SubLessonType.ASSESSMENT: return "✅"
    default: return "📄"
  }
}

const getSubLessonTypeLabel = (type: SubLessonType) => {
  switch (type) {
    case SubLessonType.PREPARATION: return "Hazırlık Çalışmaları"
    case SubLessonType.READING: return "Okuma"
    case SubLessonType.GRAMMAR: return "Dilbilgisi"
    case SubLessonType.LISTENING: return "Dinleme"
    case SubLessonType.SPEAKING: return "Konuşma"
    case SubLessonType.WRITING: return "Yazma"
    case SubLessonType.VOCABULARY: return "Kelime Listesi"
    case SubLessonType.CULTURE: return "Kültürden Kültüre"
    case SubLessonType.INTERACTIVE: return "Ya Siz"
    case SubLessonType.CLASSROOM: return "Sınıf Dili"
    case SubLessonType.FUN_LEARNING: return "Eğlenelim Öğrenelim"
    case SubLessonType.REVIEW: return "Neler Öğrendik"
    case SubLessonType.ASSESSMENT: return "Öz Değerlendirme"
    default: return type
  }
}

export default function UnifiedLessonEditor({ lesson, isOpen, onClose, onSave }: UnifiedLessonEditorProps) {
  const [editingLesson, setEditingLesson] = useState<UnifiedLesson | null>(null);
  const [selectedSubLesson, setSelectedSubLesson] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lesson) {
      setEditingLesson({ ...lesson });
      setSelectedSubLesson(lesson.subLessons[0]?.id || null);
    } else {
      // Create new lesson template
      setEditingLesson({
        id: '',
        title: '',
        description: '',
        unitId: '',
        unitTitle: '',
        courseTitle: '',
        level: 'A1',
        subLessons: [],
        totalEstimatedTime: 0,
        overallProgress: 0
      });
      setSelectedSubLesson(null);
    }
  }, [lesson]);

  const handleAddSubLesson = (type: SubLessonType) => {
    if (!editingLesson) return;

    const newSubLesson: SubLesson = {
      id: `temp-${Date.now()}`,
      lessonId: editingLesson.id,
      title: getSubLessonTypeLabel(type),
      description: '',
      type,
      content: {},
      learningObjectives: [],
      estimatedDuration: 15,
      difficultyLevel: 1,
      orderIndex: editingLesson.subLessons.length + 1,
      isPublished: false,
      isRequired: type !== SubLessonType.CULTURE,
      exercises: [],
      vocabularyItems: [],
      grammarRules: []
    };

    setEditingLesson({
      ...editingLesson,
      subLessons: [...editingLesson.subLessons, newSubLesson]
    });
    setSelectedSubLesson(newSubLesson.id);
  };

  const handleSave = async () => {
    if (!editingLesson) return;

    setIsSubmitting(true);
    try {
      // Calculate total estimated time
      const totalTime = editingLesson.subLessons.reduce((sum, sl) => sum + sl.estimatedDuration, 0);
      
      const lessonToSave = {
        ...editingLesson,
        totalEstimatedTime: totalTime
      };

      onSave(lessonToSave);
      onClose();
    } catch (error) {
      console.error('Failed to save lesson:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSubLesson = editingLesson?.subLessons.find(sl => sl.id === selectedSubLesson);

  if (!isOpen || !editingLesson) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-6xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{lesson ? 'Edit Lesson' : 'Create New Lesson'}</CardTitle>
                <p className="text-sm text-gray-500">
                  Manage lesson content with sub-lessons for different skills
                </p>
              </div>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lesson Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lesson Title
                  </label>
                  <Input
                    value={editingLesson.title}
                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                    placeholder="Enter lesson title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    value={editingLesson.description}
                    onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                    placeholder="Enter lesson description"
                    rows={3}
                  />
                </div>

                {/* Sub-lessons */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Sub-lessons</h3>
                    <select
                      onChange={(e) => e.target.value && handleAddSubLesson(e.target.value as SubLessonType)}
                      value=""
                      className="text-xs rounded border px-2 py-1"
                    >
                      <option value="">Add Sub-lesson</option>
                      {Object.values(SubLessonType).map(type => (
                        <option key={type} value={type}>
                          {getSubLessonIcon(type)} {getSubLessonTypeLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {editingLesson.subLessons.map((subLesson) => (
                      <div
                        key={subLesson.id}
                        className={`p-3 rounded border cursor-pointer transition-colors ${
                          selectedSubLesson === subLesson.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedSubLesson(subLesson.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getSubLessonIcon(subLesson.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {subLesson.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subLesson.estimatedDuration} min
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sub-lesson Editor */}
              <div className="lg:col-span-2">
                {currentSubLesson ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getSubLessonIcon(currentSubLesson.type)}</span>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {currentSubLesson.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getSubLessonTypeLabel(currentSubLesson.type)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Title
                        </label>
                        <Input
                          value={currentSubLesson.title}
                          onChange={(e) => {
                            const updatedSubLessons = editingLesson.subLessons.map(sl => 
                              sl.id === currentSubLesson.id ? { ...sl, title: e.target.value } : sl
                            );
                            setEditingLesson({ ...editingLesson, subLessons: updatedSubLessons });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Duration (minutes)
                        </label>
                        <Input
                          type="number"
                          value={currentSubLesson.estimatedDuration}
                          onChange={(e) => {
                            const updatedSubLessons = editingLesson.subLessons.map(sl => 
                              sl.id === currentSubLesson.id ? { ...sl, estimatedDuration: parseInt(e.target.value) || 0 } : sl
                            );
                            setEditingLesson({ ...editingLesson, subLessons: updatedSubLessons });
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <Textarea
                        value={currentSubLesson.description}
                        onChange={(e) => {
                          const updatedSubLessons = editingLesson.subLessons.map(sl => 
                            sl.id === currentSubLesson.id ? { ...sl, description: e.target.value } : sl
                          );
                          setEditingLesson({ ...editingLesson, subLessons: updatedSubLessons });
                        }}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentSubLesson.isRequired}
                          onChange={(e) => {
                            const updatedSubLessons = editingLesson.subLessons.map(sl => 
                              sl.id === currentSubLesson.id ? { ...sl, isRequired: e.target.checked } : sl
                            );
                            setEditingLesson({ ...editingLesson, subLessons: updatedSubLessons });
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Required</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentSubLesson.isPublished}
                          onChange={(e) => {
                            const updatedSubLessons = editingLesson.subLessons.map(sl => 
                              sl.id === currentSubLesson.id ? { ...sl, isPublished: e.target.checked } : sl
                            );
                            setEditingLesson({ ...editingLesson, subLessons: updatedSubLessons });
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Published</span>
                      </label>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-4">Content</h4>
                      <div className="bg-gray-50 rounded p-4 text-center text-gray-500">
                        Content editor for {getSubLessonTypeLabel(currentSubLesson.type)} will be implemented here.
                        <br />
                        This will include specific editors for vocabulary, grammar rules, reading texts, etc.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <p>Select a sub-lesson to edit its content</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-500">
                Total estimated time: {editingLesson.subLessons.reduce((sum, sl) => sum + sl.estimatedDuration, 0)} minutes
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSubmitting || !editingLesson.title}
                >
                  {isSubmitting ? 'Saving...' : 'Save Lesson'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
