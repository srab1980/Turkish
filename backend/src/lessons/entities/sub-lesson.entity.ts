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
import { Exercise } from './exercise.entity';
import { VocabularyItem } from './vocabulary-item.entity';
import { GrammarRule } from './grammar-rule.entity';

export enum SubLessonType {
  PREPARATION = 'preparation',     // HAZIRLIK ÇALIŞMALARI
  READING = 'reading',            // OKUMA
  GRAMMAR = 'grammar',            // DİLBİLGİSİ
  LISTENING = 'listening',        // DİNLEME
  SPEAKING = 'speaking',          // KONUŞMA
  WRITING = 'writing',            // YAZMA
  VOCABULARY = 'vocabulary',      // KELİME LİSTESİ
  CULTURE = 'culture',           // KÜLTÜRDEN KÜLTÜRE
  INTERACTIVE = 'interactive',    // YA SİZ (What About You)
  CLASSROOM = 'classroom',        // SINIF DİLİ
  FUN_LEARNING = 'fun_learning',  // EĞLENELİM ÖĞRENELİM
  REVIEW = 'review',             // NELER ÖĞRENDİK
  ASSESSMENT = 'assessment'       // ÖZ DEĞERLENDİRME
}

@Entity('sub_lessons')
export class SubLesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: SubLessonType })
  type: SubLessonType;

  @Column({ type: 'jsonb', nullable: true })
  content: any; // Flexible content structure for different sub-lesson types

  @Column({ type: 'text', array: true, nullable: true })
  learningObjectives: string[];

  @Column({ name: 'estimated_duration', default: 10 })
  estimatedDuration: number; // in minutes

  @Column({ name: 'difficulty_level', default: 1 })
  difficultyLevel: number;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'is_required', default: true })
  isRequired: boolean; // Some sub-lessons might be optional

  // Media content
  @Column({ name: 'audio_url', nullable: true })
  audioUrl?: string;

  @Column({ name: 'video_url', nullable: true })
  videoUrl?: string;

  @Column({ type: 'text', array: true, nullable: true })
  imageUrls?: string[];

  // Metadata for specific sub-lesson types
  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // For storing type-specific data

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Lesson, (lesson) => lesson.subLessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @OneToMany(() => Exercise, (exercise) => exercise.subLesson, { cascade: true })
  exercises: Exercise[];

  @OneToMany(() => VocabularyItem, (vocabulary) => vocabulary.subLesson, { cascade: true })
  vocabularyItems: VocabularyItem[];

  @OneToMany(() => GrammarRule, (grammar) => grammar.subLesson, { cascade: true })
  grammarRules: GrammarRule[];
}
