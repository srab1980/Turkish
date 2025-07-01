import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from './entities/user-progress.entity';
import { VocabularyProgress } from './entities/vocabulary-progress.entity';
import { GrammarProgress } from './entities/grammar-progress.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserProgress)
    private userProgressRepository: Repository<UserProgress>,
    @InjectRepository(VocabularyProgress)
    private vocabularyProgressRepository: Repository<VocabularyProgress>,
    @InjectRepository(GrammarProgress)
    private grammarProgressRepository: Repository<GrammarProgress>
  ) {}

  async getUserOverallProgress(userId: string): Promise<{
    overallCompletion: number;
    coursesStarted: number;
    coursesCompleted: number;
    unitsCompleted: number;
    lessonsCompleted: number;
    totalStudyTime: number;
    averageScore: number;
    streak: number;
    vocabularyMastery: number;
    grammarMastery: number;
    skillBreakdown: {
      reading: number;
      writing: number;
      listening: number;
      speaking: number;
    };
  }> {
    // Get course progress
    const courseProgress = await this.userProgressRepository
      .createQueryBuilder('up')
      .select([
        'COUNT(DISTINCT up.courseId) as coursesStarted',
        'COUNT(DISTINCT CASE WHEN up.status = \'completed\' THEN up.courseId END) as coursesCompleted'
      ])
      .where('up.userId = :userId', { userId })
      .andWhere('up.progressType = :type', { type: 'course' })
      .getRawOne();

    // Get unit and lesson progress
    const unitLessonProgress = await this.userProgressRepository
      .createQueryBuilder('up')
      .select([
        'COUNT(CASE WHEN up.progressType = \'unit\' AND up.status = \'completed\' THEN 1 END) as unitsCompleted',
        'COUNT(CASE WHEN up.progressType = \'lesson\' AND up.status = \'completed\' THEN 1 END) as lessonsCompleted',
        'SUM(up.timeSpent) as totalStudyTime',
        'AVG(up.score) as averageScore'
      ])
      .where('up.userId = :userId', { userId })
      .getRawOne();

    // Get vocabulary mastery
    const vocabStats = await this.vocabularyProgressRepository
      .createQueryBuilder('vp')
      .select('AVG(vp.masteryLevel) as avgMastery')
      .where('vp.userId = :userId', { userId })
      .getRawOne();

    // Get grammar mastery
    const grammarStats = await this.grammarProgressRepository
      .createQueryBuilder('gp')
      .select('AVG(gp.understandingLevel) as avgUnderstanding')
      .where('gp.userId = :userId', { userId })
      .getRawOne();

    // Calculate streak (consecutive days of activity)
    const streak = await this.calculateStudyStreak(userId);

    // Calculate overall completion percentage
    const totalLessons = await this.getTotalAvailableLessons();
    const completedLessons = parseInt(unitLessonProgress.lessonsCompleted) || 0;
    const overallCompletion = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      overallCompletion: Math.round(overallCompletion),
      coursesStarted: parseInt(courseProgress.coursesStarted) || 0,
      coursesCompleted: parseInt(courseProgress.coursesCompleted) || 0,
      unitsCompleted: parseInt(unitLessonProgress.unitsCompleted) || 0,
      lessonsCompleted: completedLessons,
      totalStudyTime: parseInt(unitLessonProgress.totalStudyTime) || 0,
      averageScore: parseFloat(unitLessonProgress.averageScore) || 0,
      streak,
      vocabularyMastery: (parseFloat(vocabStats.avgMastery) || 0) * 20, // Convert to percentage
      grammarMastery: (parseFloat(grammarStats.avgUnderstanding) || 0) * 20, // Convert to percentage
      skillBreakdown: await this.getSkillBreakdown(userId)
    };
  }

  async getProgressTimeline(userId: string, days = 30): Promise<Array<{
    date: string;
    lessonsCompleted: number;
    timeSpent: number;
    score: number;
    vocabularyLearned: number;
  }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get daily progress data
    const dailyProgress = await this.userProgressRepository
      .createQueryBuilder('up')
      .select([
        'DATE(up.completedAt) as date',
        'COUNT(CASE WHEN up.progressType = \'lesson\' AND up.status = \'completed\' THEN 1 END) as lessonsCompleted',
        'SUM(up.timeSpent) as timeSpent',
        'AVG(up.score) as avgScore'
      ])
      .where('up.userId = :userId', { userId })
      .andWhere('up.completedAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('DATE(up.completedAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Get vocabulary progress by day
    const vocabProgress = await this.vocabularyProgressRepository
      .createQueryBuilder('vp')
      .select([
        'DATE(vp.createdAt) as date',
        'COUNT(*) as vocabularyLearned'
      ])
      .where('vp.userId = :userId', { userId })
      .andWhere('vp.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('DATE(vp.createdAt)')
      .getRawMany();

    // Merge the data
    const timeline = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const progressData = dailyProgress.find(p => p.date === dateStr);
      const vocabData = vocabProgress.find(v => v.date === dateStr);

      timeline.push({
        date: dateStr,
        lessonsCompleted: parseInt(progressData?.lessonsCompleted) || 0,
        timeSpent: parseInt(progressData?.timeSpent) || 0,
        score: parseFloat(progressData?.avgScore) || 0,
        vocabularyLearned: parseInt(vocabData?.vocabularyLearned) || 0
      });
    }

    return timeline;
  }

  async getWeakAreas(userId: string): Promise<{
    vocabularyWeaknesses: Array<{
      category: string;
      masteryLevel: number;
      wordsCount: number;
    }>;
    grammarWeaknesses: Array<{
      grammarType: string;
      understandingLevel: number;
      pointsCount: number;
    }>;
    skillWeaknesses: Array<{
      skill: string;
      averageScore: number;
      exerciseCount: number;
    }>;
  }> {
    // Get vocabulary weaknesses by category
    const vocabWeaknesses = await this.vocabularyProgressRepository
      .createQueryBuilder('vp')
      .leftJoin('vp.vocabularyItem', 'vocab')
      .leftJoin('vocab.categories', 'category')
      .select([
        'category.name as category',
        'AVG(vp.masteryLevel) as avgMastery',
        'COUNT(*) as wordsCount'
      ])
      .where('vp.userId = :userId', { userId })
      .andWhere('vp.masteryLevel < 3') // Low mastery
      .groupBy('category.name')
      .orderBy('avgMastery', 'ASC')
      .getRawMany();

    // Get grammar weaknesses by type
    const grammarWeaknesses = await this.grammarProgressRepository
      .createQueryBuilder('gp')
      .leftJoin('gp.grammarRule', 'grammar')
      .select([
        'grammar.grammarType as grammarType',
        'AVG(gp.understandingLevel) as avgUnderstanding',
        'COUNT(*) as pointsCount'
      ])
      .where('gp.userId = :userId', { userId })
      .andWhere('gp.understandingLevel < 3') // Low understanding
      .groupBy('grammar.grammarType')
      .orderBy('avgUnderstanding', 'ASC')
      .getRawMany();

    return {
      vocabularyWeaknesses: vocabWeaknesses.map(v => ({
        category: v.category || 'Uncategorized',
        masteryLevel: parseFloat(v.avgMastery),
        wordsCount: parseInt(v.wordsCount)
      })),
      grammarWeaknesses: grammarWeaknesses.map(g => ({
        grammarType: g.grammarType || 'Unknown',
        understandingLevel: parseFloat(g.avgUnderstanding),
        pointsCount: parseInt(g.pointsCount)
      })),
      skillWeaknesses: [] // Would be implemented based on exercise types
    };
  }

  private async calculateStudyStreak(userId: string): Promise<number> {
    // Calculate consecutive days of study activity
    const recentActivity = await this.userProgressRepository
      .createQueryBuilder('up')
      .select('DISTINCT DATE(up.lastAccessedAt) as date')
      .where('up.userId = :userId', { userId })
      .andWhere('up.lastAccessedAt >= :thirtyDaysAgo', {
        thirtyDaysAgo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      })
      .orderBy('date', 'DESC')
      .getRawMany();

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date();

    for (const activity of recentActivity) {
      const activityDate = activity.date;
      const expectedDate = currentDate.toISOString().split('T')[0];

      if (activityDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private async getTotalAvailableLessons(): Promise<number> {
    // This would count total lessons in the system
    // Placeholder implementation
    return 100;
  }

  private async getSkillBreakdown(userId: string): Promise<{
    reading: number;
    writing: number;
    listening: number;
    speaking: number;
  }> {
    // This would analyze exercise performance by skill type
    // Placeholder implementation
    return {
      reading: 75,
      writing: 65,
      listening: 80,
      speaking: 60
    };
  }
}
