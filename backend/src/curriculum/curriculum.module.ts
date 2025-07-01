import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurriculumController } from './curriculum.controller';
import { CurriculumImportService } from './curriculum-import.service';
import { Course } from '../courses/entities/course.entity';
import { Unit } from '../courses/entities/unit.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Exercise } from '../lessons/entities/exercise.entity';
import { VocabularyItem } from '../lessons/entities/vocabulary-item.entity';
import { GrammarRule } from '../lessons/entities/grammar-rule.entity';

import { VocabularyCategory } from '../lessons/entities/vocabulary-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Unit,
      Lesson,
      Exercise,
      VocabularyItem,
      GrammarRule,

      VocabularyCategory
    ])
  ],
  controllers: [CurriculumController],
  providers: [CurriculumImportService],
  exports: [CurriculumImportService],
})
export class CurriculumModule {}
