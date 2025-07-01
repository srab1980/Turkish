import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubLesson, SubLessonType } from './entities/sub-lesson.entity';

export interface CreateSubLessonDto {
  lessonId: string;
  title: string;
  description?: string;
  type: SubLessonType;
  content?: any;
  learningObjectives?: string[];
  estimatedDuration?: number;
  difficultyLevel?: number;
  orderIndex: number;
  isRequired?: boolean;
  audioUrl?: string;
  videoUrl?: string;
  imageUrls?: string[];
  metadata?: any;
}

export interface UpdateSubLessonDto {
  title?: string;
  description?: string;
  content?: any;
  learningObjectives?: string[];
  estimatedDuration?: number;
  difficultyLevel?: number;
  orderIndex?: number;
  isPublished?: boolean;
  isRequired?: boolean;
  audioUrl?: string;
  videoUrl?: string;
  imageUrls?: string[];
  metadata?: any;
}

@Injectable()
export class SubLessonsService {
  constructor(
    @InjectRepository(SubLesson)
    private subLessonRepository: Repository<SubLesson>,
  ) {}

  async create(createSubLessonDto: CreateSubLessonDto): Promise<SubLesson> {
    const subLesson = this.subLessonRepository.create(createSubLessonDto);
    return await this.subLessonRepository.save(subLesson);
  }

  async findAll(): Promise<SubLesson[]> {
    return await this.subLessonRepository.find({
      relations: ['lesson', 'exercises', 'vocabularyItems', 'grammarRules'],
      order: { orderIndex: 'ASC' }
    });
  }

  async findByLessonId(lessonId: string): Promise<SubLesson[]> {
    return await this.subLessonRepository.find({
      where: { lessonId },
      relations: ['exercises', 'vocabularyItems', 'grammarRules'],
      order: { orderIndex: 'ASC' }
    });
  }

  async findByType(type: SubLessonType): Promise<SubLesson[]> {
    return await this.subLessonRepository.find({
      where: { type },
      relations: ['lesson', 'exercises', 'vocabularyItems', 'grammarRules'],
      order: { orderIndex: 'ASC' }
    });
  }

  async findOne(id: string): Promise<SubLesson> {
    const subLesson = await this.subLessonRepository.findOne({
      where: { id },
      relations: ['lesson', 'exercises', 'vocabularyItems', 'grammarRules']
    });

    if (!subLesson) {
      throw new NotFoundException(`SubLesson with ID ${id} not found`);
    }

    return subLesson;
  }

  async update(id: string, updateSubLessonDto: UpdateSubLessonDto): Promise<SubLesson> {
    const subLesson = await this.findOne(id);
    Object.assign(subLesson, updateSubLessonDto);
    return await this.subLessonRepository.save(subLesson);
  }

  async remove(id: string): Promise<void> {
    const subLesson = await this.findOne(id);
    await this.subLessonRepository.remove(subLesson);
  }

  async publish(id: string): Promise<SubLesson> {
    return await this.update(id, { isPublished: true });
  }

  async unpublish(id: string): Promise<SubLesson> {
    return await this.update(id, { isPublished: false });
  }

  async reorderSubLessons(lessonId: string, subLessonIds: string[]): Promise<SubLesson[]> {
    const subLessons = await this.findByLessonId(lessonId);
    
    for (let i = 0; i < subLessonIds.length; i++) {
      const subLesson = subLessons.find(sl => sl.id === subLessonIds[i]);
      if (subLesson) {
        subLesson.orderIndex = i + 1;
        await this.subLessonRepository.save(subLesson);
      }
    }

    return await this.findByLessonId(lessonId);
  }

  // Template method to create standard sub-lessons for a lesson
  async createStandardSubLessons(lessonId: string): Promise<SubLesson[]> {
    const standardTypes = [
      { type: SubLessonType.PREPARATION, title: 'Hazırlık Çalışmaları', order: 1 },
      { type: SubLessonType.READING, title: 'Okuma', order: 2 },
      { type: SubLessonType.VOCABULARY, title: 'Kelime Listesi', order: 3 },
      { type: SubLessonType.GRAMMAR, title: 'Dilbilgisi', order: 4 },
      { type: SubLessonType.LISTENING, title: 'Dinleme', order: 5 },
      { type: SubLessonType.SPEAKING, title: 'Konuşma', order: 6 },
      { type: SubLessonType.WRITING, title: 'Yazma', order: 7 },
      { type: SubLessonType.CULTURE, title: 'Kültürden Kültüre', order: 8 },
      { type: SubLessonType.REVIEW, title: 'Neler Öğrendik', order: 9 },
      { type: SubLessonType.ASSESSMENT, title: 'Öz Değerlendirme', order: 10 }
    ];

    const subLessons: SubLesson[] = [];
    
    for (const template of standardTypes) {
      const subLesson = await this.create({
        lessonId,
        title: template.title,
        type: template.type,
        orderIndex: template.order,
        estimatedDuration: 15, // Default 15 minutes
        difficultyLevel: 1,
        isRequired: template.type !== SubLessonType.CULTURE // Culture is optional
      });
      subLessons.push(subLesson);
    }

    return subLessons;
  }
}
