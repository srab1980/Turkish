import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ProgressAnalyticsController } from './progress-analytics.controller';
import { AnalyticsService } from './analytics.service';
import { VocabularyProgressService } from './vocabulary-progress.service';
import { GrammarProgressService } from './grammar-progress.service';
import { UserProgress } from './entities/user-progress.entity';
import { ExerciseAttempt } from './entities/exercise-attempt.entity';
import { ReviewItem } from './entities/review-item.entity';
import { VocabularyProgress } from './entities/vocabulary-progress.entity';
import { GrammarProgress } from './entities/grammar-progress.entity';
import { VocabularyItem } from '../lessons/entities/vocabulary-item.entity';
import { GrammarRule } from '../lessons/entities/grammar-rule.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProgress,
      ExerciseAttempt,
      ReviewItem,
      VocabularyProgress,
      GrammarProgress,
      VocabularyItem,
      GrammarRule
    ]),
    forwardRef(() => NotificationsModule),
    forwardRef(() => GamificationModule),
  ],
  controllers: [ProgressController, ProgressAnalyticsController],
  providers: [
    ProgressService,
    AnalyticsService,
    VocabularyProgressService,
    GrammarProgressService
  ],
  exports: [
    ProgressService,
    AnalyticsService,
    VocabularyProgressService,
    GrammarProgressService
  ],
})
export class ProgressModule {}
