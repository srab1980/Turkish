'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Wand2, 
  FileText, 
  Target, 
  Clock, 
  Users, 
  BookOpen,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Save,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LessonForm {
  title: string;
  topic: string;
  targetLevel: string;
  lessonType: string;
  duration: number;
  learningObjectives: string[];
  includeExercises: boolean;
  exerciseCount: number;
  includeVocabulary: boolean;
  vocabularyCount: number;
  includeGrammar: boolean;
  culturalContext: boolean;
}

export default function CreateLessonPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState(null);
  const [formData, setFormData] = useState<LessonForm>({
    title: '',
    topic: '',
    targetLevel: '',
    lessonType: '',
    duration: 45,
    learningObjectives: [''],
    includeExercises: true,
    exerciseCount: 5,
    includeVocabulary: true,
    vocabularyCount: 10,
    includeGrammar: true,
    culturalContext: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.learningObjectives];
    newObjectives[index] = value;
    setFormData(prev => ({
      ...prev,
      learningObjectives: newObjectives
    }));
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }));
  };

  const removeObjective = (index: number) => {
    if (formData.learningObjectives.length > 1) {
      const newObjectives = formData.learningObjectives.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        learningObjectives: newObjectives
      }));
    }
  };

  const generateLesson = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/teacher/create-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          topic: formData.topic,
          target_level: formData.targetLevel,
          lesson_type: formData.lessonType,
          duration_minutes: formData.duration,
          learning_objectives: formData.learningObjectives.filter(obj => obj.trim() !== ''),
          include_exercises: formData.includeExercises,
          exercise_count: formData.exerciseCount,
          include_vocabulary: formData.includeVocabulary,
          vocabulary_count: formData.vocabularyCount,
          include_grammar: formData.includeGrammar,
          cultural_context: formData.culturalContext
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedLesson(data.created_lesson);
      setActiveTab('preview');
    } catch (error) {
      console.error('Error generating lesson:', error);
      alert('Failed to generate lesson. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveLesson = async () => {
    if (!generatedLesson) return;
    
    try {
      // Here you would save the lesson to your backend
      console.log('Saving lesson:', generatedLesson);
      alert('Lesson saved successfully!');
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Failed to save lesson. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/teacher/dashboard'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Lesson Creator</h1>
          <p className="text-gray-600 mt-1">Create comprehensive Turkish language lessons with AI assistance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="content">Content Settings</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedLesson}>Preview & Save</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Lesson Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Lesson Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Turkish Greetings and Introductions"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Daily greetings, formal introductions"
                      value={formData.topic}
                      onChange={(e) => handleInputChange('topic', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetLevel">Target CEFR Level</Label>
                    <Select value={formData.targetLevel} onValueChange={(value) => handleInputChange('targetLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A1">A1 - Beginner</SelectItem>
                        <SelectItem value="A2">A2 - Elementary</SelectItem>
                        <SelectItem value="B1">B1 - Intermediate</SelectItem>
                        <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                        <SelectItem value="C1">C1 - Advanced</SelectItem>
                        <SelectItem value="C2">C2 - Proficient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lessonType">Lesson Type</Label>
                    <Select value={formData.lessonType} onValueChange={(value) => handleInputChange('lessonType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vocabulary">Vocabulary</SelectItem>
                        <SelectItem value="grammar">Grammar</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="listening">Listening</SelectItem>
                        <SelectItem value="speaking">Speaking</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="culture">Culture</SelectItem>
                        <SelectItem value="mixed">Mixed Skills</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      max="120"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Learning Objectives</Label>
                  {formData.learningObjectives.map((objective, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder={`Learning objective ${index + 1}`}
                        value={objective}
                        onChange={(e) => handleObjectiveChange(index, e.target.value)}
                      />
                      {formData.learningObjectives.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeObjective(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={addObjective}>
                    Add Objective
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Settings Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Content Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Exercises */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeExercises"
                        checked={formData.includeExercises}
                        onCheckedChange={(checked) => handleInputChange('includeExercises', checked)}
                      />
                      <Label htmlFor="includeExercises" className="font-medium">Include Exercises</Label>
                    </div>
                    {formData.includeExercises && (
                      <div className="space-y-2">
                        <Label htmlFor="exerciseCount">Number of Exercises</Label>
                        <Input
                          id="exerciseCount"
                          type="number"
                          min="1"
                          max="20"
                          value={formData.exerciseCount}
                          onChange={(e) => handleInputChange('exerciseCount', parseInt(e.target.value))}
                        />
                      </div>
                    )}
                  </div>

                  {/* Vocabulary */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeVocabulary"
                        checked={formData.includeVocabulary}
                        onCheckedChange={(checked) => handleInputChange('includeVocabulary', checked)}
                      />
                      <Label htmlFor="includeVocabulary" className="font-medium">Include Vocabulary</Label>
                    </div>
                    {formData.includeVocabulary && (
                      <div className="space-y-2">
                        <Label htmlFor="vocabularyCount">Number of Words</Label>
                        <Input
                          id="vocabularyCount"
                          type="number"
                          min="5"
                          max="50"
                          value={formData.vocabularyCount}
                          onChange={(e) => handleInputChange('vocabularyCount', parseInt(e.target.value))}
                        />
                      </div>
                    )}
                  </div>

                  {/* Grammar */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeGrammar"
                        checked={formData.includeGrammar}
                        onCheckedChange={(checked) => handleInputChange('includeGrammar', checked)}
                      />
                      <Label htmlFor="includeGrammar" className="font-medium">Include Grammar Rules</Label>
                    </div>
                  </div>

                  {/* Cultural Context */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="culturalContext"
                        checked={formData.culturalContext}
                        onCheckedChange={(checked) => handleInputChange('culturalContext', checked)}
                      />
                      <Label htmlFor="culturalContext" className="font-medium">Include Cultural Context</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <Button
                    onClick={generateLesson}
                    disabled={isGenerating || !formData.title || !formData.topic || !formData.targetLevel}
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Lesson...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Generate Lesson with AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            {generatedLesson && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center space-x-2">
                        <Eye className="w-5 h-5" />
                        <span>Generated Lesson Preview</span>
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setActiveTab('content')}>
                          Edit Settings
                        </Button>
                        <Button onClick={saveLesson} className="bg-green-600 hover:bg-green-700">
                          <Save className="w-4 h-4 mr-2" />
                          Save Lesson
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Lesson Overview */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {generatedLesson.lesson?.title || formData.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {generatedLesson.lesson?.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">{formData.targetLevel} Level</Badge>
                          <Badge variant="outline">{formData.lessonType}</Badge>
                          <Badge variant="outline">{formData.duration} minutes</Badge>
                        </div>
                      </div>

                      {/* Learning Objectives */}
                      {generatedLesson.lesson?.objectives && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Learning Objectives</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {generatedLesson.lesson.objectives.map((objective, index) => (
                              <li key={index} className="text-gray-700">{objective}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Vocabulary */}
                      {generatedLesson.lesson?.vocabulary && generatedLesson.lesson.vocabulary.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Vocabulary ({generatedLesson.lesson.vocabulary.length} words)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {generatedLesson.lesson.vocabulary.slice(0, 6).map((word, index) => (
                              <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                                <span className="font-medium">{word.turkish}</span>
                                <span className="text-gray-600">{word.english}</span>
                              </div>
                            ))}
                          </div>
                          {generatedLesson.lesson.vocabulary.length > 6 && (
                            <p className="text-sm text-gray-500 mt-2">
                              +{generatedLesson.lesson.vocabulary.length - 6} more words...
                            </p>
                          )}
                        </div>
                      )}

                      {/* Exercises */}
                      {generatedLesson.lesson?.exercises && generatedLesson.lesson.exercises.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Exercises ({generatedLesson.lesson.exercises.length})</h4>
                          <div className="space-y-2">
                            {generatedLesson.lesson.exercises.slice(0, 3).map((exercise, index) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{exercise.title || `Exercise ${index + 1}`}</span>
                                  <Badge variant="outline">{exercise.type}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{exercise.instructions}</p>
                              </div>
                            ))}
                          </div>
                          {generatedLesson.lesson.exercises.length > 3 && (
                            <p className="text-sm text-gray-500 mt-2">
                              +{generatedLesson.lesson.exercises.length - 3} more exercises...
                            </p>
                          )}
                        </div>
                      )}

                      {/* Teaching Tips */}
                      {generatedLesson.lesson?.teaching_tips && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Teaching Tips</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {generatedLesson.lesson.teaching_tips.map((tip, index) => (
                              <li key={index} className="text-gray-700">{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
