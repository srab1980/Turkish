import { Injectable } from '@nestjs/common';

@Injectable()
export class LessonTemplateService {
  
  generateLessonTemplate(unitNumber: number, lessonNumber: number, theme: string): any {
    return {
      lesson: {
        id: `lesson-${unitNumber}-${lessonNumber}-${theme.toLowerCase()}`,
        unitId: `unit-${unitNumber}`,
        title: `${theme} (Lesson ${lessonNumber})`,
        lessonNumber,
        lessonType: this.determineLessonType(lessonNumber),
        estimatedDuration: 45,
        difficultyLevel: this.calculateDifficultyLevel(unitNumber, lessonNumber),
        learningObjectives: this.generateLearningObjectives(theme),
        prerequisites: this.generatePrerequisites(unitNumber, lessonNumber),
        content: {
          sections: [
            this.generateWarmupSection(),
            this.generateVocabularySection(theme),
            this.generateDialogueSection(theme),
            this.generateGrammarSection(unitNumber, lessonNumber),
            this.generatePracticeSection()
          ]
        },
        vocabularyFocus: [],
        grammarFocus: [],
        culturalNotes: []
      }
    };
  }

  private determineLessonType(lessonNumber: number): string {
    const types = ['introduction', 'vocabulary', 'grammar', 'practice', 'review'];
    return types[(lessonNumber - 1) % types.length];
  }

  private calculateDifficultyLevel(unitNumber: number, lessonNumber: number): number {
    return Math.min(5, Math.floor((unitNumber - 1) / 3) + 1);
  }

  private generateLearningObjectives(theme: string): string[] {
    return [
      `Learn vocabulary related to ${theme.toLowerCase()}`,
      `Use new vocabulary in context`,
      `Practice pronunciation and listening`,
      `Apply grammar structures in communication`
    ];
  }

  private generatePrerequisites(unitNumber: number, lessonNumber: number): string[] {
    const prerequisites = [];
    
    if (unitNumber > 1 || lessonNumber > 1) {
      for (let u = 1; u <= unitNumber; u++) {
        const maxLesson = u === unitNumber ? lessonNumber - 1 : 3;
        for (let l = 1; l <= maxLesson; l++) {
          prerequisites.push(`lesson-${u}-${l}`);
        }
      }
    }
    
    return prerequisites;
  }

  private generateWarmupSection(): any {
    return {
      type: "warmup",
      title: "HAZIRLIK ÇALIŞMALARI (Preparation Activities)",
      duration: 5,
      content: {
        activity: "Think about the topic and activate prior knowledge",
        instructions: "Reflect on your experience with this topic",
        images: []
      }
    };
  }

  private generateVocabularySection(theme: string): any {
    return {
      type: "vocabulary_introduction",
      title: `${theme} Kelimeleri (${theme} Vocabulary)`,
      duration: 15,
      content: {
        vocabulary: []
      }
    };
  }

  private generateDialogueSection(theme: string): any {
    return {
      type: "dialogue",
      title: "OKUMA (Reading)",
      duration: 10,
      content: {
        dialogue: {
          title: `${theme} Hakkında Konuşma (Talking About ${theme})`,
          setting: `Conversation about ${theme.toLowerCase()}`,
          participants: [],
          lines: [],
          audioUrl: ""
        },
        comprehensionQuestions: []
      }
    };
  }

  private generateGrammarSection(unitNumber: number, lessonNumber: number): any {
    return {
      type: "grammar",
      title: "DİLBİLGİSİ (Grammar)",
      duration: 15,
      content: {
        topic: "Grammar Focus",
        explanation: "Grammar explanation for this lesson",
        grammarPoints: []
      }
    };
  }

  private generatePracticeSection(): any {
    return {
      type: "practice",
      title: "YA SİZ? (What About You?)",
      duration: 5,
      content: {
        activityType: "personalization",
        instructions: "Practice using the new language",
        prompts: []
      }
    };
  }

  generateExerciseTemplate(lessonId: string, exerciseType: string, orderIndex: number): any {
    return {
      id: `exercise-${lessonId}-${orderIndex}`,
      lessonId,
      title: this.getExerciseTitle(exerciseType),
      instructions: this.getExerciseInstructions(exerciseType),
      difficultyLevel: 1,
      points: 10,
      timeLimit: 120,
      orderIndex,
      content: this.generateExerciseContent(exerciseType),
      correctAnswers: {},
      hints: {},
      feedback: {
        correct: "Mükemmel! Excellent!",
        incorrect: "Tekrar deneyin! Try again!",
        partial: "İyi! Good! Keep going!"
      }
    };
  }

