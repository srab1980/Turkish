import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany 
} from 'typeorm';
import { UserBadge } from './user-badge.entity';

export enum BadgeType {
  STREAK = 'streak',
  COMPLETION = 'completion',
  MASTERY = 'mastery',
  SPEED = 'speed',
  ACCURACY = 'accuracy',
  CONSISTENCY = 'consistency',
  MILESTONE = 'milestone',
  SPECIAL_EVENT = 'special_event',
}

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: BadgeType })
  type: BadgeType;

  @Column({ name: 'icon_url' })
  iconUrl: string;

  @Column({ name: 'color_primary', default: '#3B82F6' })
  colorPrimary: string;

  @Column({ name: 'color_secondary', default: '#1E40AF' })
  colorSecondary: string;

  @Column({ name: 'xp_reward', default: 0 })
  xpReward: number;

  @Column({ type: 'jsonb', nullable: true })
  requirements: any; // Requirements to earn this badge

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'rarity_level', default: 1 })
  rarityLevel: number; // 1-5, with 5 being most rare

  @Column({ name: 'unlock_order', nullable: true })
  unlockOrder?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserBadge, (userBadge) => userBadge.badge)
  userBadges: UserBadge[];
}
