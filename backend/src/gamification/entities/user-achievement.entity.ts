import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Achievement } from './achievement.entity';

@Entity('user_achievements')
@Index(['userId', 'achievementId'], { unique: true })
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'achievement_id' })
  achievementId: string;

  @Column({ name: 'unlocked_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  unlockedAt: Date;

  @Column({ name: 'progress_value', nullable: true })
  progressValue?: number; // For tracking progress towards achievement

  @Column({ name: 'is_notified', default: false })
  isNotified: boolean; // Whether user has been notified of this achievement

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any; // Additional data about how achievement was earned

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.achievements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Achievement, (achievement) => achievement.userAchievements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;
}
