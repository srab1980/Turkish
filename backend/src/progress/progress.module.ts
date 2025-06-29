import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { UserProgress } from './entities/user-progress.entity';
import { ExerciseAttempt } from './entities/exercise-attempt.entity';
import { ReviewItem } from './entities/review-item.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProgress, ExerciseAttempt, ReviewItem]),
    forwardRef(() => NotificationsModule),
    forwardRef(() => GamificationModule),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
