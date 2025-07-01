import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { VocabularyItem } from '../../lessons/entities/vocabulary-item.entity';

@Entity('vocabulary_progress')
@Unique(['userId', 'vocabularyId'])
export class VocabularyProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'vocabulary_id' })
  vocabularyId: string;

  @Column({ name: 'mastery_level', default: 0 })
  masteryLevel: number; // 0-5 scale

  @Column({ name: 'correct_attempts', default: 0 })
  correctAttempts: number;

  @Column({ name: 'total_attempts', default: 0 })
  totalAttempts: number;

  @Column({ name: 'last_reviewed_at', type: 'timestamp', nullable: true })
  lastReviewedAt: Date;

  @Column({ name: 'next_review_at', type: 'timestamp', nullable: true })
  nextReviewAt: Date;

  @Column({ name: 'spaced_repetition_interval', default: 1 })
  spacedRepetitionInterval: number; // days

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => VocabularyItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabularyItem: VocabularyItem;
}
