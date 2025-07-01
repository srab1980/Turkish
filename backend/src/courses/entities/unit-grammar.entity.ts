import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Unit } from './unit.entity';
import { GrammarRule } from '../../lessons/entities/grammar-rule.entity';

@Entity('unit_grammar')
export class UnitGrammar {
  @PrimaryColumn({ name: 'unit_id' })
  unitId: string;

  @PrimaryColumn({ name: 'grammar_point_id' })
  grammarPointId: string;

  @Column({ name: 'introduction_order', nullable: true })
  introductionOrder: number;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  // Relations
  @ManyToOne(() => Unit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @ManyToOne(() => GrammarRule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grammar_point_id' })
  grammarRule: GrammarRule;
}
