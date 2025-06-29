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

@Entity('grammar_rules')
export class GrammarRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  explanation: string;

  @Column({ type: 'jsonb', nullable: true })
  examples: string[];

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ name: 'difficulty_level', default: 1 })
  difficultyLevel: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Lesson, (lesson) => lesson.grammarRules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}
