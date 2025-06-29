import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole, CEFRLevel } from '../../shared/types';
import { UserPreferences } from './user-preferences.entity';
import { UserProgress } from '../../progress/entities/user-progress.entity';
import { ExerciseAttempt } from '../../progress/entities/exercise-attempt.entity';
import { UserAchievement } from '../../gamification/entities/user-achievement.entity';
import { UserBadge } from '../../gamification/entities/user-badge.entity';
import { ReviewItem } from '../../progress/entities/review-item.entity';
import { Notification } from '../../common/entities/notification.entity';
import { UserSession } from '../../auth/entities/user-session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'profile_image', nullable: true, length: 500 })
  profileImage?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: CEFRLevel,
    default: CEFRLevel.A1,
  })
  level: CEFRLevel;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 0 })
  streak: number;

  @Column({ name: 'last_activity_date', type: 'date', nullable: true })
  lastActivityDate?: Date;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => UserPreferences, (preferences) => preferences.user, {
    cascade: true,
  })
  preferences: UserPreferences;

  @OneToMany(() => UserProgress, (progress) => progress.user)
  progress: UserProgress[];

  @OneToMany(() => ExerciseAttempt, (attempt) => attempt.user)
  exerciseAttempts: ExerciseAttempt[];

  @OneToMany(() => UserAchievement, (achievement) => achievement.user)
  achievements: UserAchievement[];

  @OneToMany(() => ReviewItem, (reviewItem) => reviewItem.user)
  reviewItems: ReviewItem[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToMany(() => UserBadge, (userBadge) => userBadge.user)
  badges: UserBadge[];

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
