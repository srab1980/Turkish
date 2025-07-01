import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { Course } from './course.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'course_id' })
  courseId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'unit_number', nullable: true })
  unitNumber: number;

  @Column({ type: 'text', array: true, nullable: true })
  learningObjectives: string[];

  @Column({ type: 'text', nullable: true })
  culturalNotes: string;

  @Column({ name: 'estimated_hours', default: 0 })
  estimatedHours: number;

  @Column({ name: 'order_index', nullable: true })
  orderIndex: number;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Course, (course) => course.units, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => Lesson, (lesson) => lesson.unit, { cascade: true })
  lessons: Lesson[];
}
