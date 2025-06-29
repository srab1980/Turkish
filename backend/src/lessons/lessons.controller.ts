import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../shared/types';
import { 
  CreateLessonDto, 
  UpdateLessonDto, 
  CreateExerciseDto, 
  UpdateExerciseDto,
  CreateVocabularyDto,
  CreateGrammarRuleDto 
} from './dto/create-lesson.dto';

@ApiTags('Lessons')
@Controller('lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  // Lesson endpoints
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  async createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.createLesson(createLessonDto);
  }

  @Get('unit/:unitId')
  @ApiOperation({ summary: 'Get lessons by unit ID' })
  @ApiResponse({ status: 200, description: 'Lessons retrieved successfully' })
  async getLessonsByUnit(@Param('unitId', ParseUUIDPipe) unitId: string) {
    return this.lessonsService.findLessonsByUnit(unitId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID' })
  @ApiResponse({ status: 200, description: 'Lesson retrieved successfully' })
  async getLessonById(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonsService.findLessonById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get lesson statistics' })
  @ApiResponse({ status: 200, description: 'Lesson statistics retrieved successfully' })
  async getLessonStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonsService.getLessonStats(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update lesson' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  async updateLesson(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.updateLesson(id, updateLessonDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete lesson' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  async deleteLesson(@Param('id', ParseUUIDPipe) id: string) {
    await this.lessonsService.deleteLesson(id);
    return { message: 'Lesson deleted successfully' };
  }

  @Put('reorder')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Reorder lessons' })
  @ApiResponse({ status: 200, description: 'Lessons reordered successfully' })
  async reorderLessons(@Body() lessonOrders: { id: string; order: number }[]) {
    await this.lessonsService.reorderLessons(lessonOrders);
    return { message: 'Lessons reordered successfully' };
  }

  // Exercise endpoints
  @Post('exercises')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a new exercise' })
  @ApiResponse({ status: 201, description: 'Exercise created successfully' })
  async createExercise(@Body() createExerciseDto: CreateExerciseDto) {
    return this.lessonsService.createExercise(createExerciseDto);
  }

  @Get(':lessonId/exercises')
  @ApiOperation({ summary: 'Get exercises by lesson ID' })
  @ApiResponse({ status: 200, description: 'Exercises retrieved successfully' })
  async getExercisesByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.lessonsService.findExercisesByLesson(lessonId);
  }

  @Get('exercises/:id')
  @ApiOperation({ summary: 'Get exercise by ID' })
  @ApiResponse({ status: 200, description: 'Exercise retrieved successfully' })
  async getExerciseById(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonsService.findExerciseById(id);
  }

  @Put('exercises/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update exercise' })
  @ApiResponse({ status: 200, description: 'Exercise updated successfully' })
  async updateExercise(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.lessonsService.updateExercise(id, updateExerciseDto);
  }

  @Delete('exercises/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete exercise' })
  @ApiResponse({ status: 200, description: 'Exercise deleted successfully' })
  async deleteExercise(@Param('id', ParseUUIDPipe) id: string) {
    await this.lessonsService.deleteExercise(id);
    return { message: 'Exercise deleted successfully' };
  }

  @Put('exercises/reorder')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Reorder exercises' })
  @ApiResponse({ status: 200, description: 'Exercises reordered successfully' })
  async reorderExercises(@Body() exerciseOrders: { id: string; order: number }[]) {
    await this.lessonsService.reorderExercises(exerciseOrders);
    return { message: 'Exercises reordered successfully' };
  }

  // Vocabulary endpoints
  @Post('vocabulary')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create vocabulary item' })
  @ApiResponse({ status: 201, description: 'Vocabulary item created successfully' })
  async createVocabulary(@Body() createVocabularyDto: CreateVocabularyDto) {
    return this.lessonsService.createVocabulary(createVocabularyDto);
  }

  @Get(':lessonId/vocabulary')
  @ApiOperation({ summary: 'Get vocabulary by lesson ID' })
  @ApiResponse({ status: 200, description: 'Vocabulary retrieved successfully' })
  async getVocabularyByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.lessonsService.findVocabularyByLesson(lessonId);
  }

  @Put('vocabulary/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update vocabulary item' })
  @ApiResponse({ status: 200, description: 'Vocabulary item updated successfully' })
  async updateVocabulary(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: any,
  ) {
    return this.lessonsService.updateVocabulary(id, updateData);
  }

  @Delete('vocabulary/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete vocabulary item' })
  @ApiResponse({ status: 200, description: 'Vocabulary item deleted successfully' })
  async deleteVocabulary(@Param('id', ParseUUIDPipe) id: string) {
    await this.lessonsService.deleteVocabulary(id);
    return { message: 'Vocabulary item deleted successfully' };
  }

  // Grammar Rule endpoints
  @Post('grammar')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create grammar rule' })
  @ApiResponse({ status: 201, description: 'Grammar rule created successfully' })
  async createGrammarRule(@Body() createGrammarRuleDto: CreateGrammarRuleDto) {
    return this.lessonsService.createGrammarRule(createGrammarRuleDto);
  }

  @Get(':lessonId/grammar')
  @ApiOperation({ summary: 'Get grammar rules by lesson ID' })
  @ApiResponse({ status: 200, description: 'Grammar rules retrieved successfully' })
  async getGrammarRulesByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.lessonsService.findGrammarRulesByLesson(lessonId);
  }

  @Put('grammar/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update grammar rule' })
  @ApiResponse({ status: 200, description: 'Grammar rule updated successfully' })
  async updateGrammarRule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: any,
  ) {
    return this.lessonsService.updateGrammarRule(id, updateData);
  }

  @Delete('grammar/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete grammar rule' })
  @ApiResponse({ status: 200, description: 'Grammar rule deleted successfully' })
  async deleteGrammarRule(@Param('id', ParseUUIDPipe) id: string) {
    await this.lessonsService.deleteGrammarRule(id);
    return { message: 'Grammar rule deleted successfully' };
  }
}
