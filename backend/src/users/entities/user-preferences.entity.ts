import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { CEFRLevel } from '../../shared/types';
import { User } from './user.entity';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 10, default: 'en' })
  language: string;

  @Column({ length: 10, default: 'light' })
  theme: string;

  @Column({ name: 'email_notifications', default: true })
  emailNotifications: boolean;

  @Column({ name: 'push_notifications', default: true })
  pushNotifications: boolean;

  @Column({ name: 'reminder_notifications', default: true })
  reminderNotifications: boolean;

  @Column({ name: 'achievement_notifications', default: true })
  achievementNotifications: boolean;

  @Column({ name: 'daily_xp_goal', default: 50 })
  dailyXpGoal: number;

  @Column({ name: 'weekly_lesson_goal', default: 5 })
  weeklyLessonGoal: number;

  @Column({
    name: 'target_level',
    type: 'enum',
    enum: CEFRLevel,
    default: CEFRLevel.B2,
  })
  targetLevel: CEFRLevel;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.preferences)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
