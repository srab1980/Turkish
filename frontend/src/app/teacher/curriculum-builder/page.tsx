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
  BookOpen, 
  Target, 
  Clock, 
  Users, 
  Wand2,
  Loader2,
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CurriculumForm {
  title: string;
  targetLevel: string;
  totalHours: number;
  focusAreas: string[];
  studentGoals: string[];
  description: string;
}

export default function CurriculumBuilderPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCurriculum, setGeneratedCurriculum] = useState(null);
  const [formData, setFormData] = useState<CurriculumForm>({
    title: '',
    targetLevel: '',
    totalHours: 40,
    focusAreas: [],
    studentGoals: [''],
    description: ''
  });

  const lessonTypes = [
    { value: 'vocabulary', label: 'Vocabulary' },
    { value: 'grammar', label: 'Grammar' },
    { value: 'reading', label: 'Reading' },
    { value: 'listening', label: 'Listening' },
    { value: 'speaking', label: 'Speaking' },
    { value: 'writing', label: 'Writing' },
    { value: 'culture', label: 'Culture' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFocusAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...formData.studentGoals];
    newGoals[index] = value;
    setFormData(prev => ({
      ...prev,
      studentGoals: newGoals
    }));
  };

  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      studentGoals: [...prev.studentGoals, '']
    }));
  };

  const removeGoal = (index: number) => {
    if (formData.studentGoals.length > 1) {
      const newGoals = formData.studentGoals.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        studentGoals: newGoals
      }));
    }
  };

  const generateCurriculum = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/curriculum/generate-curriculum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          target_level: formData.targetLevel,
          total_hours: formData.totalHours,
          focus_areas: formData.focusAreas,
          student_goals: formData.studentGoals.filter(goal => goal.trim() !== '')
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedCurriculum(data);
      setActiveTab('preview');
    } catch (error) {
      console.error('Error generating curriculum:', error);
      alert('Failed to generate curriculum. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCurriculum = async () => {
    if (!generatedCurriculum) return;
    
    try {
      // Here you would save the curriculum to your backend
      console.log('Saving curriculum:', generatedCurriculum);
      alert('Curriculum saved successfully!');
    } catch (error) {
      console.error('Error saving curriculum:', error);
      alert('Failed to save curriculum. Please try again.');
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
          <h1 className="text-3xl font-bold text-gray-900">Curriculum Builder</h1>
          <p className="text-gray-600 mt-1">Create comprehensive Turkish language curricula with AI assistance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="structure">Structure & Goals</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedCurriculum}>Preview & Save</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Curriculum Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Curriculum Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Complete Turkish for Beginners"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
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
                    <Label htmlFor="totalHours">Total Duration (hours)</Label>
                    <Input
                      id="totalHours"
                      type="number"
                      min="10"
                      max="200"
                      value={formData.totalHours}
                      onChange={(e) => handleInputChange('totalHours', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the curriculum objectives and target audience..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Structure & Goals Tab */}
          <TabsContent value="structure" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Focus Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Focus Areas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Select the skill areas to emphasize in this curriculum:</p>
                    {lessonTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={formData.focusAreas.includes(type.value)}
                          onCheckedChange={() => handleFocusAreaToggle(type.value)}
                        />
                        <Label htmlFor={type.value} className="font-medium">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Student Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Student Goals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Define what students should achieve:</p>
                    {formData.studentGoals.map((goal, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder={`Student goal ${index + 1}`}
                          value={goal}
                          onChange={(e) => handleGoalChange(index, e.target.value)}
                        />
                        {formData.studentGoals.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeGoal(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={addGoal}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center pt-6">
              <Button
                onClick={generateCurriculum}
                disabled={isGenerating || !formData.title || !formData.targetLevel || formData.focusAreas.length === 0}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Curriculum...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Curriculum with AI
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            {generatedCurriculum && (
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
                        <span>Generated Curriculum Preview</span>
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setActiveTab('structure')}>
                          Edit Settings
                        </Button>
                        <Button onClick={saveCurriculum} className="bg-green-600 hover:bg-green-700">
                          <Save className="w-4 h-4 mr-2" />
                          Save Curriculum
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Curriculum Overview */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {generatedCurriculum.curriculum?.title || formData.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {generatedCurriculum.curriculum?.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">{formData.targetLevel} Level</Badge>
                          <Badge variant="outline">{formData.totalHours} hours</Badge>
                          <Badge variant="outline">
                            {generatedCurriculum.curriculum?.total_lessons || 0} lessons
                          </Badge>
                        </div>
                      </div>

                      {/* Units */}
                      {generatedCurriculum.curriculum?.units && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Curriculum Units</h4>
                          <div className="space-y-4">
                            {generatedCurriculum.curriculum.units.map((unit, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 border rounded-lg"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h5 className="font-medium text-gray-900">
                                      Unit {index + 1}: {unit.title}
                                    </h5>
                                    <p className="text-sm text-gray-600 mt-1">{unit.description}</p>
                                  </div>
                                  <Badge variant="outline">
                                    {unit.estimated_hours}h
                                  </Badge>
                                </div>
                                
                                {/* Learning Objectives */}
                                {unit.learning_objectives && (
                                  <div className="mt-3">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Learning Objectives:</p>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                      {unit.learning_objectives.slice(0, 3).map((objective, objIndex) => (
                                        <li key={objIndex} className="flex items-center">
                                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                          {objective}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Lessons */}
                                {unit.lessons && (
                                  <div className="mt-3">
                                    <p className="text-xs font-medium text-gray-500 mb-1">
                                      Lessons ({unit.lessons.length}):
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {unit.lessons.slice(0, 5).map((lesson, lessonIndex) => (
                                        <Badge key={lessonIndex} variant="secondary" className="text-xs">
                                          {lesson}
                                        </Badge>
                                      ))}
                                      {unit.lessons.length > 5 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{unit.lessons.length - 5} more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Prerequisites */}
                                {unit.prerequisites && unit.prerequisites.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Prerequisites:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {unit.prerequisites.map((prereq, prereqIndex) => (
                                        <Badge key={prereqIndex} variant="outline" className="text-xs">
                                          {prereq}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Learning Path */}
                      {generatedCurriculum.curriculum?.learning_path && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Recommended Learning Path</h4>
                          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                            {generatedCurriculum.curriculum.learning_path.map((unitId, index) => (
                              <div key={index} className="flex items-center space-x-2 flex-shrink-0">
                                <Badge variant="default" className="whitespace-nowrap">
                                  {unitId}
                                </Badge>
                                {index < generatedCurriculum.curriculum.learning_path.length - 1 && (
                                  <ArrowRight className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skill Distribution */}
                      {generatedCurriculum.curriculum?.skill_distribution && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Skill Distribution</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(generatedCurriculum.curriculum.skill_distribution).map(([skill, percentage]) => (
                              <div key={skill} className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-900 capitalize">{skill}</p>
                                <p className="text-lg font-bold text-blue-600">{percentage}%</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assessment Strategy */}
                      {generatedCurriculum.curriculum?.assessment_strategy && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Assessment Strategy</h4>
                          <p className="text-gray-700 p-3 bg-blue-50 rounded-lg">
                            {generatedCurriculum.curriculum.assessment_strategy}
                          </p>
                        </div>
                      )}

                      {/* Cultural Components */}
                      {generatedCurriculum.curriculum?.cultural_components && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Cultural Components</h4>
                          <div className="flex flex-wrap gap-2">
                            {generatedCurriculum.curriculum.cultural_components.map((component, index) => (
                              <Badge key={index} variant="outline" className="bg-purple-50">
                                {component}
                              </Badge>
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
