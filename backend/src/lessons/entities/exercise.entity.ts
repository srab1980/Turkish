import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { ExerciseType } from '../../shared/types';
import { Lesson } from './lesson.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @Column({ type: 'enum', enum: ExerciseType })
  type: ExerciseType;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'jsonb', nullable: true })
  options: string[];

  @Column({ name: 'correct_answer', type: 'text' })
  correctAnswer: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ name: 'order_index' })
  order: number;

  @Column({ default: 5 })
  points: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Lesson, (lesson) => lesson.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}
