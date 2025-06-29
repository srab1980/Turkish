import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UserProgress } from './entities/user-progress.entity';
import { ExerciseAttempt } from './entities/exercise-attempt.entity';
import { ReviewItem } from './entities/review-item.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { GamificationService } from '../gamification/gamification.service';
import {
  CreateProgressDto,
  UpdateProgressDto,
  CreateExerciseAttemptDto,
  ProgressQueryDto,
  AnalyticsQueryDto
} from './dto/progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private progressRepository: Repository<UserProgress>,
    @InjectRepository(ExerciseAttempt)
    private attemptRepository: Repository<ExerciseAttempt>,
    @InjectRepository(ReviewItem)
    private reviewRepository: Repository<ReviewItem>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => GamificationService))
    private gamificationService: GamificationService,
  ) {}

  // Progress CRUD operations
  async createOrUpdateProgress(
    userId: string, 
    createProgressDto: CreateProgressDto
  ): Promise<UserProgress> {
    let progress = await this.progressRepository.findOne({
      where: { userId, lessonId: createProgressDto.lessonId },
    });

    if (progress) {
      // Update existing progress
      Object.assign(progress, createProgressDto);
      progress.attemptsCount += 1;
      progress.lastAccessedAt = new Date();
      
      if (createProgressDto.score && createProgressDto.score > progress.bestScore) {
        progress.bestScore = createProgressDto.score;
      }
      
      if (createProgressDto.isCompleted && !progress.isCompleted) {
        progress.completedAt = new Date();
        // Trigger lesson completion notification
        this.triggerLessonCompletionNotification(userId, progress.lessonId);
      }
    } else {
      // Create new progress
      progress = this.progressRepository.create({
        userId,
        ...createProgressDto,
        attemptsCount: 1,
        bestScore: createProgressDto.score || 0,
        lastAccessedAt: new Date(),
        completedAt: createProgressDto.isCompleted ? new Date() : null,
      });

      // Trigger lesson completion notification for new completed lessons
      if (createProgressDto.isCompleted) {
        this.triggerLessonCompletionNotification(userId, createProgressDto.lessonId);
      }
    }

    const savedProgress = await this.progressRepository.save(progress);

    // Check for progress milestones and achievements after saving
    await this.checkProgressMilestones(userId);
    await this.checkAchievements(userId);

    return savedProgress;
  }

  async getUserProgress(userId: string, query: ProgressQueryDto): Promise<UserProgress[]> {
    const queryBuilder = this.progressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.lesson', 'lesson')
      .leftJoinAndSelect('lesson.unit', 'unit')
      .leftJoinAndSelect('unit.course', 'course')
      .where('progress.userId = :userId', { userId });

    if (query.courseId) {
      queryBuilder.andWhere('course.id = :courseId', { courseId: query.courseId });
    }

    if (query.unitId) {
      queryBuilder.andWhere('unit.id = :unitId', { unitId: query.unitId });
    }

    if (query.lessonId) {
      queryBuilder.andWhere('lesson.id = :lessonId', { lessonId: query.lessonId });
    }

    if (query.completed !== undefined) {
      queryBuilder.andWhere('progress.isCompleted = :completed', { completed: query.completed });
    }

    if (query.startDate && query.endDate) {
      queryBuilder.andWhere('progress.updatedAt BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }

    return queryBuilder
      .orderBy('progress.updatedAt', 'DESC')
      .getMany();
  }

  async getProgressById(id: string): Promise<UserProgress> {
    const progress = await this.progressRepository.findOne({
      where: { id },
      relations: ['lesson', 'lesson.unit', 'lesson.unit.course'],
    });

    if (!progress) {
      throw new NotFoundException('Progress not found');
    }

    return progress;
  }

  async updateProgress(id: string, updateProgressDto: UpdateProgressDto): Promise<UserProgress> {
    const progress = await this.getProgressById(id);
    Object.assign(progress, updateProgressDto);
    
    if (updateProgressDto.isCompleted && !progress.isCompleted) {
      progress.completedAt = new Date();
    }
    
    progress.lastAccessedAt = new Date();
    return this.progressRepository.save(progress);
  }

  // Exercise Attempt operations
  async createExerciseAttempt(
    userId: string, 
    createAttemptDto: CreateExerciseAttemptDto
  ): Promise<ExerciseAttempt> {
    const attempt = this.attemptRepository.create({
      userId,
      ...createAttemptDto,
    });

    return this.attemptRepository.save(attempt);
  }

  async getUserAttempts(userId: string, exerciseId?: string): Promise<ExerciseAttempt[]> {
    const queryBuilder = this.attemptRepository
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.exercise', 'exercise')
      .where('attempt.userId = :userId', { userId });

    if (exerciseId) {
      queryBuilder.andWhere('attempt.exerciseId = :exerciseId', { exerciseId });
    }

    return queryBuilder
      .orderBy('attempt.createdAt', 'DESC')
      .getMany();
  }

  // Analytics and Statistics
  async getUserAnalytics(userId: string, query: AnalyticsQueryDto) {
    const { period = 'week', startDate, endDate, courseId } = query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = { updatedAt: Between(new Date(startDate), new Date(endDate)) };
    }

    const progressQuery = this.progressRepository
      .createQueryBuilder('progress')
      .leftJoin('progress.lesson', 'lesson')
      .leftJoin('lesson.unit', 'unit')
      .leftJoin('unit.course', 'course')
      .where('progress.userId = :userId', { userId });

    if (courseId) {
      progressQuery.andWhere('course.id = :courseId', { courseId });
    }

    if (startDate && endDate) {
      progressQuery.andWhere('progress.updatedAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const [totalProgress, completedLessons, totalTimeSpent, averageScore] = await Promise.all([
      progressQuery.getCount(),
      progressQuery.clone().andWhere('progress.isCompleted = true').getCount(),
      progressQuery.clone().select('SUM(progress.timeSpent)', 'total').getRawOne(),
      progressQuery.clone().select('AVG(progress.score)', 'average').getRawOne(),
    ]);

    const completionRate = totalProgress > 0 ? (completedLessons / totalProgress) * 100 : 0;

    return {
      totalLessonsStarted: totalProgress,
      completedLessons,
      completionRate: Math.round(completionRate * 100) / 100,
      totalTimeSpent: parseInt(totalTimeSpent?.total) || 0,
      averageScore: Math.round((parseFloat(averageScore?.average) || 0) * 100) / 100,
    };
  }

  async getCourseProgress(userId: string, courseId: string) {
    const progress = await this.progressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.lesson', 'lesson')
      .leftJoinAndSelect('lesson.unit', 'unit')
      .leftJoinAndSelect('unit.course', 'course')
      .where('progress.userId = :userId', { userId })
      .andWhere('course.id = :courseId', { courseId })
      .getMany();

    const totalLessons = progress.length;
    const completedLessons = progress.filter(p => p.isCompleted).length;
    const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
    const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);

    return {
      courseId,
      totalLessons,
      completedLessons,
      completionPercentage: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
      averageScore: totalLessons > 0 ? totalScore / totalLessons : 0,
      totalTimeSpent,
      progress: progress.map(p => ({
        lessonId: p.lessonId,
        lessonTitle: p.lesson?.title,
        unitTitle: p.lesson?.unit?.title,
        score: p.score,
        isCompleted: p.isCompleted,
        timeSpent: p.timeSpent,
        completedAt: p.completedAt,
      })),
    };
  }

  async getLeaderboard(courseId?: string, limit: number = 10) {
    const queryBuilder = this.progressRepository
      .createQueryBuilder('progress')
      .leftJoin('progress.user', 'user')
      .leftJoin('progress.lesson', 'lesson')
      .leftJoin('lesson.unit', 'unit')
      .leftJoin('unit.course', 'course')
      .select([
        'user.id as userId',
        'user.username as username',
        'user.firstName as firstName',
        'user.lastName as lastName',
        'AVG(progress.score) as averageScore',
        'COUNT(progress.id) as totalLessons',
        'SUM(CASE WHEN progress.isCompleted = true THEN 1 ELSE 0 END) as completedLessons',
      ])
      .where('user.isActive = true')
      .groupBy('user.id, user.username, user.firstName, user.lastName');

    if (courseId) {
      queryBuilder.andWhere('course.id = :courseId', { courseId });
    }

    const results = await queryBuilder
      .orderBy('averageScore', 'DESC')
      .addOrderBy('completedLessons', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((result, index) => ({
      rank: index + 1,
      userId: result.userId,
      username: result.username,
      firstName: result.firstName,
      lastName: result.lastName,
      averageScore: Math.round(parseFloat(result.averageScore || 0) * 100) / 100,
      totalLessons: parseInt(result.totalLessons || 0),
      completedLessons: parseInt(result.completedLessons || 0),
      completionRate: parseInt(result.totalLessons || 0) > 0
        ? Math.round((parseInt(result.completedLessons || 0) / parseInt(result.totalLessons || 0)) * 100)
        : 0,
    }));
  }

  async getProgressSummary(userId: string) {
    const [totalProgress, recentActivity, streakData] = await Promise.all([
      this.getUserAnalytics(userId, {}),
      this.getUserProgress(userId, { startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }),
      this.calculateStreak(userId),
    ]);

    return {
      ...totalProgress,
      recentActivity: recentActivity.length,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
    };
  }

  private async calculateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
    const progress = await this.progressRepository.find({
      where: { userId, isCompleted: true },
      order: { completedAt: 'DESC' },
    });

    if (progress.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = progress[0].completedAt;

    for (let i = 1; i < progress.length; i++) {
      const currentDate = progress[i].completedAt;
      const daysDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }

      lastDate = currentDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak (from today backwards)
    const today = new Date();
    const lastCompletedDate = progress[0].completedAt;
    const daysSinceLastCompletion = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastCompletion <= 1) {
      currentStreak = 1;
      for (let i = 1; i < progress.length; i++) {
        const prevDate = progress[i - 1].completedAt;
        const currentDate = progress[i].completedAt;
        const daysDiff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return { currentStreak, longestStreak };
  }

  // Notification trigger methods
  private async triggerLessonCompletionNotification(userId: string, lessonId: string): Promise<void> {
    try {
      // Get lesson details for notification
      const progress = await this.progressRepository.findOne({
        where: { userId, lessonId },
        relations: ['lesson', 'lesson.unit', 'lesson.unit.course']
      });

      if (progress?.lesson) {
        await this.notificationsService.createNotification({
          userId,
          title: `🎉 Lesson Completed!`,
          message: `Great job! You've completed "${progress.lesson.title}" in ${progress.lesson.unit?.course?.title || 'Turkish Course'}.`,
          type: 'lesson_complete' as any,
          priority: 'medium' as any,
          channels: ['in_app'] as any,
          iconUrl: '/icons/lesson-complete.png',
          metadata: {
            lessonId,
            lessonTitle: progress.lesson.title,
            courseTitle: progress.lesson.unit?.course?.title,
            score: progress.bestScore
          }
        });
      }
    } catch (error) {
      console.error('Failed to trigger lesson completion notification:', error);
    }
  }

  private async checkProgressMilestones(userId: string): Promise<void> {
    try {
      // Check streak milestones
      const streakData = await this.calculateStreak(userId);
      const milestones = [7, 14, 30, 50, 100, 365];

      if (milestones.includes(streakData.currentStreak)) {
        await this.notificationsService.createStreakNotification(userId, streakData.currentStreak);
      }

      // Check completion milestones
      const totalCompleted = await this.progressRepository.count({
        where: { userId, isCompleted: true }
      });

      const completionMilestones = [5, 10, 25, 50, 100, 200];
      if (completionMilestones.includes(totalCompleted)) {
        await this.notificationsService.createProgressNotification(
          userId,
          `${totalCompleted} Lessons Completed`,
          `Amazing progress! You've completed ${totalCompleted} lessons in your Turkish learning journey.`
        );
      }

      // Check weekly goals (if it's Sunday, send weekly summary)
      const today = new Date();
      if (today.getDay() === 0) { // Sunday
        const weekStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
        const weeklyProgress = await this.progressRepository.count({
          where: {
            userId,
            isCompleted: true,
            completedAt: Between(weekStart, today)
          }
        });

        if (weeklyProgress > 0) {
          await this.notificationsService.createNotification({
            userId,
            title: `📊 Weekly Progress Summary`,
            message: `This week you completed ${weeklyProgress} lesson${weeklyProgress > 1 ? 's' : ''}! Keep up the excellent work.`,
            type: 'weekly_goal' as any,
            priority: 'medium' as any,
            channels: ['in_app', 'email'] as any,
            iconUrl: '/icons/weekly-progress.png',
            metadata: {
              weeklyLessons: weeklyProgress,
              weekStart: weekStart.toISOString(),
              weekEnd: today.toISOString()
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to check progress milestones:', error);
    }
  }

  private async checkAchievements(userId: string): Promise<void> {
    try {
      // Get user's progress statistics
      const [totalCompleted, streakData, perfectScores, totalXP] = await Promise.all([
        this.progressRepository.count({
          where: { userId, isCompleted: true }
        }),
        this.calculateStreak(userId),
        this.progressRepository.count({
          where: { userId, bestScore: 100 }
        }),
        this.gamificationService.getUserTotalXP(userId)
      ]);

      // Calculate study days (days with any progress)
      const studyDaysResult = await this.progressRepository
        .createQueryBuilder('progress')
        .select('COUNT(DISTINCT DATE(progress.lastAccessedAt))', 'studyDays')
        .where('progress.userId = :userId', { userId })
        .getRawOne();

      const studyDays = parseInt(studyDaysResult.studyDays) || 0;

      // Check achievements with current context
      await this.gamificationService.checkAndAwardAchievements(userId, {
        lessonsCompleted: totalCompleted,
        streakDays: streakData.currentStreak,
        totalXP,
        perfectScores,
        studyDays
      });
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  }
}
