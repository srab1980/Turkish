import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement, AchievementType } from './entities/achievement.entity';
import { Badge, BadgeType } from './entities/badge.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserBadge } from './entities/user-badge.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(UserBadge)
    private userBadgeRepository: Repository<UserBadge>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  // Achievement management
  async checkAndAwardAchievements(userId: string, context: {
    lessonsCompleted?: number;
    streakDays?: number;
    totalXP?: number;
    perfectScores?: number;
    studyDays?: number;
  }): Promise<UserAchievement[]> {
    const newAchievements: UserAchievement[] = [];
    
    // Get all available achievements
    const achievements = await this.achievementRepository.find({
      where: { isActive: true }
    });

    // Get user's existing achievements
    const existingAchievements = await this.userAchievementRepository.find({
      where: { userId },
      relations: ['achievement']
    });
    
    const existingAchievementIds = existingAchievements.map(ua => ua.achievementId);

    for (const achievement of achievements) {
      // Skip if user already has this achievement
      if (existingAchievementIds.includes(achievement.id)) {
        continue;
      }

      // Check if user meets the criteria for this achievement
      if (this.meetsAchievementCriteria(achievement, context)) {
        const userAchievement = await this.awardAchievement(userId, achievement.id);
        if (userAchievement) {
          newAchievements.push(userAchievement);
          
          // Trigger achievement notification
          await this.notificationsService.createAchievementNotification(
            userId,
            achievement.title,
            achievement.description
          );
        }
      }
    }

    return newAchievements;
  }

  private meetsAchievementCriteria(achievement: Achievement, context: any): boolean {
    const criteria = achievement.criteria as any;
    
    switch (achievement.type) {
      case AchievementType.LESSON_COMPLETION:
        return context.lessonsCompleted >= criteria.count;

      case AchievementType.STREAK:
        return context.streakDays >= criteria.days;

      case AchievementType.SCORE:
        return context.totalXP >= criteria.xp;

      case AchievementType.EXERCISE_COUNT:
        return context.perfectScores >= criteria.count;

      case AchievementType.TIME_SPENT:
        return context.studyDays >= criteria.days;

      default:
        return false;
    }
  }

  async awardAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
    try {
      // Check if user already has this achievement
      const existing = await this.userAchievementRepository.findOne({
        where: { userId, achievementId }
      });

      if (existing) {
        return null;
      }

      // Get achievement details
      const achievement = await this.achievementRepository.findOne({
        where: { id: achievementId }
      });

      if (!achievement) {
        return null;
      }

      // Create user achievement
      const userAchievement = this.userAchievementRepository.create({
        userId,
        achievementId,
        unlockedAt: new Date(),
        metadata: { xpAwarded: achievement.xpReward }
      });

      return await this.userAchievementRepository.save(userAchievement);
    } catch (error) {
      console.error('Failed to award achievement:', error);
      return null;
    }
  }

  // Badge management
  async checkAndAwardBadges(userId: string, context: {
    courseCompleted?: string;
    levelReached?: number;
    specialEvent?: string;
  }): Promise<UserBadge[]> {
    const newBadges: UserBadge[] = [];
    
    // Get all available badges
    const badges = await this.badgeRepository.find({
      where: { isActive: true }
    });

    // Get user's existing badges
    const existingBadges = await this.userBadgeRepository.find({
      where: { userId },
      relations: ['badge']
    });
    
    const existingBadgeIds = existingBadges.map(ub => ub.badgeId);

    for (const badge of badges) {
      // Skip if user already has this badge
      if (existingBadgeIds.includes(badge.id)) {
        continue;
      }

      // Check if user meets the criteria for this badge
      if (this.meetsBadgeCriteria(badge, context)) {
        const userBadge = await this.awardBadge(userId, badge.id);
        if (userBadge) {
          newBadges.push(userBadge);
          
          // Trigger badge notification
          await this.notificationsService.createAchievementNotification(
            userId,
            `Badge Earned: ${badge.name}`,
            badge.description
          );
        }
      }
    }

    return newBadges;
  }

  private meetsBadgeCriteria(badge: Badge, context: any): boolean {
    const criteria = badge.requirements as any;
    
    switch (badge.type) {
      case BadgeType.COMPLETION:
        return context.courseCompleted === criteria.courseId;

      case BadgeType.MILESTONE:
        return context.levelReached >= criteria.level;

      case BadgeType.SPECIAL_EVENT:
        return context.specialEvent === criteria.event;

      default:
        return false;
    }
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge | null> {
    try {
      // Check if user already has this badge
      const existing = await this.userBadgeRepository.findOne({
        where: { userId, badgeId }
      });

      if (existing) {
        return null;
      }

      // Create user badge
      const userBadge = this.userBadgeRepository.create({
        userId,
        badgeId,
        earnedAt: new Date()
      });

      return await this.userBadgeRepository.save(userBadge);
    } catch (error) {
      console.error('Failed to award badge:', error);
      return null;
    }
  }

  // Get user's achievements and badges
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.userAchievementRepository.find({
      where: { userId },
      relations: ['achievement'],
      order: { unlockedAt: 'DESC' }
    });
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return this.userBadgeRepository.find({
      where: { userId },
      relations: ['badge'],
      order: { earnedAt: 'DESC' }
    });
  }

  // Calculate total XP from achievements
  async getUserTotalXP(userId: string): Promise<number> {
    const result = await this.userAchievementRepository
      .createQueryBuilder('userAchievement')
      .select('SUM(userAchievement.xpAwarded)', 'totalXP')
      .where('userAchievement.userId = :userId', { userId })
      .getRawOne();

    return parseInt(result.totalXP) || 0;
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    return this.userAchievementRepository
      .createQueryBuilder('userAchievement')
      .select('userAchievement.userId', 'userId')
      .addSelect('SUM(userAchievement.xpAwarded)', 'totalXP')
      .addSelect('COUNT(userAchievement.id)', 'achievementCount')
      .leftJoin('userAchievement.user', 'user')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .groupBy('userAchievement.userId')
      .addGroupBy('user.firstName')
      .addGroupBy('user.lastName')
      .orderBy('totalXP', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  // Initialize default achievements and badges
  async initializeDefaultAchievements(): Promise<void> {
    const defaultAchievements = [
      {
        title: 'First Steps',
        description: 'Complete your first lesson',
        type: AchievementType.LESSON_COMPLETION,
        criteria: { count: 1 },
        xpReward: 50,
        iconUrl: '/icons/achievements/first-steps.png'
      },
      {
        title: 'Getting Started',
        description: 'Complete 5 lessons',
        type: AchievementType.LESSON_COMPLETION,
        criteria: { count: 5 },
        xpReward: 100,
        iconUrl: '/icons/achievements/getting-started.png'
      },
      {
        title: 'Dedicated Learner',
        description: 'Complete 25 lessons',
        type: AchievementType.LESSON_COMPLETION,
        criteria: { count: 25 },
        xpReward: 250,
        iconUrl: '/icons/achievements/dedicated-learner.png'
      },
      {
        title: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        type: AchievementType.STREAK,
        criteria: { days: 7 },
        xpReward: 200,
        iconUrl: '/icons/achievements/week-warrior.png'
      },
      {
        title: 'Month Master',
        description: 'Maintain a 30-day learning streak',
        type: AchievementType.STREAK,
        criteria: { days: 30 },
        xpReward: 500,
        iconUrl: '/icons/achievements/month-master.png'
      },
      {
        title: 'Perfectionist',
        description: 'Score 100% on 10 lessons',
        type: AchievementType.SCORE,
        criteria: { count: 10 },
        xpReward: 300,
        iconUrl: '/icons/achievements/perfectionist.png'
      }
    ];

    for (const achievementData of defaultAchievements) {
      const existing = await this.achievementRepository.findOne({
        where: { title: achievementData.title }
      });

      if (!existing) {
        const achievement = this.achievementRepository.create(achievementData);
        await this.achievementRepository.save(achievement);
      }
    }
  }

  async initializeDefaultBadges(): Promise<void> {
    const defaultBadges = [
      {
        name: 'Turkish Beginner',
        description: 'Complete the Beginner Turkish course',
        type: BadgeType.COMPLETION,
        requirements: { courseId: 'beginner-turkish' },
        iconUrl: '/icons/badges/turkish-beginner.png'
      },
      {
        name: 'Grammar Expert',
        description: 'Complete the Turkish Grammar course',
        type: BadgeType.COMPLETION,
        requirements: { courseId: 'turkish-grammar' },
        iconUrl: '/icons/badges/grammar-expert.png'
      },
      {
        name: 'Level 10 Scholar',
        description: 'Reach level 10',
        type: BadgeType.MILESTONE,
        requirements: { level: 10 },
        iconUrl: '/icons/badges/level-10.png'
      }
    ];

    for (const badgeData of defaultBadges) {
      const existing = await this.badgeRepository.findOne({
        where: { name: badgeData.name }
      });

      if (!existing) {
        const badge = this.badgeRepository.create(badgeData);
        await this.badgeRepository.save(badge);
      }
    }
  }
}
