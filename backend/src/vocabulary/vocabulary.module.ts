import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { VocabularyItem } from '../lessons/entities/vocabulary-item.entity';
import { VocabularyCategory } from '../lessons/entities/vocabulary-category.entity';
import { UnitVocabulary } from '../courses/entities/unit-vocabulary.entity';
import { VocabularyProgress } from '../progress/entities/vocabulary-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VocabularyItem,
      VocabularyCategory,
      UnitVocabulary,
      VocabularyProgress
    ])
  ],
  controllers: [VocabularyController],
  providers: [VocabularyService],
  exports: [VocabularyService]
})
export class VocabularyModule {}
