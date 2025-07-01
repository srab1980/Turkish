import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from 'typeorm';
import { ContentMedia } from './content-media.entity';

@Entity('media_files')
export class MediaFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  filename: string;

  @Column({ name: 'original_filename', length: 255, nullable: true })
  originalFilename: string;

  @Column({ name: 'file_type', length: 50 })
  fileType: string;

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ length: 500 })
  url: string;

  @Column({ name: 'thumbnail_url', length: 500, nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ name: 'alt_text', type: 'text', nullable: true })
  altText: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @OneToMany(() => ContentMedia, (contentMedia) => contentMedia.mediaFile)
  contentMedia: ContentMedia[];
}