  private getExerciseTitle(exerciseType: string): string {
    const titles = {
      'vocab_matching': 'Kelime Eşleştirme (Word Matching)',
      'vocab_fill_blank': 'Boşlukları Doldurun (Fill in the Blanks)',
      'listening_comprehension': 'Dinleme (Listening)',
      'pronunciation_practice': 'Telaffuz Çalışması (Pronunciation Practice)',
      'grammar_conjugation': 'Dilbilgisi Çalışması (Grammar Practice)'
    };
    return titles[exerciseType] || 'Alıştırma (Exercise)';
  }

  private getExerciseInstructions(exerciseType: string): string {
    const instructions = {
      'vocab_matching': 'Match the Turkish words with their English meanings',
      'vocab_fill_blank': 'Complete the sentences with appropriate words',
      'listening_comprehension': 'Listen to the audio and choose the correct answer',
      'pronunciation_practice': 'Listen and repeat the words with correct pronunciation',
      'grammar_conjugation': 'Complete the sentences with correct grammar forms'
    };
    return instructions[exerciseType] || 'Complete the exercise';
  }

  private generateExerciseContent(exerciseType: string): any {
    const contentTemplates = {
      'vocab_matching': {
        type: 'drag_drop_matching',
        pairs: []
      },
      'vocab_fill_blank': {
        type: 'fill_in_blank',
        dialogue: [],
        wordBank: []
      },
      'listening_comprehension': {
        type: 'audio_multiple_choice',
        audioUrl: '',
        questions: []
      },
      'pronunciation_practice': {
        type: 'speech_recognition',
        words: []
      },
      'grammar_conjugation': {
        type: 'suffix_completion',
        sentences: []
      }
    };
    
    return contentTemplates[exerciseType] || { type: 'generic' };
  }

  generateUnitTemplate(unitNumber: number, title: string, theme: string): any {
    return {
      unit: {
        id: `unit-${unitNumber}`,
        title: `${title} (${theme})`,
        unitNumber,
        description: `Unit ${unitNumber}: ${theme}`,
        learningObjectives: [
          `Master vocabulary related to ${theme.toLowerCase()}`,
          `Use appropriate grammar structures`,
          `Engage in basic conversations about ${theme.toLowerCase()}`,
          `Understand cultural context`
        ],
        culturalFocus: `Turkish culture related to ${theme.toLowerCase()}`,
        estimatedHours: 10,
        lessons: this.generateLessonList(unitNumber, 3) // 3 lessons per unit
      }
    };
  }

  private generateLessonList(unitNumber: number, lessonCount: number): any[] {
    const lessons = [];
    for (let i = 1; i <= lessonCount; i++) {
      lessons.push({
        lessonNumber: i,
        title: `Lesson ${i}`,
        type: this.determineLessonType(i),
        estimatedDuration: 45
      });
    }
    return lessons;
  }

  generateCourseTemplate(): any {
    return {
      course: {
        title: 'Turkish A1 - Complete Beginner Course',
        description: 'Comprehensive A1 level Turkish language course',
        level: 'A1',
        languageCode: 'tr',
        totalUnits: 12,
        estimatedHours: 120,
        units: this.generateAllUnits()
      }
    };
  }

  private generateAllUnits(): any[] {
    const unitThemes = [
      { title: 'MERHABA', theme: 'Greetings and Introductions' },
      { title: 'NEREDE?', theme: 'Places and Locations' },
      { title: 'NE ZAMAN?', theme: 'Time and Schedule' },
      { title: 'AİLE', theme: 'Family and Relationships' },
      { title: 'YEMEK', theme: 'Food and Dining' },
      { title: 'ALIŞVERİŞ', theme: 'Shopping and Commerce' },
      { title: 'ULAŞIM', theme: 'Transportation' },
      { title: 'SAĞLIK', theme: 'Health and Medical' },
      { title: 'GEÇMİŞ', theme: 'Past Experiences' },
      { title: 'GELECEK', theme: 'Future Plans' },
      { title: 'HAVA', theme: 'Weather and Seasons' },
      { title: 'KÜLTÜR', theme: 'Turkish Culture' }
    ];

    return unitThemes.map((unit, index) => 
      this.generateUnitTemplate(index + 1, unit.title, unit.theme)
    );
  }
}
