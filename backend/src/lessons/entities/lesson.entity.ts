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
import { SubLesson } from './sub-lesson.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'unit_id' })
  unitId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'lesson_number', nullable: true })
  lessonNumber: number;

  @Column({ type: 'enum', enum: LessonType, nullable: true })
  lessonType: LessonType;

  @Column({ type: 'jsonb', nullable: true })
  content: any;

  @Column({ type: 'text', array: true, nullable: true })
  learningObjectives: string[];

  @Column({ type: 'text', array: true, nullable: true })
  prerequisites: string[];

  @Column({ name: 'estimated_duration', default: 15 })
  estimatedDuration: number;

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
  @ManyToOne(() => Unit, (unit) => unit.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @OneToMany(() => SubLesson, (subLesson) => subLesson.lesson, { cascade: true })
  subLessons: SubLesson[];

  @OneToMany(() => Exercise, (exercise) => exercise.lesson, { cascade: true })
  exercises: Exercise[];

  @OneToMany(() => VocabularyItem, (vocabulary) => vocabulary.lesson, { cascade: true })
  vocabularyItems: VocabularyItem[];

  @OneToMany(() => GrammarRule, (grammar) => grammar.lesson, { cascade: true })
  grammarRules: GrammarRule[];
}
