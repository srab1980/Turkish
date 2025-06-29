import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  REMINDER = 'reminder',
  ACHIEVEMENT = 'achievement',
  PROGRESS = 'progress',
  LESSON_COMPLETE = 'lesson_complete',
  STREAK_MILESTONE = 'streak_milestone',
  LEVEL_UP = 'level_up',
  DAILY_GOAL = 'daily_goal',
  WEEKLY_GOAL = 'weekly_goal',
  SYSTEM = 'system',
  SOCIAL = 'social'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM
  })
  priority: NotificationPriority;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    array: true,
    default: [NotificationChannel.IN_APP]
  })
  channels: NotificationChannel[];

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'is_sent', default: false })
  isSent: boolean;

  @Column({ name: 'scheduled_for', nullable: true })
  scheduledFor: Date;

  @Column({ name: 'sent_at', nullable: true })
  sentAt: Date;

  @Column({ name: 'read_at', nullable: true })
  readAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // Additional data like action URLs, related entity IDs, etc.

  @Column({ name: 'action_url', nullable: true })
  actionUrl: string;

  @Column({ name: 'icon_url', nullable: true })
  iconUrl: string;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
