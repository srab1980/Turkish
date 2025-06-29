import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationChannel 
} from '../common/entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { EmailService } from './email.service';
import { PushNotificationService } from './push-notification.service';
import { 
  CreateNotificationDto, 
  NotificationQueryDto, 
  BulkNotificationDto,
  NotificationStatsDto 
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
    private pushNotificationService: PushNotificationService,
  ) {}

  // Create notification
  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    
    // Set default values
    if (!notification.scheduledFor) {
      notification.scheduledFor = new Date();
    }
    
    if (!notification.expiresAt && notification.type !== NotificationType.SYSTEM) {
      // Set expiration to 30 days from now for non-system notifications
      notification.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const savedNotification = await this.notificationRepository.save(notification);
    
    // Send immediately if scheduled for now or past
    if (notification.scheduledFor <= new Date()) {
      await this.sendNotification(savedNotification.id);
    }

    return savedNotification;
  }

  // Send notification through appropriate channels
  async sendNotification(notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
      relations: ['user', 'user.preferences'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.isSent) {
      this.logger.warn(`Notification ${notificationId} already sent`);
      return;
    }

    const user = notification.user;
    const preferences = user.preferences;

    try {
      // Send through each specified channel based on user preferences
      for (const channel of notification.channels) {
        switch (channel) {
          case NotificationChannel.EMAIL:
            if (preferences?.emailNotifications && this.shouldSendEmailNotification(notification)) {
              await this.emailService.sendNotificationEmail(user, notification);
            }
            break;
          
          case NotificationChannel.PUSH:
            if (preferences?.pushNotifications && this.shouldSendPushNotification(notification)) {
              await this.pushNotificationService.sendPushNotification(user, notification);
            }
            break;
          
          case NotificationChannel.IN_APP:
            // In-app notifications are always sent (just stored in database)
            break;
        }
      }

      // Mark as sent
      await this.notificationRepository.update(notificationId, {
        isSent: true,
        sentAt: new Date(),
      });

      this.logger.log(`Notification ${notificationId} sent successfully`);
    } catch (error) {
      this.logger.error(`Failed to send notification ${notificationId}:`, error);
      throw error;
    }
  }

  // Get user notifications with pagination
  async getUserNotifications(
    userId: string, 
    query: NotificationQueryDto
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      isRead, 
      priority,
      startDate,
      endDate 
    } = query;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('(notification.expiresAt IS NULL OR notification.expiresAt > :now)', { now: new Date() });

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
    }

    if (priority) {
      queryBuilder.andWhere('notification.priority = :priority', { priority });
    }

    if (startDate) {
      queryBuilder.andWhere('notification.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('notification.createdAt <= :endDate', { endDate });
    }

    const [notifications, total] = await queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Get unread count
    const unreadCount = await this.notificationRepository.count({
      where: { 
        userId, 
        isRead: false,
        expiresAt: MoreThan(new Date())
      }
    });

    return { notifications, total, unreadCount };
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const result = await this.notificationRepository.update(
      { id: notificationId, userId },
      { isRead: true, readAt: new Date() }
    );

    if (result.affected === 0) {
      throw new NotFoundException('Notification not found');
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const result = await this.notificationRepository.delete({ id: notificationId, userId });
    
    if (result.affected === 0) {
      throw new NotFoundException('Notification not found');
    }
  }

  // Create achievement notification
  async createAchievementNotification(userId: string, achievementTitle: string, achievementDescription: string): Promise<void> {
    await this.createNotification({
      userId,
      title: `🏆 Achievement Unlocked: ${achievementTitle}`,
      message: achievementDescription,
      type: NotificationType.ACHIEVEMENT,
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      iconUrl: '/icons/achievement.png',
      metadata: { achievementTitle }
    });
  }

  // Create progress milestone notification
  async createProgressNotification(userId: string, milestone: string, details: string): Promise<void> {
    await this.createNotification({
      userId,
      title: `📈 Progress Milestone: ${milestone}`,
      message: details,
      type: NotificationType.PROGRESS,
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP],
      iconUrl: '/icons/progress.png',
      metadata: { milestone }
    });
  }

  // Create daily reminder notification
  async createDailyReminder(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['preferences']
    });

    if (!user?.preferences?.reminderNotifications) {
      return;
    }

    await this.createNotification({
      userId,
      title: '📚 Time for your Turkish lesson!',
      message: 'Keep your learning streak alive. Complete today\'s lesson now!',
      type: NotificationType.REMINDER,
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      iconUrl: '/icons/reminder.png',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
    });
  }

  // Create streak milestone notification
  async createStreakNotification(userId: string, streakDays: number): Promise<void> {
    await this.createNotification({
      userId,
      title: `🔥 ${streakDays} Day Streak!`,
      message: `Amazing! You've maintained your learning streak for ${streakDays} days. Keep it up!`,
      type: NotificationType.STREAK_MILESTONE,
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
      iconUrl: '/icons/streak.png',
      metadata: { streakDays }
    });
  }

  // Helper methods
  private shouldSendEmailNotification(notification: Notification): boolean {
    // Don't send email for low priority or frequent notifications
    return notification.priority !== NotificationPriority.LOW && 
           ![NotificationType.REMINDER].includes(notification.type);
  }

  private shouldSendPushNotification(notification: Notification): boolean {
    // Send push for most notification types except system messages
    return notification.type !== NotificationType.SYSTEM;
  }

  // Scheduled task to send pending notifications
  @Cron(CronExpression.EVERY_MINUTE)
  async sendScheduledNotifications(): Promise<void> {
    const pendingNotifications = await this.notificationRepository.find({
      where: {
        isSent: false,
        scheduledFor: LessThan(new Date())
      },
      take: 100 // Process in batches
    });

    for (const notification of pendingNotifications) {
      try {
        await this.sendNotification(notification.id);
      } catch (error) {
        this.logger.error(`Failed to send scheduled notification ${notification.id}:`, error);
      }
    }
  }

  // Scheduled task to clean up expired notifications
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredNotifications(): Promise<void> {
    const result = await this.notificationRepository.delete({
      expiresAt: LessThan(new Date())
    });

    this.logger.log(`Cleaned up ${result.affected} expired notifications`);
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<NotificationStatsDto> {
    const [total, unread, byType] = await Promise.all([
      this.notificationRepository.count({ where: { userId } }),
      this.notificationRepository.count({ where: { userId, isRead: false } }),
      this.notificationRepository
        .createQueryBuilder('notification')
        .select('notification.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('notification.userId = :userId', { userId })
        .groupBy('notification.type')
        .getRawMany()
    ]);

    return {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {})
    };
  }
}
