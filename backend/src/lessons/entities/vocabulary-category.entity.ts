import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { VocabularyItem } from './vocabulary-item.entity';

@Entity('vocabulary_categories')
export class VocabularyCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'color_code', length: 7, nullable: true })
  colorCode: string;

  @Column({ length: 100, nullable: true })
  icon: string;

  @Column({ name: 'order_index', default: 0 })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToMany(() => VocabularyItem)
  @JoinTable({
    name: 'vocabulary_category_mappings',
    joinColumn: { name: 'category_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'vocabulary_id', referencedColumnName: 'id' }
  })
  vocabularyItems: VocabularyItem[];
}
