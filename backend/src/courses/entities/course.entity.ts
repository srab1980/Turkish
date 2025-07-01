import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { CEFRLevel } from '../../shared/types';
import { Unit } from './unit.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: CEFRLevel })
  level: CEFRLevel;

  @Column({ name: 'language_code', length: 5, default: 'tr' })
  languageCode: string;

  @Column({ name: 'total_units', default: 0 })
  totalUnits: number;

  @Column({ name: 'estimated_hours', default: 0 })
  estimatedHours: number;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'order_index', default: 0 })
  orderIndex: number;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'version', default: 1 })
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Unit, (unit) => unit.course, { cascade: true })
  units: Unit[];
}
