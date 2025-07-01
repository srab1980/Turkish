import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('user_progress')
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'course_id', nullable: true })
  courseId: string;

  @Column({ name: 'unit_id', nullable: true })
  unitId: string;

  @Column({ name: 'lesson_id', nullable: true })
  lessonId: string;

  @Column({ name: 'exercise_id', nullable: true })
  exerciseId: string;

  @Column({ name: 'progress_type', length: 50 })
  progressType: string; // course, unit, lesson, exercise, vocabulary, grammar

  @Column({ length: 50, default: 'not_started' })
  status: string; // not_started, in_progress, completed, mastered

  @Column({ nullable: true })
  score: number;

  @Column({ name: 'max_score', nullable: true })
  maxScore: number;

  @Column({ default: 0 })
  attempts: number;

  @Column({ name: 'attempts_count', default: 0 })
  attemptsCount: number;

  @Column({ name: 'best_score', nullable: true })
  bestScore: number;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @Column({ name: 'time_spent', default: 0 })
  timeSpent: number;

  @Column({ name: 'first_attempt_at', type: 'timestamp', nullable: true })
  firstAttemptAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'last_accessed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastAccessedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}
