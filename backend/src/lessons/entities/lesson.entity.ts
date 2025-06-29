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
import { LessonType } from '../../shared/types';
import { Unit } from '../../courses/entities/unit.entity';
import { Exercise } from './exercise.entity';
import { VocabularyItem } from './vocabulary-item.entity';
import { GrammarRule } from './grammar-rule.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'unit_id' })
  unitId: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: LessonType })
  type: LessonType;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'order_index' })
  order: number;

  @Column({ name: 'xp_reward', default: 10 })
  xpReward: number;

  @Column({ name: 'estimated_minutes', default: 15 })
  estimatedMinutes: number;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Unit, (unit) => unit.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @OneToMany(() => Exercise, (exercise) => exercise.lesson, { cascade: true })
  exercises: Exercise[];

  @OneToMany(() => VocabularyItem, (vocabulary) => vocabulary.lesson, { cascade: true })
  vocabularyItems: VocabularyItem[];

  @OneToMany(() => GrammarRule, (grammar) => grammar.lesson, { cascade: true })
  grammarRules: GrammarRule[];
}
