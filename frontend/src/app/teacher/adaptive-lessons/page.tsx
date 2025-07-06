'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Wand2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock student data
const mockStudents = [
  {
    id: '1',
    name: 'Ahmet Kaya',
    level: 'A2',
    weakAreas: ['grammar', 'pronunciation'],
    strongAreas: ['vocabulary', 'reading'],
    completionRate: 78,
    accuracyScore: 85,
    lastActive: '2 hours ago'
  },
  {
    id: '2',
    name: 'Fatma Şahin',
    level: 'B1',
    weakAreas: ['listening', 'speaking'],
    strongAreas: ['grammar', 'writing'],
    completionRate: 92,
    accuracyScore: 91,
    lastActive: '1 day ago'
  },
  {
    id: '3',
    name: 'Mehmet Özkan',
    level: 'A1',
    weakAreas: ['vocabulary', 'reading'],
    strongAreas: ['pronunciation'],
    completionRate: 65,
    accuracyScore: 72,
    lastActive: '3 hours ago'
  }
];

interface AdaptiveLessonRequest {
  studentId: string;
  targetLevel: string;
  lessonType: string;
  focusAreas: string[];
  durationMinutes: number;
  difficultyAdjustment: number;
}

export default function AdaptiveLessonsPage() {
  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState(null);
  const [progressAnalysis, setProgressAnalysis] = useState(null);
  const [adaptiveRequest, setAdaptiveRequest] = useState<AdaptiveLessonRequest>({
    studentId: '',
    targetLevel: '',
    lessonType: 'mixed',
    focusAreas: [],
    durationMinutes: 30,
    difficultyAdjustment: 0
  });

  const analyzeStudentProgress = async (studentId: string) => {
    setIsAnalyzing(true);
    try {
      // Mock progress data for the student
      const mockProgressData = [
        {
          user_id: studentId,
          lesson_id: 'lesson1',
          completion_rate: 0.85,
          accuracy_score: 0.78,
          time_spent: 45,
          weak_areas: ['grammar', 'pronunciation'],
          strong_areas: ['vocabulary', 'reading'],
          last_accessed: '2024-01-15T10:30:00Z'
        },
        {
          user_id: studentId,
          lesson_id: 'lesson2',
          completion_rate: 0.92,
          accuracy_score: 0.88,
          time_spent: 38,
          weak_areas: ['pronunciation'],
          strong_areas: ['vocabulary', 'grammar'],
          last_accessed: '2024-01-14T14:20:00Z'
        }
      ];

      const response = await fetch('/api/v1/adaptive/analyze-student-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockProgressData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setProgressAnalysis(data);
    } catch (error) {
      console.error('Error analyzing progress:', error);
      alert('Failed to analyze student progress. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAdaptiveLesson = async () => {
    if (!selectedStudent) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/adaptive/generate-adaptive-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          target_level: selectedStudent.level,
          lesson_type: adaptiveRequest.lessonType,
          focus_areas: selectedStudent.weakAreas,
          duration_minutes: adaptiveRequest.durationMinutes,
          difficulty_adjustment: adaptiveRequest.difficultyAdjustment
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedLesson(data);
      setActiveTab('preview');
    } catch (error) {
      console.error('Error generating adaptive lesson:', error);
      alert('Failed to generate adaptive lesson. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setAdaptiveRequest(prev => ({
      ...prev,
      studentId: student.id,
      targetLevel: student.level,
      focusAreas: student.weakAreas
    }));
    setActiveTab('configure');
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
          <h1 className="text-3xl font-bold text-gray-900">Adaptive Learning System</h1>
          <p className="text-gray-600 mt-1">Generate personalized lessons based on individual student progress and needs</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">Select Student</TabsTrigger>
            <TabsTrigger value="configure" disabled={!selectedStudent}>Configure Lesson</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!selectedStudent}>Progress Analysis</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedLesson}>Preview Lesson</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Select Student for Adaptive Learning</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockStudents.map((student) => (
                    <motion.div
                      key={student.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedStudent?.id === student.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => selectStudent(student)}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900">{student.name}</h3>
                          <Badge variant="outline">{student.level}</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Completion:</span>
                            <span className="font-medium">{student.completionRate}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Accuracy:</span>
                            <span className="font-medium">{student.accuracyScore}%</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Weak Areas:</p>
                            <div className="flex flex-wrap gap-1">
                              {student.weakAreas.map((area, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Strong Areas:</p>
                            <div className="flex flex-wrap gap-1">
                              {student.strongAreas.map((area, index) => (
                                <Badge key={index} variant="default" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500">Last active: {student.lastActive}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configure Tab */}
          <TabsContent value="configure" className="space-y-6">
            {selectedStudent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Configure Adaptive Lesson for {selectedStudent.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="lessonType">Lesson Type</Label>
                      <Select 
                        value={adaptiveRequest.lessonType} 
                        onValueChange={(value) => setAdaptiveRequest(prev => ({ ...prev, lessonType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select lesson type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vocabulary">Vocabulary Focus</SelectItem>
                          <SelectItem value="grammar">Grammar Focus</SelectItem>
                          <SelectItem value="reading">Reading Focus</SelectItem>
                          <SelectItem value="listening">Listening Focus</SelectItem>
                          <SelectItem value="speaking">Speaking Focus</SelectItem>
                          <SelectItem value="mixed">Mixed Skills</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select 
                        value={adaptiveRequest.durationMinutes.toString()} 
                        onValueChange={(value) => setAdaptiveRequest(prev => ({ ...prev, durationMinutes: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Adjustment</Label>
                      <Select 
                        value={adaptiveRequest.difficultyAdjustment.toString()} 
                        onValueChange={(value) => setAdaptiveRequest(prev => ({ ...prev, difficultyAdjustment: parseFloat(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-0.5">Easier (-0.5)</SelectItem>
                          <SelectItem value="0">Normal (0)</SelectItem>
                          <SelectItem value="0.5">Harder (+0.5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Student Profile Summary</h4>
                      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Level:</span>
                          <Badge variant="outline">{selectedStudent.level}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completion Rate:</span>
                          <span className="font-medium">{selectedStudent.completionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Accuracy Score:</span>
                          <span className="font-medium">{selectedStudent.accuracyScore}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Focus Areas (Weak):</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedStudent.weakAreas.map((area, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => analyzeStudentProgress(selectedStudent.id)}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analyze Progress
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={generateAdaptiveLesson}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Adaptive Lesson
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {progressAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Progress Analysis for {selectedStudent?.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Overall Assessment */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Overall Assessment</h4>
                      <p className="text-gray-700 p-3 bg-blue-50 rounded-lg">
                        {progressAnalysis.analysis?.overall_assessment || 'Analysis completed successfully.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Strengths */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {(progressAnalysis.analysis?.strengths || []).map((strength, index) => (
                            <li key={index} className="text-gray-700 flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Areas for Improvement */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-1">
                          {(progressAnalysis.analysis?.areas_for_improvement || []).map((area, index) => (
                            <li key={index} className="text-gray-700 flex items-center">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recommended Focus Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {(progressAnalysis.analysis?.recommended_focus || []).map((focus, index) => (
                          <Badge key={index} variant="outline" className="bg-purple-50">
                            {focus}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Motivational Message */}
                    {progressAnalysis.analysis?.motivational_message && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Motivational Message</h4>
                        <p className="text-gray-700 p-3 bg-green-50 rounded-lg italic">
                          "{progressAnalysis.analysis.motivational_message}"
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            {generatedLesson && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Adaptive Lesson Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Lesson Info */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {generatedLesson.lesson?.title || 'Adaptive Lesson'}
                      </h3>
                      <p className="text-gray-700 mb-3">
                        {generatedLesson.lesson?.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Student: {selectedStudent?.name}</Badge>
                        <Badge variant="outline">Level: {selectedStudent?.level}</Badge>
                        <Badge variant="outline">Focus: {selectedStudent?.weakAreas.join(', ')}</Badge>
                      </div>
                    </div>

                    {/* Adaptation Notes */}
                    {generatedLesson.lesson?.adaptive_notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Adaptation Notes</h4>
                        <p className="text-gray-700 p-3 bg-yellow-50 rounded-lg">
                          {generatedLesson.lesson.adaptive_notes}
                        </p>
                      </div>
                    )}

                    {/* Learning Objectives */}
                    {generatedLesson.lesson?.objectives && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Learning Objectives</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {generatedLesson.lesson.objectives.map((objective, index) => (
                            <li key={index} className="text-gray-700">{objective}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Exercises Preview */}
                    {generatedLesson.lesson?.exercises && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Adaptive Exercises</h4>
                        <div className="space-y-3">
                          {generatedLesson.lesson.exercises.slice(0, 3).map((exercise, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{exercise.question}</span>
                                <Badge variant="outline">{exercise.focus_area}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">{exercise.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Steps */}
                    {generatedLesson.lesson?.next_steps && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Recommended Next Steps</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {generatedLesson.lesson.next_steps.map((step, index) => (
                            <li key={index} className="text-gray-700">{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-center space-x-4 pt-4">
                      <Button variant="outline" onClick={() => setActiveTab('configure')}>
                        Modify Settings
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700">
                        Assign to Student
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
