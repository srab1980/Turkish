import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('file_uploads')
export class FileUpload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column({ name: 'original_name' })
  originalName: string;

  // TODO: Complete file upload entity implementation
}
