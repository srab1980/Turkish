import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { Unit } from '../courses/entities/unit.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Exercise } from '../lessons/entities/exercise.entity';
import { VocabularyItem } from '../lessons/entities/vocabulary-item.entity';
import { GrammarRule } from '../lessons/entities/grammar-rule.entity';

import { VocabularyCategory } from '../lessons/entities/vocabulary-category.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CurriculumImportService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(VocabularyItem)
    private vocabularyRepository: Repository<VocabularyItem>,
    @InjectRepository(GrammarRule)
    private grammarRepository: Repository<GrammarRule>,

    @InjectRepository(VocabularyCategory)
    private vocabularyCategoryRepository: Repository<VocabularyCategory>
  ) {}

  async importA1TurkishCurriculum(): Promise<{
    course: Course;
    units: Unit[];
    lessons: Lesson[];
    exercises: Exercise[];
    vocabulary: VocabularyItem[];
    grammar: GrammarRule[];
  }> {
    // Create the main A1 Turkish course
    const course = await this.createA1Course();
    
    // Import curriculum structure
    const curriculumStructure = await this.loadCurriculumStructure();
    
    // Create units
    const units = await this.createUnits(course.id, curriculumStructure.detailed_units);
    
    // Import vocabulary and grammar inventory
    const vocabularyInventory = await this.loadVocabularyGrammarInventory();
    
    // Create vocabulary items
    const vocabulary = await this.createVocabularyItems(vocabularyInventory.vocabulary_inventory);
    
    // Create grammar rules
    const grammar = await this.createGrammarRules(vocabularyInventory.grammar_inventory);
    
    // Import lessons and exercises
    const { lessons, exercises } = await this.importLessonsAndExercises(units);
    
    return {
      course,
      units,
      lessons,
      exercises,
      vocabulary,
      grammar
    };
  }

  private async createA1Course(): Promise<Course> {
    const courseData = {
      title: 'Turkish A1 - İstanbul Yabancılar İçin Türkçe',
      description: 'Complete A1 level Turkish language course based on official curriculum documents',
      level: 'A1' as any,
      languageCode: 'tr',
      totalUnits: 12,
      estimatedHours: 120,
      isPublished: true,
      orderIndex: 1,
      version: 1
    };

    const existingCourse = await this.courseRepository.findOne({
      where: { title: courseData.title }
    });

    if (existingCourse) {
      return existingCourse;
    }

    const course = this.courseRepository.create(courseData);
    return await this.courseRepository.save(course);
  }

  private async createUnits(courseId: string, unitsData: any[]): Promise<Unit[]> {
    const units = [];

    for (const unitData of unitsData) {
      const unit = this.unitRepository.create({
        courseId,
        title: unitData.title,
        description: unitData.english_title,
        unitNumber: unitData.unit_number,
        learningObjectives: unitData.can_do_statements,
        culturalNotes: unitData.cultural_focus,
        estimatedHours: 10, // Default 10 hours per unit
        orderIndex: unitData.unit_number,
        isPublished: true
      });

      const savedUnit = await this.unitRepository.save(unit);
      units.push(savedUnit);
    }

    return units;
  }

  private async createVocabularyItems(vocabularyInventory: any): Promise<VocabularyItem[]> {
    const vocabularyItems = [];

    for (const [unitKey, unitData] of Object.entries(vocabularyInventory)) {
      const categories = (unitData as any).categories;
      
      for (const [categoryName, categoryWords] of Object.entries(categories)) {
        for (const wordData of categoryWords as any[]) {
          const vocabularyItem = this.vocabularyRepository.create({
            turkishWord: wordData.turkish,
            englishTranslation: wordData.english,
            pronunciation: wordData.pronunciation,
            partOfSpeech: this.inferPartOfSpeech(wordData.turkish),
            difficultyLevel: this.inferDifficultyLevel(unitKey),
            usageContext: wordData.usage,
            exampleSentenceTr: wordData.example || `${wordData.turkish} örnek cümle.`,
            exampleSentenceEn: `Example sentence with ${wordData.english}.`
          });

          const savedItem = await this.vocabularyRepository.save(vocabularyItem);
          vocabularyItems.push(savedItem);
        }
      }
    }

    return vocabularyItems;
  }

  private async createGrammarRules(grammarInventory: any): Promise<GrammarRule[]> {
    const grammarRules = [];

    for (const [unitKey, unitData] of Object.entries(grammarInventory)) {
      const topics = (unitData as any).topics;
      
      for (const topic of topics as any[]) {
        const grammarRule = this.grammarRepository.create({
          title: topic.name,
          description: topic.description,
          explanation: topic.description,
          difficultyLevel: this.inferDifficultyLevel(unitKey),
          grammarType: this.inferGrammarType(topic.name),
          examples: topic.examples,
          rules: topic.exercises || []
        });

        const savedRule = await this.grammarRepository.save(grammarRule);
        grammarRules.push(savedRule);
      }
    }

    return grammarRules;
  }

  private async importLessonsAndExercises(units: Unit[]): Promise<{
    lessons: Lesson[];
    exercises: Exercise[];
  }> {
    const lessons = [];
    const exercises = [];

    // Import specific lesson files
    const lessonFiles = [
      'unit_1_lesson_1.json',
      'unit_1_lesson_2.json',
      'unit_1_lesson_3.json',
      'unit_2_lesson_1.json'
    ];

    for (const lessonFile of lessonFiles) {
      try {
        const lessonData = await this.loadLessonFile(lessonFile);
        const unit = units.find(u => u.unitNumber === 1); // For now, just Unit 1

        if (unit && lessonData) {
          const lesson = await this.createLessonFromData(unit.id, lessonData.lesson);
          lessons.push(lesson);

          // Import exercises for this lesson
          const exerciseFile = lessonFile.replace('.json', '_exercises.json');
          try {
            const exerciseData = await this.loadLessonFile(exerciseFile);
            if (exerciseData && exerciseData.exercises) {
              for (const exerciseItem of exerciseData.exercises) {
                const exercise = await this.createExerciseFromData(lesson.id, exerciseItem);
                exercises.push(exercise);
              }
            }
          } catch (error) {
            console.log(`No exercise file found for ${lessonFile}`);
          }
        }
      } catch (error) {
        console.error(`Error importing lesson ${lessonFile}:`, error);
      }
    }

    return { lessons, exercises };
  }

  private async createLessonFromData(unitId: string, lessonData: any): Promise<Lesson> {
    const lesson = this.lessonRepository.create({
      unitId,
      title: lessonData.title,
      description: lessonData.learningObjectives?.join(', '),
      lessonNumber: lessonData.lessonNumber,
      lessonType: lessonData.lessonType,
      content: lessonData.content,
      learningObjectives: lessonData.learningObjectives,
      prerequisites: lessonData.prerequisites,
      estimatedDuration: lessonData.estimatedDuration,
      difficultyLevel: lessonData.difficultyLevel,
      orderIndex: lessonData.lessonNumber,
      isPublished: true
    });

    return await this.lessonRepository.save(lesson);
  }

  private async createExerciseFromData(lessonId: string, exerciseData: any): Promise<Exercise> {
    const exercise = this.exerciseRepository.create({
      lessonId,
      title: exerciseData.title,
      instructions: exerciseData.instructions,
      content: exerciseData.content,
      correctAnswers: exerciseData.correctAnswers,
      hints: exerciseData.hints,
      feedback: exerciseData.feedback,
      points: exerciseData.points,
      timeLimit: exerciseData.timeLimit,
      difficultyLevel: exerciseData.difficultyLevel,
      orderIndex: exerciseData.orderIndex,
      isPublished: true
    });

    return await this.exerciseRepository.save(exercise);
  }

  private async loadCurriculumStructure(): Promise<any> {
    const filePath = path.join(process.cwd(), 'comprehensive_curriculum_design.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  }

  private async loadVocabularyGrammarInventory(): Promise<any> {
    const filePath = path.join(process.cwd(), 'vocabulary_grammar_inventory.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  }

  private async loadLessonFile(filename: string): Promise<any> {
    const filePath = path.join(process.cwd(), 'curriculum_content', filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  }

  private inferPartOfSpeech(word: string): string {
    // Simple heuristics to infer part of speech
    if (word.endsWith('mak') || word.endsWith('mek')) return 'verb';
    if (word.endsWith('lı') || word.endsWith('li')) return 'adjective';
    return 'noun'; // Default
  }

  private inferDifficultyLevel(unitKey: string): number {
    if (unitKey.includes('unit_1')) return 1;
    if (unitKey.includes('unit_2')) return 2;
    if (unitKey.includes('unit_3')) return 2;
    return 1; // Default
  }

  private inferGrammarType(topicName: string): string {
    if (topicName.toLowerCase().includes('pronoun')) return 'pronouns';
    if (topicName.toLowerCase().includes('verb')) return 'verbs';
    if (topicName.toLowerCase().includes('case')) return 'cases';
    if (topicName.toLowerCase().includes('tense')) return 'tenses';
    return 'general';
  }

  private inferSkillFocus(exerciseTypeId: string): string {
    if (exerciseTypeId.includes('vocab')) return 'vocabulary';
    if (exerciseTypeId.includes('grammar')) return 'grammar';
    if (exerciseTypeId.includes('listening')) return 'listening';
    if (exerciseTypeId.includes('pronunciation')) return 'speaking';
    return 'general';
  }

  private inferInteractionType(exerciseTypeId: string): string {
    if (exerciseTypeId.includes('matching')) return 'drag_drop';
    if (exerciseTypeId.includes('fill_blank')) return 'fill_blank';
    if (exerciseTypeId.includes('comprehension')) return 'multiple_choice';
    if (exerciseTypeId.includes('pronunciation')) return 'audio_response';
    return 'multiple_choice';
  }

  async getCurriculumData(): Promise<{
    courses: Course[];
    units: Unit[];
    lessons: Lesson[];
    exercises: Exercise[];
  }> {
    try {
      // Get all courses with their relationships
      const courses = await this.courseRepository.find({
        relations: ['units', 'units.lessons', 'units.lessons.exercises']
      });

      // Get all units
      const units = await this.unitRepository.find({
        relations: ['course', 'lessons']
      });

      // Get all lessons
      const lessons = await this.lessonRepository.find({
        relations: ['unit', 'exercises']
      });

      // Get all exercises
      const exercises = await this.exerciseRepository.find({
        relations: ['lesson']
      });

      return {
        courses,
        units,
        lessons,
        exercises
      };
    } catch (error) {
      console.error('Error getting curriculum data:', error);
      throw new Error('Failed to retrieve curriculum data');
    }
  }
}
