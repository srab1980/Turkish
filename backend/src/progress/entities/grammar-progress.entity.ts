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
import { GrammarRule } from '../../lessons/entities/grammar-rule.entity';

@Entity('grammar_progress')
@Unique(['userId', 'grammarPointId'])
export class GrammarProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'grammar_point_id' })
  grammarPointId: string;

  @Column({ name: 'understanding_level', default: 0 })
  understandingLevel: number; // 0-5 scale

  @Column({ name: 'correct_attempts', default: 0 })
  correctAttempts: number;

  @Column({ name: 'total_attempts', default: 0 })
  totalAttempts: number;

  @Column({ name: 'last_practiced_at', type: 'timestamp', nullable: true })
  lastPracticedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => GrammarRule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grammar_point_id' })
  grammarRule: GrammarRule;
}
