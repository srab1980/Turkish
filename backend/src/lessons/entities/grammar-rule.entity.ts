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

@Entity('grammar_points')
export class GrammarRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  explanation: string;

  @Column({ name: 'difficulty_level', default: 1 })
  difficultyLevel: number;

  @Column({ name: 'grammar_type', length: 100, nullable: true })
  grammarType: string;

  @Column({ type: 'jsonb', nullable: true })
  examples: any;

  @Column({ type: 'text', array: true, nullable: true })
  rules: string[];

  @Column({ type: 'text', array: true, nullable: true })
  exceptions: string[];

  @Column({ name: 'related_points', type: 'uuid', array: true, nullable: true })
  relatedPoints: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations - keeping lesson relation for backward compatibility
  @Column({ name: 'lesson_id', nullable: true })
  lessonId: string;

  @Column({ name: 'sub_lesson_id', nullable: true })
  subLessonId?: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.grammarRules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => SubLesson, (subLesson) => subLesson.grammarRules, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'sub_lesson_id' })
  subLesson?: SubLesson;
}
