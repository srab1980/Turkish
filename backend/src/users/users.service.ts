import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { CEFRLevel } from '../shared/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private preferencesRepository: Repository<UserPreferences>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['preferences'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(userId, updateData);
    return this.findById(userId);
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const preferences = await this.preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences if they don't exist
      const newPreferences = this.preferencesRepository.create({ userId });
      return this.preferencesRepository.save(newPreferences);
    }

    return preferences;
  }

  async updatePreferences(
    userId: string,
    updateData: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    await this.preferencesRepository.update({ userId }, updateData);
    return this.getUserPreferences(userId);
  }

  async getUserStats(userId: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.progress', 'progress', 'progress.is_completed = true')
      .leftJoinAndSelect('user.achievements', 'achievements')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const completedLessons = user.progress?.length || 0;
    const totalTimeSpent = user.progress?.reduce((sum, p) => sum + (p.timeSpent || 0), 0) || 0;
    const achievementsCount = user.achievements?.length || 0;

    return {
      user: {
        id: user.id,
        username: user.username,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
      },
      stats: {
        completedLessons,
        totalTimeSpent,
        achievementsCount,
        averageScore: this.calculateAverageScore(user.progress),
      },
    };
  }

  private calculateAverageScore(progress: any[]): number {
    if (!progress || progress.length === 0) return 0;
    const totalScore = progress.reduce((sum, p) => sum + (p.score || 0), 0);
    return Math.round(totalScore / progress.length);
  }

  async getUserActivity(userId: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.progress', 'progress')
      .leftJoinAndSelect('user.exerciseAttempts', 'attempts')
      .leftJoinAndSelect('user.achievements', 'achievements')
      .where('user.id = :userId', { userId })
      .orderBy('progress.completedAt', 'DESC')
      .addOrderBy('attempts.createdAt', 'DESC')
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const recentProgress = user.progress?.slice(0, 10) || [];
    const recentAttempts = user.exerciseAttempts?.slice(0, 10) || [];
    const recentAchievements = user.achievements?.slice(0, 5) || [];

    return {
      recentProgress,
      recentAttempts,
      recentAchievements,
      totalActiveDays: this.calculateActiveDays(user.progress),
      currentStreak: user.streak,
    };
  }

  async getUserAchievements(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['achievements', 'achievements.achievement'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      achievements: user.achievements || [],
      totalAchievements: user.achievements?.length || 0,
      totalXp: user.xp,
      currentLevel: user.level,
    };
  }

  async updateUserLevel(userId: string, level: string): Promise<User> {
    await this.userRepository.update(userId, { level: level as CEFRLevel });
    return this.findById(userId);
  }

  private calculateActiveDays(progress: any[]): number {
    if (!progress || progress.length === 0) return 0;

    const uniqueDates = new Set(
      progress.map(p => p.completedAt?.toDateString()).filter(Boolean)
    );

    return uniqueDates.size;
  }

  async deactivateAccount(userId: string): Promise<void> {
    await this.userRepository.update(userId, { isActive: false });
  }
}
