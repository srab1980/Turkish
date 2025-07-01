import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { SubLesson } from './sub-lesson.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @Column({ name: 'sub_lesson_id', nullable: true })
  subLessonId?: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  // Temporary property to resolve TypeORM metadata issue
  @Column({ type: 'varchar', length: 100, nullable: true })
  exerciseType?: string;

  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'jsonb', nullable: true })
  content: any;

  @Column({ name: 'correct_answers', type: 'jsonb', nullable: true })
  correctAnswers: any;

  @Column({ type: 'jsonb', nullable: true })
  hints: any;

  @Column({ type: 'jsonb', nullable: true })
  feedback: any;

  @Column({ default: 10 })
  points: number;

  @Column({ name: 'time_limit', nullable: true })
  timeLimit: number;

  @Column({ name: 'difficulty_level', default: 1 })
  difficultyLevel: number;

  @Column({ name: 'order_index', nullable: true })
  orderIndex: number;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Lesson, (lesson) => lesson.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => SubLesson, (subLesson) => subLesson.exercises, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'sub_lesson_id' })
  subLesson?: SubLesson;
}
