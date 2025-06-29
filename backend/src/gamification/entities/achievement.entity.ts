import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { UserAchievement } from './user-achievement.entity';

export enum AchievementType {
  LESSON_COMPLETION = 'lesson_completion',
  COURSE_COMPLETION = 'course_completion',
  STREAK = 'streak',
  SCORE = 'score',
  TIME_SPENT = 'time_spent',
  EXERCISE_COUNT = 'exercise_count',
  VOCABULARY_MASTERY = 'vocabulary_mastery',
  PRONUNCIATION = 'pronunciation',
  CONSISTENCY = 'consistency',
  SPECIAL = 'special',
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: AchievementType })
  type: AchievementType;

  @Column({ type: 'enum', enum: AchievementRarity, default: AchievementRarity.COMMON })
  rarity: AchievementRarity;

  @Column({ name: 'icon_url', nullable: true })
  iconUrl?: string;

  @Column({ name: 'badge_color', default: '#3B82F6' })
  badgeColor: string;

  @Column({ name: 'xp_reward', default: 0 })
  xpReward: number;

  @Column({ type: 'jsonb', nullable: true })
  criteria: any; // Flexible criteria for achievement unlocking

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean; // Hidden achievements (surprise unlocks)

  @Column({ name: 'unlock_order', nullable: true })
  unlockOrder?: number; // For sequential achievements

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserAchievement, (userAchievement) => userAchievement.achievement)
  userAchievements: UserAchievement[];
}
