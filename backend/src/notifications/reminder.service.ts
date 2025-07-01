import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserProgress } from '../progress/entities/user-progress.entity';
import { NotificationsService } from './notifications.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProgress)
    private progressRepository: Repository<UserProgress>,
    private notificationsService: NotificationsService,
  ) {}

  // Send daily reminders at 7 PM
  @Cron('0 19 * * *', {
    name: 'daily-reminders',
    timeZone: 'UTC',
  })
  async sendDailyReminders(): Promise<void> {
    this.logger.log('Starting daily reminder job...');
    
    try {
      // Get users who haven't completed a lesson today and have reminder notifications enabled
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const usersNeedingReminders = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.preferences', 'preferences')
        .leftJoin('user.progress', 'progress', 'progress.completedAt >= :today', { today })
        .where('preferences.reminderNotifications = :enabled', { enabled: true })
        .andWhere('user.isActive = :active', { active: true })
        .andWhere('progress.id IS NULL') // No progress today
        .getMany();

      this.logger.log(`Found ${usersNeedingReminders.length} users needing daily reminders`);

      for (const user of usersNeedingReminders) {
        await this.notificationsService.createDailyReminder(user.id);
      }

      this.logger.log('Daily reminder job completed successfully');
    } catch (error) {
      this.logger.error('Failed to send daily reminders:', error);
    }
  }

  // Send streak recovery reminders for users who missed a day
  @Cron('0 20 * * *', {
    name: 'streak-recovery-reminders',
    timeZone: 'UTC',
  })
  async sendStreakRecoveryReminders(): Promise<void> {
    this.logger.log('Starting streak recovery reminder job...');
    
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find users who had a streak but didn't study yesterday
      const usersWithBrokenStreaks = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.preferences', 'preferences')
        .leftJoin('user.progress', 'yesterdayProgress', 
          'yesterdayProgress.completedAt >= :yesterday AND yesterdayProgress.completedAt < :today',
          { yesterday, today }
        )
        .leftJoin('user.progress', 'recentProgress',
          'recentProgress.completedAt >= :weekAgo AND recentProgress.completedAt < :yesterday',
          { weekAgo: new Date(yesterday.getTime() - 7 * 24 * 60 * 60 * 1000), yesterday }
        )
        .where('preferences.reminderNotifications = :enabled', { enabled: true })
        .andWhere('user.isActive = :active', { active: true })
        .andWhere('yesterdayProgress.id IS NULL') // No progress yesterday
        .andWhere('recentProgress.id IS NOT NULL') // But had recent progress
        .groupBy('user.id')
        .having('COUNT(recentProgress.id) >= :minRecentLessons', { minRecentLessons: 3 })
        .getMany();

      this.logger.log(`Found ${usersWithBrokenStreaks.length} users needing streak recovery reminders`);

      for (const user of usersWithBrokenStreaks) {
        await this.notificationsService.createNotification({
          userId: user.id,
          title: '🔥 Don\'t lose your streak!',
          message: 'You missed yesterday\'s lesson. Get back on track today and keep your Turkish learning momentum going!',
          type: 'reminder' as any,
          priority: 'high' as any,
          channels: ['in_app', 'push'] as any,
          iconUrl: '/icons/streak-recovery.png',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
        });
      }

      this.logger.log('Streak recovery reminder job completed successfully');
    } catch (error) {
      this.logger.error('Failed to send streak recovery reminders:', error);
    }
  }

  // Send weekly goal reminders on Sunday evenings
  @Cron('0 18 * * 0', {
    name: 'weekly-goal-reminders',
    timeZone: 'UTC',
  })
  async sendWeeklyGoalReminders(): Promise<void> {
    this.logger.log('Starting weekly goal reminder job...');
    
    try {
      const today = new Date();
      const weekStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      
      const usersWithWeeklyProgress = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.preferences', 'preferences')
        .leftJoin('user.progress', 'weeklyProgress',
          'weeklyProgress.completedAt >= :weekStart AND weeklyProgress.completedAt <= :today',
          { weekStart, today }
        )
        .where('preferences.reminderNotifications = :enabled', { enabled: true })
        .andWhere('user.isActive = :active', { active: true })
        .groupBy('user.id')
        .addGroupBy('user.firstName')
        .select(['user.id', 'user.firstName'])
        .addSelect('COUNT(weeklyProgress.id)', 'weeklyLessons')
        .getRawMany();

      this.logger.log(`Processing weekly goals for ${usersWithWeeklyProgress.length} users`);

      for (const userData of usersWithWeeklyProgress) {
        const weeklyLessons = parseInt(userData.weeklyLessons) || 0;
        
        if (weeklyLessons === 0) {
          // Encourage users who didn't study this week
          await this.notificationsService.createNotification({
            userId: userData.user_id,
            title: '📚 New week, fresh start!',
            message: 'This week is a new opportunity to advance your Turkish skills. Start with just one lesson today!',
            type: 'reminder' as any,
            priority: 'medium' as any,
            channels: ['in_app', 'push'] as any,
            iconUrl: '/icons/fresh-start.png'
          });
        } else if (weeklyLessons < 3) {
          // Encourage users with low activity
          await this.notificationsService.createNotification({
            userId: userData.user_id,
            title: '💪 You can do more!',
            message: `You completed ${weeklyLessons} lesson${weeklyLessons > 1 ? 's' : ''} this week. Try to aim for at least 3 lessons next week!`,
            type: 'weekly_goal' as any,
            priority: 'medium' as any,
            channels: ['in_app'] as any,
            iconUrl: '/icons/weekly-goal.png',
            metadata: { weeklyLessons }
          });
        } else {
          // Congratulate active users
          await this.notificationsService.createNotification({
            userId: userData.user_id,
            title: '🎉 Great week!',
            message: `Excellent work! You completed ${weeklyLessons} lessons this week. Keep up the fantastic progress!`,
            type: 'weekly_goal' as any,
            priority: 'medium' as any,
            channels: ['in_app', 'email'] as any,
            iconUrl: '/icons/weekly-success.png',
            metadata: { weeklyLessons }
          });
        }
      }

      this.logger.log('Weekly goal reminder job completed successfully');
    } catch (error) {
      this.logger.error('Failed to send weekly goal reminders:', error);
    }
  }

  // Send motivational messages on Monday mornings
  @Cron('0 9 * * 1', {
    name: 'monday-motivation',
    timeZone: 'UTC',
  })
  async sendMondayMotivation(): Promise<void> {
    this.logger.log('Starting Monday motivation job...');
    
    try {
      const activeUsers = await this.userRepository.find({
        where: { isActive: true },
        relations: ['preferences']
      });

      const motivationalMessages = [
        'Start your week strong with Turkish! 💪',
        'Monday motivation: Every expert was once a beginner! 🌟',
        'New week, new Turkish words to discover! 📚',
        'Make this Monday count - practice Turkish today! ⭐',
        'Your Turkish journey continues this Monday! 🚀'
      ];

      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

      for (const user of activeUsers) {
        if (user.preferences?.reminderNotifications) {
          await this.notificationsService.createNotification({
            userId: user.id,
            title: randomMessage,
            message: 'Start your week with a Turkish lesson and set the tone for consistent learning!',
            type: 'reminder' as any,
            priority: 'low' as any,
            channels: ['in_app'] as any,
            iconUrl: '/icons/monday-motivation.png',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
          });
        }
      }

      this.logger.log(`Monday motivation sent to ${activeUsers.length} users`);
    } catch (error) {
      this.logger.error('Failed to send Monday motivation:', error);
    }
  }

  // Manual trigger for testing reminders
  async triggerDailyReminder(userId: string): Promise<void> {
    await this.notificationsService.createDailyReminder(userId);
    this.logger.log(`Manual daily reminder triggered for user ${userId}`);
  }

  async triggerWeeklyGoalReminder(userId: string): Promise<void> {
    const today = new Date();
    const weekStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    
    const weeklyLessons = await this.progressRepository.count({
      where: {
        userId,
        isCompleted: true,
        completedAt: MoreThan(weekStart)
      }
    });

    await this.notificationsService.createNotification({
      userId,
      title: '📊 Weekly Progress Check',
      message: `This week you completed ${weeklyLessons} lesson${weeklyLessons !== 1 ? 's' : ''}. Keep up the great work!`,
      type: 'weekly_goal' as any,
      priority: 'medium' as any,
      channels: ['in_app'] as any,
      iconUrl: '/icons/weekly-progress.png',
      metadata: { weeklyLessons }
    });

    this.logger.log(`Manual weekly goal reminder triggered for user ${userId}`);
  }
}
