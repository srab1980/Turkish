import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('review_items')
export class ReviewItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'content_id' })
  contentId: string;

  @Column({ name: 'content_type' })
  contentType: string;

  @ManyToOne(() => User, (user) => user.reviewItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // TODO: Complete review item entity implementation
}
