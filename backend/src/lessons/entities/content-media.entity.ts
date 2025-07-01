import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { MediaFile } from './media-file.entity';

@Entity('content_media')
export class ContentMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'media_id' })
  mediaId: string;

  @Column({ name: 'content_type', length: 50 })
  contentType: string;

  @Column({ name: 'content_id' })
  contentId: string;

  @Column({ name: 'media_role', length: 50, nullable: true })
  mediaRole: string;

  @Column({ name: 'order_index', default: 0 })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => MediaFile, (mediaFile) => mediaFile.contentMedia, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_id' })
  mediaFile: MediaFile;
}
