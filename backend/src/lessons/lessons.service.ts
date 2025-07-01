import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Exercise } from './entities/exercise.entity';
import { VocabularyItem } from './entities/vocabulary-item.entity';
import { GrammarRule } from './entities/grammar-rule.entity';
import { 
  CreateLessonDto, 
  UpdateLessonDto, 
  CreateExerciseDto, 
  UpdateExerciseDto,
  CreateVocabularyDto,
  CreateGrammarRuleDto 
} from './dto/create-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(VocabularyItem)
    private vocabularyRepository: Repository<VocabularyItem>,
    @InjectRepository(GrammarRule)
    private grammarRepository: Repository<GrammarRule>,
  ) {}

  // Lesson CRUD operations
  async createLesson(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const lesson = this.lessonRepository.create(createLessonDto);
    return this.lessonRepository.save(lesson);
  }

  async findLessonsByUnit(unitId: string): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { unit: { id: unitId } },
      relations: ['exercises', 'vocabularyItems', 'grammarRules'],
      order: { orderIndex: 'ASC' },
    });
  }

  async findLessonById(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['unit', 'exercises', 'vocabularyItems', 'grammarRules'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async updateLesson(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.findLessonById(id);
    Object.assign(lesson, updateLessonDto);
    return this.lessonRepository.save(lesson);
  }

  async deleteLesson(id: string): Promise<void> {
    const lesson = await this.findLessonById(id);
    await this.lessonRepository.remove(lesson);
  }

  async duplicateLesson(id: string): Promise<Lesson> {
    const originalLesson = await this.findLessonById(id);
    const duplicatedLesson = this.lessonRepository.create({
      ...originalLesson,
      id: undefined,
      title: `${originalLesson.title} (Copy)`,
      isPublished: false,
      createdAt: undefined,
      updatedAt: undefined
    });
    return await this.lessonRepository.save(duplicatedLesson);
  }

  // Exercise CRUD operations
  async createExercise(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: createExerciseDto.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const exercise = this.exerciseRepository.create({
      ...createExerciseDto,
      lesson,
    });

    return this.exerciseRepository.save(exercise);
  }

  async findExercisesByLesson(lessonId: string): Promise<Exercise[]> {
    return this.exerciseRepository.find({
      where: { lesson: { id: lessonId } },
      order: { orderIndex: 'ASC' },
    });
  }

  async findExerciseById(id: string): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id },
      relations: ['lesson'],
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    return exercise;
  }

  async updateExercise(id: string, updateExerciseDto: UpdateExerciseDto): Promise<Exercise> {
    const exercise = await this.findExerciseById(id);
    Object.assign(exercise, updateExerciseDto);
    return this.exerciseRepository.save(exercise);
  }

  async deleteExercise(id: string): Promise<void> {
    const exercise = await this.findExerciseById(id);
    await this.exerciseRepository.remove(exercise);
  }

  // Vocabulary CRUD operations
  async createVocabulary(createVocabularyDto: CreateVocabularyDto): Promise<VocabularyItem> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: createVocabularyDto.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const vocabulary = this.vocabularyRepository.create({
      ...createVocabularyDto,
      lesson,
    });

    return this.vocabularyRepository.save(vocabulary);
  }

  async findVocabularyByLesson(lessonId: string): Promise<VocabularyItem[]> {
    return this.vocabularyRepository.find({
      where: { lesson: { id: lessonId } },
      order: { turkishWord: 'ASC' },
    });
  }

  async updateVocabulary(id: string, updateData: Partial<VocabularyItem>): Promise<VocabularyItem> {
    await this.vocabularyRepository.update(id, updateData);
    const vocabulary = await this.vocabularyRepository.findOne({ where: { id } });
    if (!vocabulary) {
      throw new NotFoundException('Vocabulary item not found');
    }
    return vocabulary;
  }

  async deleteVocabulary(id: string): Promise<void> {
    const vocabulary = await this.vocabularyRepository.findOne({ where: { id } });
    if (!vocabulary) {
      throw new NotFoundException('Vocabulary item not found');
    }
    await this.vocabularyRepository.remove(vocabulary);
  }

  // Grammar Rule CRUD operations
  async createGrammarRule(createGrammarRuleDto: CreateGrammarRuleDto): Promise<GrammarRule> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: createGrammarRuleDto.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const grammarRule = this.grammarRepository.create({
      ...createGrammarRuleDto,
      lesson,
    });

    return this.grammarRepository.save(grammarRule);
  }

  async findGrammarRulesByLesson(lessonId: string): Promise<GrammarRule[]> {
    return this.grammarRepository.find({
      where: { lesson: { id: lessonId } },
      order: { title: 'ASC' },
    });
  }

  async updateGrammarRule(id: string, updateData: Partial<GrammarRule>): Promise<GrammarRule> {
    await this.grammarRepository.update(id, updateData);
    const grammarRule = await this.grammarRepository.findOne({ where: { id } });
    if (!grammarRule) {
      throw new NotFoundException('Grammar rule not found');
    }
    return grammarRule;
  }

  async deleteGrammarRule(id: string): Promise<void> {
    const grammarRule = await this.grammarRepository.findOne({ where: { id } });
    if (!grammarRule) {
      throw new NotFoundException('Grammar rule not found');
    }
    await this.grammarRepository.remove(grammarRule);
  }

  // Lesson statistics and analytics
  async getLessonStats(lessonId: string) {
    const lesson = await this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.exercises', 'exercises')
      .leftJoinAndSelect('lesson.vocabularyItems', 'vocabulary')
      .leftJoinAndSelect('lesson.grammarRules', 'grammar')
      .where('lesson.id = :lessonId', { lessonId })
      .getOne();

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const totalExercises = lesson.exercises?.length || 0;
    const totalVocabulary = lesson.vocabularyItems?.length || 0;
    const totalGrammarRules = lesson.grammarRules?.length || 0;
    const totalPoints = lesson.exercises?.reduce((sum, ex) => sum + (ex.points || 0), 0) || 0;

    return {
      lesson: {
        id: lesson.id,
        title: lesson.title,
        type: lesson.lessonType,
        estimatedMinutes: lesson.estimatedDuration,
      },
      stats: {
        totalExercises,
        totalVocabulary,
        totalGrammarRules,
        totalPoints,
        isComplete: totalExercises > 0,
      },
    };
  }

  async reorderLessons(lessonOrders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of lessonOrders) {
      await this.lessonRepository.update(id, { orderIndex: order });
    }
  }

  async reorderExercises(exerciseOrders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of exerciseOrders) {
      await this.exerciseRepository.update(id, { orderIndex: order });
    }
  }
}
