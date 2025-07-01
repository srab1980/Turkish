import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyProgress } from './entities/vocabulary-progress.entity';
import { VocabularyItem } from '../lessons/entities/vocabulary-item.entity';

@Injectable()
export class VocabularyProgressService {
  constructor(
    @InjectRepository(VocabularyProgress)
    private vocabularyProgressRepository: Repository<VocabularyProgress>,
    @InjectRepository(VocabularyItem)
    private vocabularyRepository: Repository<VocabularyItem>
  ) {}

  async updateVocabularyProgress(
    userId: string,
    vocabularyId: string,
    isCorrect: boolean
  ): Promise<VocabularyProgress> {
    let progress = await this.vocabularyProgressRepository.findOne({
      where: { userId, vocabularyId }
    });

    if (!progress) {
      progress = this.vocabularyProgressRepository.create({
        userId,
        vocabularyId,
        masteryLevel: 0,
        correctAttempts: 0,
        totalAttempts: 0,
        spacedRepetitionInterval: 1
      });
    }

    // Update attempts
    progress.totalAttempts += 1;
    if (isCorrect) {
      progress.correctAttempts += 1;
    }

    // Update mastery level (0-5 scale)
    const accuracy = progress.correctAttempts / progress.totalAttempts;
    if (accuracy >= 0.9 && progress.totalAttempts >= 5) {
      progress.masteryLevel = Math.min(5, progress.masteryLevel + 1);
    } else if (accuracy < 0.6) {
      progress.masteryLevel = Math.max(0, progress.masteryLevel - 1);
    }

    // Update spaced repetition
    progress.lastReviewedAt = new Date();
    if (isCorrect) {
      // Increase interval for correct answers
      progress.spacedRepetitionInterval = Math.min(
        progress.spacedRepetitionInterval * 2,
        30 // Max 30 days
      );
    } else {
      // Reset interval for incorrect answers
      progress.spacedRepetitionInterval = 1;
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + progress.spacedRepetitionInterval);
    progress.nextReviewAt = nextReview;

    return await this.vocabularyProgressRepository.save(progress);
  }

  async getVocabularyForReview(userId: string, limit = 20): Promise<VocabularyItem[]> {
    const now = new Date();
    
    // Get vocabulary items that need review
    const progressItems = await this.vocabularyProgressRepository
      .createQueryBuilder('vp')
      .leftJoinAndSelect('vp.vocabularyItem', 'vocab')
      .where('vp.userId = :userId', { userId })
      .andWhere('vp.nextReviewAt <= :now', { now })
      .andWhere('vp.masteryLevel < 5') // Not fully mastered
      .orderBy('vp.nextReviewAt', 'ASC')
      .limit(limit)
      .getMany();

    return progressItems.map(p => p.vocabularyItem);
  }

  async getUserVocabularyStats(userId: string): Promise<{
    totalWords: number;
    masteredWords: number;
    reviewingWords: number;
    newWords: number;
    averageMastery: number;
  }> {
    const stats = await this.vocabularyProgressRepository
      .createQueryBuilder('vp')
      .select([
        'COUNT(*) as totalWords',
        'COUNT(CASE WHEN vp.masteryLevel = 5 THEN 1 END) as masteredWords',
        'COUNT(CASE WHEN vp.masteryLevel > 0 AND vp.masteryLevel < 5 THEN 1 END) as reviewingWords',
        'AVG(vp.masteryLevel) as averageMastery'
      ])
      .where('vp.userId = :userId', { userId })
      .getRawOne();

    // Get total vocabulary count to calculate new words
    const totalVocabCount = await this.vocabularyRepository.count();
    const newWords = totalVocabCount - parseInt(stats.totalWords);

    return {
      totalWords: parseInt(stats.totalWords),
      masteredWords: parseInt(stats.masteredWords),
      reviewingWords: parseInt(stats.reviewingWords),
      newWords: Math.max(0, newWords),
      averageMastery: parseFloat(stats.averageMastery) || 0
    };
  }

  async getVocabularyMasteryByUnit(userId: string, unitId: string): Promise<{
    unitId: string;
    totalWords: number;
    masteredWords: number;
    averageMastery: number;
  }> {
    // This would require joining with unit_vocabulary table
    // Placeholder implementation
    return {
      unitId,
      totalWords: 0,
      masteredWords: 0,
      averageMastery: 0
    };
  }

  async resetVocabularyProgress(userId: string, vocabularyId: string): Promise<void> {
    await this.vocabularyProgressRepository.delete({ userId, vocabularyId });
  }

  async bulkUpdateVocabularyProgress(
    userId: string,
    updates: Array<{
      vocabularyId: string;
      isCorrect: boolean;
    }>
  ): Promise<VocabularyProgress[]> {
    const results = [];
    
    for (const update of updates) {
      const progress = await this.updateVocabularyProgress(
        userId,
        update.vocabularyId,
        update.isCorrect
      );
      results.push(progress);
    }
    
    return results;
  }

  async getWeakVocabulary(userId: string, limit = 10): Promise<VocabularyItem[]> {
    // Get vocabulary with low mastery levels that need more practice
    const progressItems = await this.vocabularyProgressRepository
      .createQueryBuilder('vp')
      .leftJoinAndSelect('vp.vocabularyItem', 'vocab')
      .where('vp.userId = :userId', { userId })
      .andWhere('vp.masteryLevel < 3') // Low mastery
      .andWhere('vp.totalAttempts >= 3') // Has been attempted
      .orderBy('vp.masteryLevel', 'ASC')
      .addOrderBy('vp.lastReviewedAt', 'ASC')
      .limit(limit)
      .getMany();

    return progressItems.map(p => p.vocabularyItem);
  }
}
