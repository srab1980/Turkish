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
import { LessonType } from '../shared/types';
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

    // Try to load from extracted Word document content first
    try {
      console.log('🔍 DEBUG: Attempting to load extracted curriculum content...');
      const extractedLessons = await this.loadExtractedCurriculumContent();
      console.log(`🔍 DEBUG: Extracted lessons count: ${extractedLessons.length}`);

      if (extractedLessons.length > 0) {
        console.log(`✅ Found ${extractedLessons.length} lessons from extracted Word documents`);

        for (const lessonData of extractedLessons) {
          console.log(`🔍 DEBUG: Processing lesson ${lessonData.title} for unit ${lessonData.unitNumber}`);
          const unit = units.find(u => u.unitNumber === lessonData.unitNumber);
          if (unit) {
            const lesson = await this.createLessonFromExtractedData(unit.id, lessonData);
            lessons.push(lesson);

            // Create basic exercises for each lesson
            const lessonExercises = await this.createBasicExercisesForLesson(lesson.id, lessonData);
            exercises.push(...lessonExercises);
          } else {
            console.warn(`⚠️ No unit found for lesson ${lessonData.title} (unit ${lessonData.unitNumber})`);
          }
        }

        console.log(`✅ Successfully created ${lessons.length} lessons and ${exercises.length} exercises from extracted content`);
        return { lessons, exercises };
      } else {
        console.log('⚠️ No extracted lessons found, falling back to JSON files');
      }
    } catch (error) {
      console.error('❌ Error loading extracted curriculum content:', error);
      console.warn('Could not load extracted curriculum content, falling back to JSON files:', error.message);
    }

    // Fallback to original JSON file loading
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

  private async loadExtractedCurriculumContent(): Promise<any[]> {
    const lessons = [];

    try {
      console.log('🔍 DEBUG: Starting loadExtractedCurriculumContent...');

      // Load textbook analysis
      const textbookPath = path.join(process.cwd(), 'curriculum_analysis', 'textbook_content.json');
      const workbookPath = path.join(process.cwd(), 'curriculum_analysis', 'workbook_content.json');

      console.log(`🔍 DEBUG: Checking textbook path: ${textbookPath}`);
      console.log(`🔍 DEBUG: Textbook exists: ${fs.existsSync(textbookPath)}`);

      // Prioritize textbook content as the primary source to avoid duplicates
      if (fs.existsSync(textbookPath)) {
        console.log('📖 Loading textbook content as primary source...');
        const textbookContent = JSON.parse(fs.readFileSync(textbookPath, 'utf8'));
        console.log(`📖 Textbook paragraphs: ${textbookContent.paragraphs?.length || 0}`);
        const textbookLessons = this.extractLessonsFromContent(textbookContent, 'textbook');
        console.log(`📖 Extracted ${textbookLessons.length} lessons from textbook`);
        lessons.push(...textbookLessons);

        console.log('✅ Using textbook as primary source, skipping workbook to avoid duplicates');
      } else if (fs.existsSync(workbookPath)) {
        // Only use workbook if textbook is not available
        console.log('📝 Loading workbook content as fallback source...');
        const workbookContent = JSON.parse(fs.readFileSync(workbookPath, 'utf8'));
        console.log(`📝 Workbook paragraphs: ${workbookContent.paragraphs?.length || 0}`);
        const workbookLessons = this.extractLessonsFromContent(workbookContent, 'workbook');
        console.log(`📝 Extracted ${workbookLessons.length} lessons from workbook`);
        lessons.push(...workbookLessons);
      } else {
        console.log('❌ No curriculum content files found');
      }

      console.log(`🔍 DEBUG: Total lessons extracted: ${lessons.length}`);
      return lessons;
    } catch (error) {
      console.error('❌ Error in loadExtractedCurriculumContent:', error);
      return [];
    }
  }

  private extractLessonsFromContent(content: any, source: string): any[] {
    const lessons = [];

    console.log(`🔍 DEBUG: extractLessonsFromContent called for ${source}`);
    console.log(`🔍 DEBUG: Content has paragraphs: ${!!content.paragraphs}`);
    console.log(`🔍 DEBUG: Paragraphs count: ${content.paragraphs?.length || 0}`);

    if (!content.paragraphs) {
      console.log('❌ No paragraphs found in content');
      return lessons;
    }

    // Look for unit patterns and lesson structures
    let currentUnit = 1;
    let lessonCounter = 1;

    console.log('🔍 DEBUG: Creating lessons based on content structure...');
    console.log('🔍 DEBUG: Each unit will have 3 lessons (A, B, C)');

    // Create lessons based on content structure
    // Each unit should have 3 lessons (A, B, C)
    for (let unitNum = 1; unitNum <= 12; unitNum++) {
      for (let lessonNum = 1; lessonNum <= 3; lessonNum++) {
        const lessonId = `${unitNum}-${lessonNum}`;
        const lessonTitle = this.generateLessonTitle(unitNum, lessonNum);

        console.log(`🔍 DEBUG: Creating lesson ${lessonId}: ${lessonTitle}`);

        lessons.push({
          id: lessonId,
          unitNumber: unitNum,
          lessonNumber: lessonNum,
          title: lessonTitle,
          description: this.generateLessonDescription(unitNum, lessonNum),
          content: this.extractLessonContent(content, unitNum, lessonNum),
          vocabulary: this.extractVocabularyForLesson(content, unitNum, lessonNum),
          grammar: this.extractGrammarForLesson(content, unitNum, lessonNum),
          source: source,
          estimatedDuration: 45,
          difficultyLevel: Math.min(3, Math.ceil(unitNum / 4)),
          lessonType: lessonNum === 1 ? LessonType.VOCABULARY : lessonNum === 2 ? LessonType.GRAMMAR : LessonType.READING
        });
      }
    }

    console.log(`✅ Created ${lessons.length} lessons from ${source}`);
    return lessons;
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

  private generateLessonTitle(unitNum: number, lessonNum: number): string {
    const unitTitles = [
      'MERHABA', 'NEREDE?', 'GÜNLÜK HAYAT', 'AİLE', 'YEMEK', 'ALIŞVERİŞ',
      'ULAŞIM', 'SAĞLIK', 'GEÇMİŞ', 'GELECEK', 'HAVA DURUMU', 'KÜLTÜR'
    ];

    const lessonTypes = ['A', 'B', 'C'];
    const unitTitle = unitTitles[unitNum - 1] || `ÜNİTE ${unitNum}`;

    return `${unitTitle} ${unitNum}${lessonTypes[lessonNum - 1]}`;
  }

  private generateLessonDescription(unitNum: number, lessonNum: number): string {
    const descriptions = {
      1: ['Greetings and introductions', 'Personal information', 'Basic conversations'],
      2: ['Locations and directions', 'Places in the city', 'Asking for directions'],
      3: ['Daily routines', 'Time expressions', 'Daily activities'],
      4: ['Family members', 'Relationships', 'Family descriptions'],
      5: ['Food and drinks', 'Ordering food', 'Cooking vocabulary'],
      6: ['Shopping', 'Prices and money', 'Clothing and items'],
      7: ['Transportation', 'Travel vocabulary', 'Getting around'],
      8: ['Health and body', 'Medical vocabulary', 'Health problems'],
      9: ['Past tense', 'Past experiences', 'Storytelling'],
      10: ['Future plans', 'Intentions', 'Predictions'],
      11: ['Weather', 'Seasons', 'Weather descriptions'],
      12: ['Turkish culture', 'Traditions', 'Cultural practices']
    };

    const unitDescriptions = descriptions[unitNum] || ['Basic Turkish', 'Language practice', 'Communication skills'];
    return unitDescriptions[lessonNum - 1] || `Unit ${unitNum} Lesson ${lessonNum}`;
  }

  private extractLessonContent(content: any, unitNum: number, lessonNum: number): string {
    // Extract relevant content for this lesson from the document
    const unitPattern = new RegExp(`ÜNİTE\\s*${unitNum}|UNIT\\s*${unitNum}`, 'i');
    const relevantParagraphs = content.paragraphs.filter((p: any) =>
      p.text && (p.text.match(unitPattern) || p.text.length > 20)
    );

    // Take a subset of paragraphs for this specific lesson
    const startIndex = (lessonNum - 1) * Math.floor(relevantParagraphs.length / 3);
    const endIndex = lessonNum * Math.floor(relevantParagraphs.length / 3);
    const lessonParagraphs = relevantParagraphs.slice(startIndex, endIndex);

    return lessonParagraphs.map((p: any) => p.text).join('\n\n').substring(0, 1000);
  }

  private extractVocabularyForLesson(content: any, unitNum: number, lessonNum: number): string[] {
    // Extract vocabulary based on unit themes
    const vocabularyByUnit = {
      1: ['merhaba', 'günaydın', 'iyi günler', 'nasılsınız', 'teşekkürler'],
      2: ['nerede', 'burada', 'şurada', 'orada', 'sağda', 'solda'],
      3: ['günlük', 'sabah', 'öğle', 'akşam', 'gece', 'saat'],
      4: ['aile', 'anne', 'baba', 'kardeş', 'çocuk', 'eş'],
      5: ['yemek', 'su', 'çay', 'kahve', 'ekmek', 'et'],
      6: ['alışveriş', 'para', 'fiyat', 'ucuz', 'pahalı', 'satın almak'],
      7: ['ulaşım', 'otobüs', 'metro', 'taksi', 'araba', 'yürümek'],
      8: ['sağlık', 'hasta', 'doktor', 'hastane', 'ilaç', 'ağrı'],
      9: ['geçmiş', 'dün', 'geçen', 'önce', 'sonra', 'zaman'],
      10: ['gelecek', 'yarın', 'gelecek', 'plan', 'istemek', 'olmak'],
      11: ['hava', 'güneş', 'yağmur', 'kar', 'sıcak', 'soğuk'],
      12: ['kültür', 'gelenek', 'bayram', 'müzik', 'dans', 'sanat']
    };

    return vocabularyByUnit[unitNum] || ['kelime', 'sözcük', 'anlam'];
  }

  private extractGrammarForLesson(content: any, unitNum: number, lessonNum: number): string[] {
    // Extract grammar topics based on unit progression
    const grammarByUnit = {
      1: ['Present tense "to be"', 'Personal pronouns', 'Basic sentence structure'],
      2: ['Question words', 'Location expressions', 'Demonstratives'],
      3: ['Present continuous tense', 'Time expressions', 'Daily routine verbs'],
      4: ['Possessive pronouns', 'Family vocabulary', 'Adjective agreement'],
      5: ['Object pronouns', 'Food vocabulary', 'Quantity expressions'],
      6: ['Numbers', 'Shopping expressions', 'Comparative adjectives'],
      7: ['Transportation verbs', 'Direction expressions', 'Modal verbs'],
      8: ['Body parts', 'Health expressions', 'Necessity modals'],
      9: ['Past tense', 'Time markers', 'Narrative structure'],
      10: ['Future tense', 'Intention expressions', 'Conditional sentences'],
      11: ['Weather expressions', 'Seasonal vocabulary', 'Descriptive adjectives'],
      12: ['Cultural expressions', 'Traditional vocabulary', 'Complex sentences']
    };

    return grammarByUnit[unitNum] || ['Basic grammar', 'Sentence structure'];
  }

  private async createLessonFromExtractedData(unitId: string, lessonData: any): Promise<Lesson> {
    const lesson = this.lessonRepository.create({
      unitId,
      title: lessonData.title,
      description: lessonData.description,
      content: lessonData.content,
      learningObjectives: [
        `Learn ${lessonData.title} vocabulary`,
        `Practice ${lessonData.title} grammar`,
        `Develop communication skills`
      ],
      estimatedDuration: lessonData.estimatedDuration,
      difficultyLevel: lessonData.difficultyLevel,
      lessonNumber: lessonData.lessonNumber,
      lessonType: lessonData.lessonType,
      isPublished: true,
      orderIndex: lessonData.lessonNumber
    });

    return await this.lessonRepository.save(lesson);
  }

  private async createBasicExercisesForLesson(lessonId: string, lessonData: any): Promise<Exercise[]> {
    const exercises = [];

    // Create vocabulary exercise
    const vocabExercise = this.exerciseRepository.create({
      lessonId,
      type: 'vocabulary_matching',
      title: `${lessonData.title} - Vocabulary Practice`,
      instructions: 'Match the Turkish words with their English meanings',
      content: {
        type: 'vocabulary_matching',
        vocabulary: lessonData.vocabulary
      },
      correctAnswers: lessonData.vocabulary,
      hints: ['Look for similar sounds', 'Think about the context'],
      feedback: {
        correct: 'Excellent! Mükemmel!',
        incorrect: 'Try again! Tekrar deneyin!',
        partial: 'Good progress! İyi gidiyor!'
      },
      points: 10,
      timeLimit: 120,
      difficultyLevel: lessonData.difficultyLevel,
      orderIndex: 1,
      isPublished: true
    });

    exercises.push(await this.exerciseRepository.save(vocabExercise));

    return exercises;
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
