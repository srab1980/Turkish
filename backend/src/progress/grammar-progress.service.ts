import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrammarProgress } from './entities/grammar-progress.entity';
import { GrammarRule } from '../lessons/entities/grammar-rule.entity';

@Injectable()
export class GrammarProgressService {
  constructor(
    @InjectRepository(GrammarProgress)
    private grammarProgressRepository: Repository<GrammarProgress>,
    @InjectRepository(GrammarRule)
    private grammarRepository: Repository<GrammarRule>
  ) {}

  async updateGrammarProgress(
    userId: string,
    grammarPointId: string,
    isCorrect: boolean,
    type?: string
  ): Promise<GrammarProgress> {
    let progress = await this.grammarProgressRepository.findOne({
      where: { userId, grammarPointId }
    });

    if (!progress) {
      progress = this.grammarProgressRepository.create({
        userId,
        grammarPointId,
        understandingLevel: 0,
        correctAttempts: 0,
        totalAttempts: 0
      });
    }

    // Update attempts
    progress.totalAttempts += 1;
    if (isCorrect) {
      progress.correctAttempts += 1;
    }

    // Update understanding level (0-5 scale)
    const accuracy = progress.correctAttempts / progress.totalAttempts;
    
    if (accuracy >= 0.85 && progress.totalAttempts >= 5) {
      progress.understandingLevel = Math.min(5, progress.understandingLevel + 1);
    } else if (accuracy < 0.5) {
      progress.understandingLevel = Math.max(0, progress.understandingLevel - 1);
    }

    progress.lastPracticedAt = new Date();

    return await this.grammarProgressRepository.save(progress);
  }

  async getGrammarPointsNeedingPractice(userId: string, limit = 10): Promise<GrammarRule[]> {
    // Get grammar points with low understanding levels
    const progressItems = await this.grammarProgressRepository
      .createQueryBuilder('gp')
      .leftJoinAndSelect('gp.grammarRule', 'grammar')
      .where('gp.userId = :userId', { userId })
      .andWhere('gp.understandingLevel < 4') // Not fully understood
      .orderBy('gp.understandingLevel', 'ASC')
      .addOrderBy('gp.lastPracticedAt', 'ASC')
      .limit(limit)
      .getMany();

    return progressItems.map(p => p.grammarRule);
  }

  async getUserGrammarStats(userId: string): Promise<{
    totalGrammarPoints: number;
    masteredGrammarPoints: number;
    practicingGrammarPoints: number;
    averageUnderstanding: number;
    weakAreas: string[];
  }> {
    const stats = await this.grammarProgressRepository
      .createQueryBuilder('gp')
      .leftJoin('gp.grammarRule', 'grammar')
      .select([
        'COUNT(*) as totalGrammarPoints',
        'COUNT(CASE WHEN gp.understandingLevel = 5 THEN 1 END) as masteredGrammarPoints',
        'COUNT(CASE WHEN gp.understandingLevel > 0 AND gp.understandingLevel < 5 THEN 1 END) as practicingGrammarPoints',
        'AVG(gp.understandingLevel) as averageUnderstanding'
      ])
      .where('gp.userId = :userId', { userId })
      .getRawOne();

    // Get weak areas (grammar types with low understanding)
    const weakAreas = await this.grammarProgressRepository
      .createQueryBuilder('gp')
      .leftJoin('gp.grammarRule', 'grammar')
      .select('grammar.grammarType')
      .addSelect('AVG(gp.understandingLevel)', 'avgLevel')
      .where('gp.userId = :userId', { userId })
      .groupBy('grammar.grammarType')
      .having('AVG(gp.understandingLevel) < 3')
      .orderBy('avgLevel', 'ASC')
      .getRawMany();

    return {
      totalGrammarPoints: parseInt(stats.totalGrammarPoints),
      masteredGrammarPoints: parseInt(stats.masteredGrammarPoints),
      practicingGrammarPoints: parseInt(stats.practicingGrammarPoints),
      averageUnderstanding: parseFloat(stats.averageUnderstanding) || 0,
      weakAreas: weakAreas.map(w => w.grammar_grammarType).filter(Boolean)
    };
  }

  async getGrammarMasteryByType(userId: string): Promise<Array<{
    grammarType: string;
    totalPoints: number;
    masteredPoints: number;
    averageUnderstanding: number;
  }>> {
    const results = await this.grammarProgressRepository
      .createQueryBuilder('gp')
      .leftJoin('gp.grammarRule', 'grammar')
      .select([
        'grammar.grammarType as grammarType',
        'COUNT(*) as totalPoints',
        'COUNT(CASE WHEN gp.understandingLevel = 5 THEN 1 END) as masteredPoints',
        'AVG(gp.understandingLevel) as averageUnderstanding'
      ])
      .where('gp.userId = :userId', { userId })
      .groupBy('grammar.grammarType')
      .orderBy('averageUnderstanding', 'DESC')
      .getRawMany();

    return results.map(r => ({
      grammarType: r.grammarType,
      totalPoints: parseInt(r.totalPoints),
      masteredPoints: parseInt(r.masteredPoints),
      averageUnderstanding: parseFloat(r.averageUnderstanding)
    }));
  }

  async getRecommendedGrammarExercises(userId: string): Promise<Array<{
    grammarPointId: string;
    grammarType: string;
    difficultyLevel: number;
    priority: number;
  }>> {
    // Get grammar points that need practice with priority scoring
    const progressItems = await this.grammarProgressRepository
      .createQueryBuilder('gp')
      .leftJoin('gp.grammarRule', 'grammar')
      .select([
        'gp.grammarPointId',
        'grammar.grammarType',
        'grammar.difficultyLevel',
        'gp.understandingLevel',
        'gp.totalAttempts',
        'gp.lastPracticedAt'
      ])
      .where('gp.userId = :userId', { userId })
      .andWhere('gp.understandingLevel < 5')
      .getMany();

    // Calculate priority scores
    const recommendations = progressItems.map(item => {
      let priority = 0;
      
      // Lower understanding = higher priority
      priority += (5 - item.understandingLevel) * 20;
      
      // More attempts without mastery = higher priority
      if (item.totalAttempts > 5 && item.understandingLevel < 3) {
        priority += 15;
      }
      
      // Time since last practice
      if (item.lastPracticedAt) {
        const daysSinceLastPractice = Math.floor(
          (Date.now() - item.lastPracticedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        priority += Math.min(daysSinceLastPractice * 2, 20);
      }

      return {
        grammarPointId: item.grammarPointId,
        grammarType: item.grammarRule?.grammarType || 'unknown',
        difficultyLevel: item.grammarRule?.difficultyLevel || 1,
        priority
      };
    });

    // Sort by priority and return top recommendations
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);
  }

  async resetGrammarProgress(userId: string, grammarPointId: string): Promise<void> {
    await this.grammarProgressRepository.delete({ userId, grammarPointId });
  }

  async getGrammarProgressByUnit(userId: string, unitId: string): Promise<{
    unitId: string;
    totalGrammarPoints: number;
    masteredGrammarPoints: number;
    averageUnderstanding: number;
  }> {
    // This would require joining with unit_grammar table
    // Placeholder implementation
    return {
      unitId,
      totalGrammarPoints: 0,
      masteredGrammarPoints: 0,
      averageUnderstanding: 0
    };
  }
}
