import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { ContentVersion } from './content-version.entity';

@Entity('version_history')
export class VersionHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id' })
  versionId: string;

  @Column({ length: 50 })
  action: string; // created, updated, published, unpublished, deleted

  @Column({ name: 'performed_by', nullable: true })
  performedBy: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  changes: any; // Detailed change information

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => ContentVersion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'version_id' })
  version: ContentVersion;
}
