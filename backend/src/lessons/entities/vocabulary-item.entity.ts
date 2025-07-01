import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { SubLesson } from './sub-lesson.entity';

@Entity('vocabulary')
export class VocabularyItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'turkish_word', length: 255 })
  turkishWord: string;

  @Column({ name: 'english_translation', length: 255 })
  englishTranslation: string;

  @Column({ length: 255, nullable: true })
  pronunciation: string;

  @Column({ name: 'part_of_speech', length: 50, nullable: true })
  partOfSpeech: string;

  @Column({ name: 'difficulty_level', default: 1 })
  difficultyLevel: number;

  @Column({ name: 'frequency_rank', nullable: true })
  frequencyRank: number;

  @Column({ name: 'usage_context', type: 'text', nullable: true })
  usageContext: string;

  @Column({ name: 'example_sentence_tr', type: 'text', nullable: true })
  exampleSentenceTr: string;

  @Column({ name: 'example_sentence_en', type: 'text', nullable: true })
  exampleSentenceEn: string;

  @Column({ name: 'audio_url', length: 500, nullable: true })
  audioUrl: string;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations - keeping lesson relation for backward compatibility
  @Column({ name: 'lesson_id', nullable: true })
  lessonId: string;

  @Column({ name: 'sub_lesson_id', nullable: true })
  subLessonId?: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.vocabularyItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => SubLesson, (subLesson) => subLesson.vocabularyItems, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'sub_lesson_id' })
  subLesson?: SubLesson;
}
