import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { UserPreferences } from '../users/entities/user-preferences.entity';
import { Course } from '../courses/entities/course.entity';
import { Unit } from '../courses/entities/unit.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { SubLesson } from '../lessons/entities/sub-lesson.entity';
import { Exercise } from '../lessons/entities/exercise.entity';
import { VocabularyItem } from '../lessons/entities/vocabulary-item.entity';
import { GrammarRule } from '../lessons/entities/grammar-rule.entity';
import { UserProgress } from '../progress/entities/user-progress.entity';
import { ExerciseAttempt } from '../progress/entities/exercise-attempt.entity';
import { Achievement } from '../gamification/entities/achievement.entity';
import { UserAchievement } from '../gamification/entities/user-achievement.entity';
import { Badge } from '../gamification/entities/badge.entity';
import { UserBadge } from '../gamification/entities/user-badge.entity';
import { ReviewItem } from '../progress/entities/review-item.entity';
import { FileUpload } from '../common/entities/file-upload.entity';
import { Notification } from '../common/entities/notification.entity';
import { UserSession } from '../auth/entities/user-session.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST', 'localhost'),
        port: configService.get('POSTGRES_PORT', 5432),
        username: configService.get('POSTGRES_USER', 'postgres'),
        password: configService.get('POSTGRES_PASSWORD', 'postgres123'),
        database: configService.get('POSTGRES_DB', 'turkish_learning_app'),
        entities: [
          User,
          UserPreferences,
          Course,
          Unit,
          Lesson,
          SubLesson,
          Exercise,
          VocabularyItem,
          GrammarRule,
          UserProgress,
          ExerciseAttempt,
          Achievement,
          UserAchievement,
          Badge,
          UserBadge,
          ReviewItem,
          FileUpload,
          Notification,
          UserSession,
        ],
        synchronize: false, // Should be false in production; use migrations
        logging: process.env.NODE_ENV === 'development',
        dropSchema: false, // Must be false to preserve data
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
