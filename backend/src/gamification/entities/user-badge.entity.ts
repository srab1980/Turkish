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
import { Badge } from './badge.entity';

@Entity('user_badges')
@Index(['userId', 'badgeId'], { unique: true })
export class UserBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'badge_id' })
  badgeId: string;

  @Column({ name: 'earned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  earnedAt: Date;

  @Column({ name: 'progress_value', nullable: true })
  progressValue?: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean; // Whether user wants to display this badge prominently

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.badges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Badge, (badge) => badge.userBadges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'badge_id' })
  badge: Badge;
}
