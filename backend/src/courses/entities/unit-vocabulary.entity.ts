import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Unit } from './unit.entity';
import { VocabularyItem } from '../../lessons/entities/vocabulary-item.entity';

@Entity('unit_vocabulary')
export class UnitVocabulary {
  @PrimaryColumn({ name: 'unit_id' })
  unitId: string;

  @PrimaryColumn({ name: 'vocabulary_id' })
  vocabularyId: string;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ name: 'introduction_order', nullable: true })
  introductionOrder: number;

  // Relations
  @ManyToOne(() => Unit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @ManyToOne(() => VocabularyItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabularyItem: VocabularyItem;
}
