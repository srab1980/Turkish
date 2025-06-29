import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { PushNotificationService } from './push-notification.service';
import { ReminderService } from './reminder.service';
import { Notification } from '../common/entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { UserProgress } from '../progress/entities/user-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, UserProgress]),
    ScheduleModule.forRoot(),
    ConfigModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailService,
    PushNotificationService,
    ReminderService,
  ],
  exports: [
    NotificationsService,
    EmailService,
    PushNotificationService,
    ReminderService,
  ],
})
export class NotificationsModule {}
