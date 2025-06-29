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

@Entity('vocabulary_items')
export class VocabularyItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @Column({ length: 100 })
  turkish: string;

  @Column({ length: 100 })
  english: string;

  @Column({ length: 200, nullable: true })
  pronunciation: string;

  @Column({ type: 'text', nullable: true })
  example: string;

  @Column({ name: 'difficulty_level', default: 1 })
  difficultyLevel: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Lesson, (lesson) => lesson.vocabularyItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}
