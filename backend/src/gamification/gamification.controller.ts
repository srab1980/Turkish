import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../shared/types';

@ApiTags('Gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('achievements')
  @ApiOperation({ summary: 'Get user achievements' })
  @ApiResponse({ status: 200, description: 'User achievements retrieved successfully' })
  async getUserAchievements(@Request() req) {
    return this.gamificationService.getUserAchievements(req.user.id);
  }

  @Get('badges')
  @ApiOperation({ summary: 'Get user badges' })
  @ApiResponse({ status: 200, description: 'User badges retrieved successfully' })
  async getUserBadges(@Request() req) {
    return this.gamificationService.getUserBadges(req.user.id);
  }

  @Get('xp')
  @ApiOperation({ summary: 'Get user total XP' })
  @ApiResponse({ status: 200, description: 'User XP retrieved successfully' })
  async getUserTotalXP(@Request() req) {
    const totalXP = await this.gamificationService.getUserTotalXP(req.user.id);
    return { totalXP };
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of top users to return' })
  async getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.gamificationService.getLeaderboard(limitNum);
  }

  @Post('check-achievements')
  @ApiOperation({ summary: 'Check and award achievements based on user progress' })
  @ApiResponse({ status: 201, description: 'Achievements checked and awarded' })
  async checkAchievements(
    @Request() req,
    @Body() context: {
      lessonsCompleted?: number;
      streakDays?: number;
      totalXP?: number;
      perfectScores?: number;
      studyDays?: number;
    }
  ) {
    const newAchievements = await this.gamificationService.checkAndAwardAchievements(
      req.user.id,
      context
    );
    
    return {
      message: `${newAchievements.length} new achievement(s) unlocked`,
      achievements: newAchievements
    };
  }

  @Post('check-badges')
  @ApiOperation({ summary: 'Check and award badges based on user progress' })
  @ApiResponse({ status: 201, description: 'Badges checked and awarded' })
  async checkBadges(
    @Request() req,
    @Body() context: {
      courseCompleted?: string;
      levelReached?: number;
      specialEvent?: string;
    }
  ) {
    const newBadges = await this.gamificationService.checkAndAwardBadges(
      req.user.id,
      context
    );
    
    return {
      message: `${newBadges.length} new badge(s) earned`,
      badges: newBadges
    };
  }

  // Admin endpoints
  @Post('admin/award-achievement/:userId/:achievementId')
  @ApiOperation({ summary: 'Manually award achievement to user (Admin only)' })
  @ApiResponse({ status: 201, description: 'Achievement awarded successfully' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'achievementId', description: 'Achievement ID' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @UseGuards(RolesGuard)
  async awardAchievement(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('achievementId', ParseUUIDPipe) achievementId: string,
  ) {
    const userAchievement = await this.gamificationService.awardAchievement(userId, achievementId);
    
    if (userAchievement) {
      return {
        message: 'Achievement awarded successfully',
        userAchievement
      };
    } else {
      return {
        message: 'Achievement already exists or could not be awarded'
      };
    }
  }

  @Post('admin/award-badge/:userId/:badgeId')
  @ApiOperation({ summary: 'Manually award badge to user (Admin only)' })
  @ApiResponse({ status: 201, description: 'Badge awarded successfully' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'badgeId', description: 'Badge ID' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @UseGuards(RolesGuard)
  async awardBadge(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('badgeId', ParseUUIDPipe) badgeId: string,
  ) {
    const userBadge = await this.gamificationService.awardBadge(userId, badgeId);
    
    if (userBadge) {
      return {
        message: 'Badge awarded successfully',
        userBadge
      };
    } else {
      return {
        message: 'Badge already exists or could not be awarded'
      };
    }
  }

  @Post('admin/initialize-defaults')
  @ApiOperation({ summary: 'Initialize default achievements and badges (Admin only)' })
  @ApiResponse({ status: 201, description: 'Default achievements and badges initialized' })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async initializeDefaults() {
    await Promise.all([
      this.gamificationService.initializeDefaultAchievements(),
      this.gamificationService.initializeDefaultBadges()
    ]);
    
    return {
      message: 'Default achievements and badges initialized successfully'
    };
  }
}
