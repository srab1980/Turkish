import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

@Entity('content_versions')
@Index(['contentType', 'contentId', 'version'], { unique: true })
export class ContentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'content_type', length: 50 })
  contentType: string; // course, unit, lesson, exercise, vocabulary, grammar

  @Column({ name: 'content_id' })
  contentId: string;

  @Column()
  version: number;

  @Column({ type: 'jsonb' })
  content: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'change_summary', type: 'text', nullable: true })
  changeSummary: string;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
