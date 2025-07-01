import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrammarController } from './grammar.controller';
import { GrammarService } from './grammar.service';
import { GrammarRule } from '../lessons/entities/grammar-rule.entity';
import { UnitGrammar } from '../courses/entities/unit-grammar.entity';
import { GrammarProgress } from '../progress/entities/grammar-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GrammarRule,
      UnitGrammar,
      GrammarProgress
    ])
  ],
  controllers: [GrammarController],
  providers: [GrammarService],
  exports: [GrammarService]
})
export class GrammarModule {}
