import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { VocabularyProgressService } from './vocabulary-progress.service';
import { GrammarProgressService } from './grammar-progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressAnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly vocabularyProgressService: VocabularyProgressService,
    private readonly grammarProgressService: GrammarProgressService
  ) {}

  @Get('user/:userId/overview')
  async getUserOverallProgress(@Param('userId') userId: string) {
    return await this.analyticsService.getUserOverallProgress(userId);
  }

  @Get('user/:userId/timeline')
  async getProgressTimeline(
    @Param('userId') userId: string,
    @Query('days') days?: number
  ) {
    return await this.analyticsService.getProgressTimeline(userId, days);
  }

  @Get('user/:userId/weak-areas')
  async getWeakAreas(@Param('userId') userId: string) {
    return await this.analyticsService.getWeakAreas(userId);
  }

  @Get('user/:userId/vocabulary/stats')
  async getVocabularyStats(@Param('userId') userId: string) {
    return await this.vocabularyProgressService.getUserVocabularyStats(userId);
  }

  @Get('user/:userId/vocabulary/review')
  async getVocabularyForReview(
    @Param('userId') userId: string,
    @Query('limit') limit?: number
  ) {
    return await this.vocabularyProgressService.getVocabularyForReview(userId, limit);
  }

  @Get('user/:userId/vocabulary/weak')
  async getWeakVocabulary(
    @Param('userId') userId: string,
    @Query('limit') limit?: number
  ) {
    return await this.vocabularyProgressService.getWeakVocabulary(userId, limit);
  }

  @Post('user/:userId/vocabulary/:vocabularyId')
  async updateVocabularyProgress(
    @Param('userId') userId: string,
    @Param('vocabularyId') vocabularyId: string,
    @Body() updateData: { isCorrect: boolean }
  ) {
    return await this.vocabularyProgressService.updateVocabularyProgress(
      userId,
      vocabularyId,
      updateData.isCorrect
    );
  }

  @Get('user/:userId/grammar/stats')
  async getGrammarStats(@Param('userId') userId: string) {
    return await this.grammarProgressService.getUserGrammarStats(userId);
  }

  @Get('user/:userId/grammar/practice-needed')
  async getGrammarPointsNeedingPractice(
    @Param('userId') userId: string,
    @Query('limit') limit?: number
  ) {
    return await this.grammarProgressService.getGrammarPointsNeedingPractice(userId, limit);
  }

  @Get('user/:userId/grammar/recommendations')
  async getRecommendedGrammarExercises(@Param('userId') userId: string) {
    return await this.grammarProgressService.getRecommendedGrammarExercises(userId);
  }

  @Post('user/:userId/grammar/:grammarPointId')
  async updateGrammarProgress(
    @Param('userId') userId: string,
    @Param('grammarPointId') grammarPointId: string,
    @Body() updateData: { isCorrect: boolean; type?: string }
  ) {
    return await this.grammarProgressService.updateGrammarProgress(
      userId,
      grammarPointId,
      updateData.isCorrect,
      updateData.type
    );
  }

  @Get('user/:userId/grammar/mastery-by-type')
  async getGrammarMasteryByType(@Param('userId') userId: string) {
    return await this.grammarProgressService.getGrammarMasteryByType(userId);
  }

  @Post('user/:userId/vocabulary/bulk-update')
  async bulkUpdateVocabularyProgress(
    @Param('userId') userId: string,
    @Body() updates: Array<{ vocabularyId: string; isCorrect: boolean }>
  ) {
    return await this.vocabularyProgressService.bulkUpdateVocabularyProgress(userId, updates);
  }

  @Get('user/:userId/unit/:unitId/vocabulary-mastery')
  async getVocabularyMasteryByUnit(
    @Param('userId') userId: string,
    @Param('unitId') unitId: string
  ) {
    return await this.vocabularyProgressService.getVocabularyMasteryByUnit(userId, unitId);
  }

  @Get('user/:userId/unit/:unitId/grammar-progress')
  async getGrammarProgressByUnit(
    @Param('userId') userId: string,
    @Param('unitId') unitId: string
  ) {
    return await this.grammarProgressService.getGrammarProgressByUnit(userId, unitId);
  }
}
