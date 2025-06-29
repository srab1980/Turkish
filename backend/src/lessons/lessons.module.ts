import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { Lesson } from './entities/lesson.entity';
import { Exercise } from './entities/exercise.entity';
import { VocabularyItem } from './entities/vocabulary-item.entity';
import { GrammarRule } from './entities/grammar-rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Exercise, VocabularyItem, GrammarRule])],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
