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
  Target, 
  FileText, 
  Wand2,
  Loader2,
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Brain
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ExerciseForm {
  lessonContent: string;
  exerciseTypes: string[];
  difficultyLevel: string;
  studentWeakAreas: string[];
  count: number;
  targetSkills: string[];
}

export default function ExerciseGeneratorPage() {
  const [activeTab, setActiveTab] = useState('content');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExercises, setGeneratedExercises] = useState(null);
  const [formData, setFormData] = useState<ExerciseForm>({
    lessonContent: '',
    exerciseTypes: [],
    difficultyLevel: '',
    studentWeakAreas: [],
    count: 5,
    targetSkills: []
  });

  const exerciseTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'fill_in_blank', label: 'Fill in the Blank' },
    { value: 'matching', label: 'Matching' },
    { value: 'sentence_building', label: 'Sentence Building' },
    { value: 'translation', label: 'Translation' },
    { value: 'pronunciation', label: 'Pronunciation' },
    { value: 'listening_comprehension', label: 'Listening Comprehension' },
    { value: 'reading_comprehension', label: 'Reading Comprehension' },
    { value: 'grammar_practice', label: 'Grammar Practice' },
    { value: 'vocabulary_drill', label: 'Vocabulary Drill' }
  ];

  const skillAreas = [
    { value: 'vocabulary', label: 'Vocabulary' },
    { value: 'grammar', label: 'Grammar' },
    { value: 'reading', label: 'Reading' },
    { value: 'listening', label: 'Listening' },
    { value: 'speaking', label: 'Speaking' },
    { value: 'writing', label: 'Writing' },
    { value: 'pronunciation', label: 'Pronunciation' },
    { value: 'comprehension', label: 'Comprehension' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const generateExercises = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/practice/generate-practice-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lesson_content: formData.lessonContent,
          exercise_types: formData.exerciseTypes,
          difficulty_level: formData.difficultyLevel,
          student_weak_areas: formData.studentWeakAreas,
          count: formData.count
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedExercises(data);
      setActiveTab('preview');
    } catch (error) {
      console.error('Error generating exercises:', error);
      alert('Failed to generate exercises. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveExercises = async () => {
    if (!generatedExercises) return;
    
    try {
      // Here you would save the exercises to your backend
      console.log('Saving exercises:', generatedExercises);
      alert('Exercises saved successfully!');
    } catch (error) {
      console.error('Error saving exercises:', error);
      alert('Failed to save exercises. Please try again.');
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
          <h1 className="text-3xl font-bold text-gray-900">Practice Exercise Generator</h1>
          <p className="text-gray-600 mt-1">Create targeted practice exercises with AI assistance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content & Settings</TabsTrigger>
            <TabsTrigger value="configuration">Exercise Configuration</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedExercises}>Preview & Save</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Lesson Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="lessonContent">Lesson Content</Label>
                  <Textarea
                    id="lessonContent"
                    placeholder="Paste or type the lesson content that exercises should be based on..."
                    value={formData.lessonContent}
                    onChange={(e) => handleInputChange('lessonContent', e.target.value)}
                    rows={8}
                    className="min-h-[200px]"
                  />
                  <p className="text-sm text-gray-500">
                    Provide the lesson content, vocabulary, or text that exercises should focus on.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                    <Select value={formData.difficultyLevel} onValueChange={(value) => handleInputChange('difficultyLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
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
                    <Label htmlFor="count">Number of Exercises</Label>
                    <Input
                      id="count"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.count}
                      onChange={(e) => handleInputChange('count', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exercise Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Exercise Types</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Select the types of exercises to generate:</p>
                    {exerciseTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={formData.exerciseTypes.includes(type.value)}
                          onCheckedChange={() => handleArrayToggle('exerciseTypes', type.value)}
                        />
                        <Label htmlFor={type.value} className="font-medium">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Target Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>Target Skills</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Focus on specific skill areas:</p>
                    {skillAreas.map((skill) => (
                      <div key={skill.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill.value}
                          checked={formData.targetSkills.includes(skill.value)}
                          onCheckedChange={() => handleArrayToggle('targetSkills', skill.value)}
                        />
                        <Label htmlFor={skill.value} className="font-medium">
                          {skill.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Student Weak Areas */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Student Weak Areas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Select areas where students need extra practice (exercises will focus on these):
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {skillAreas.map((skill) => (
                        <div key={skill.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`weak-${skill.value}`}
                            checked={formData.studentWeakAreas.includes(skill.value)}
                            onCheckedChange={() => handleArrayToggle('studentWeakAreas', skill.value)}
                          />
                          <Label htmlFor={`weak-${skill.value}`} className="font-medium text-sm">
                            {skill.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center pt-6">
              <Button
                onClick={generateExercises}
                disabled={isGenerating || !formData.lessonContent || formData.exerciseTypes.length === 0 || !formData.difficultyLevel}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Exercises...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Practice Exercises
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            {generatedExercises && (
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
                        <span>Generated Exercises Preview</span>
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setActiveTab('configuration')}>
                          Edit Settings
                        </Button>
                        <Button onClick={saveExercises} className="bg-green-600 hover:bg-green-700">
                          <Save className="w-4 h-4 mr-2" />
                          Save Exercises
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Exercise Summary */}
                      {generatedExercises.practice_exercises?.exercise_summary && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Exercise Set Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Total Exercises:</span>
                              <p className="font-medium">{generatedExercises.practice_exercises.exercise_summary.total_exercises}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Estimated Time:</span>
                              <p className="font-medium">{generatedExercises.practice_exercises.exercise_summary.estimated_total_time} min</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Difficulty:</span>
                              <p className="font-medium">{formData.difficultyLevel}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Focus Areas:</span>
                              <p className="font-medium">{formData.studentWeakAreas.join(', ')}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Skill Distribution */}
                      {generatedExercises.practice_exercises?.exercise_summary?.skill_distribution && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Skill Distribution</h4>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {Object.entries(generatedExercises.practice_exercises.exercise_summary.skill_distribution).map(([skill, percentage]) => (
                              <div key={skill} className="text-center p-2 bg-gray-50 rounded">
                                <p className="text-xs font-medium text-gray-900 capitalize">{skill}</p>
                                <p className="text-sm font-bold text-blue-600">{percentage}%</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exercises */}
                      {generatedExercises.practice_exercises?.exercises && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-4">Generated Exercises</h4>
                          <div className="space-y-4">
                            {generatedExercises.practice_exercises.exercises.map((exercise, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 border rounded-lg"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h5 className="font-medium text-gray-900">
                                      Exercise {index + 1}: {exercise.title}
                                    </h5>
                                    <p className="text-sm text-gray-600 mt-1">{exercise.instructions}</p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Badge variant="outline">{exercise.type}</Badge>
                                    <Badge variant="outline" className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {exercise.estimated_time}min
                                    </Badge>
                                  </div>
                                </div>

                                {/* Exercise Content */}
                                <div className="space-y-2">
                                  {exercise.content?.question && (
                                    <div>
                                      <p className="font-medium text-gray-900">Question:</p>
                                      <p className="text-gray-700">{exercise.content.question}</p>
                                    </div>
                                  )}

                                  {exercise.content?.options && (
                                    <div>
                                      <p className="font-medium text-gray-900">Options:</p>
                                      <ul className="list-disc list-inside text-gray-700 ml-4">
                                        {exercise.content.options.map((option, optIndex) => (
                                          <li key={optIndex}>{option}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {exercise.correct_answers?.answer && (
                                    <div>
                                      <p className="font-medium text-gray-900">Correct Answer:</p>
                                      <p className="text-green-700 font-medium">{exercise.correct_answers.answer}</p>
                                    </div>
                                  )}

                                  {exercise.correct_answers?.explanation && (
                                    <div>
                                      <p className="font-medium text-gray-900">Explanation:</p>
                                      <p className="text-gray-700">{exercise.correct_answers.explanation}</p>
                                    </div>
                                  )}

                                  {exercise.skill_focus && (
                                    <div>
                                      <p className="font-medium text-gray-900">Skills Practiced:</p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {exercise.skill_focus.map((skill, skillIndex) => (
                                          <Badge key={skillIndex} variant="secondary" className="text-xs">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {exercise.hints && exercise.hints.length > 0 && (
                                    <div>
                                      <p className="font-medium text-gray-900">Hints:</p>
                                      <ul className="list-disc list-inside text-gray-700 ml-4">
                                        {exercise.hints.map((hint, hintIndex) => (
                                          <li key={hintIndex}>{hint}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
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
