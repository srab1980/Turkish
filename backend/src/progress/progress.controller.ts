import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../shared/types';
import { 
  CreateProgressDto, 
  UpdateProgressDto, 
  CreateExerciseAttemptDto,
  ProgressQueryDto,
  AnalyticsQueryDto 
} from './dto/progress.dto';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  // Progress endpoints
  @Post()
  @ApiOperation({ summary: 'Create or update lesson progress' })
  @ApiResponse({ status: 201, description: 'Progress created/updated successfully' })
  async createOrUpdateProgress(
    @Request() req,
    @Body() createProgressDto: CreateProgressDto,
  ) {
    return this.progressService.createOrUpdateProgress(req.user.id, createProgressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user progress' })
  @ApiResponse({ status: 200, description: 'Progress retrieved successfully' })
  async getUserProgress(
    @Request() req,
    @Query() query: ProgressQueryDto,
  ) {
    return this.progressService.getUserProgress(req.user.id, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get progress summary' })
  @ApiResponse({ status: 200, description: 'Progress summary retrieved successfully' })
  async getProgressSummary(@Request() req) {
    return this.progressService.getProgressSummary(req.user.id);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getUserAnalytics(
    @Request() req,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.progressService.getUserAnalytics(req.user.id, query);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get course progress' })
  @ApiResponse({ status: 200, description: 'Course progress retrieved successfully' })
  async getCourseProgress(
    @Request() req,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.progressService.getCourseProgress(req.user.id, courseId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getLeaderboard(
    @Query('courseId') courseId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.progressService.getLeaderboard(courseId, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get progress by ID' })
  @ApiResponse({ status: 200, description: 'Progress retrieved successfully' })
  async getProgressById(@Param('id', ParseUUIDPipe) id: string) {
    return this.progressService.getProgressById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update progress' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  async updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.progressService.updateProgress(id, updateProgressDto);
  }

  // Exercise Attempt endpoints
  @Post('attempts')
  @ApiOperation({ summary: 'Create exercise attempt' })
  @ApiResponse({ status: 201, description: 'Exercise attempt created successfully' })
  async createExerciseAttempt(
    @Request() req,
    @Body() createAttemptDto: CreateExerciseAttemptDto,
  ) {
    return this.progressService.createExerciseAttempt(req.user.id, createAttemptDto);
  }

  @Get('attempts')
  @ApiOperation({ summary: 'Get user exercise attempts' })
  @ApiResponse({ status: 200, description: 'Exercise attempts retrieved successfully' })
  @ApiQuery({ name: 'exerciseId', required: false })
  async getUserAttempts(
    @Request() req,
    @Query('exerciseId') exerciseId?: string,
  ) {
    return this.progressService.getUserAttempts(req.user.id, exerciseId);
  }

  // Admin endpoints
  @Get('admin/analytics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Get admin analytics' })
  @ApiResponse({ status: 200, description: 'Admin analytics retrieved successfully' })
  async getAdminAnalytics(@Query() query: AnalyticsQueryDto) {
    // This would be implemented for admin-level analytics across all users
    return { message: 'Admin analytics endpoint - to be implemented' };
  }

  @Get('admin/leaderboard/:courseId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Get course leaderboard for admins' })
  @ApiResponse({ status: 200, description: 'Course leaderboard retrieved successfully' })
  async getCourseLeaderboard(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query('limit') limit?: number,
  ) {
    return this.progressService.getLeaderboard(courseId, limit);
  }
}
