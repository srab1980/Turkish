import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { Achievement } from './entities/achievement.entity';
import { Badge } from './entities/badge.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserBadge } from './entities/user-badge.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Achievement, Badge, UserAchievement, UserBadge]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
