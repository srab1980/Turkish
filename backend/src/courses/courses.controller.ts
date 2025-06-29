import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, CEFRLevel } from '../shared/types';
import { CreateCourseDto, UpdateCourseDto, CreateUnitDto, UpdateUnitDto } from './dto/create-course.dto';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  // Course endpoints
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.createCourse(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  @ApiQuery({ name: 'level', enum: CEFRLevel, required: false })
  @ApiQuery({ name: 'published', type: Boolean, required: false })
  async getAllCourses(
    @Query('level') level?: CEFRLevel,
    @Query('published') published?: boolean,
  ) {
    return this.coursesService.findAllCourses(level, published);
  }

  @Get('overview')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Get courses overview with statistics' })
  @ApiResponse({ status: 200, description: 'Courses overview retrieved successfully' })
  async getCoursesOverview() {
    return this.coursesService.getCoursesOverview();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
  async getCourseById(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findCourseById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get course statistics' })
  @ApiResponse({ status: 200, description: 'Course statistics retrieved successfully' })
  async getCourseStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.getCourseStats(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  async updateCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.updateCourse(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  async deleteCourse(@Param('id', ParseUUIDPipe) id: string) {
    await this.coursesService.deleteCourse(id);
    return { message: 'Course deleted successfully' };
  }

  @Put('reorder')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Reorder courses' })
  @ApiResponse({ status: 200, description: 'Courses reordered successfully' })
  async reorderCourses(@Body() courseOrders: { id: string; order: number }[]) {
    await this.coursesService.reorderCourses(courseOrders);
    return { message: 'Courses reordered successfully' };
  }

  // Unit endpoints
  @Post('units')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  async createUnit(@Body() createUnitDto: CreateUnitDto) {
    return this.coursesService.createUnit(createUnitDto);
  }

  @Get(':courseId/units')
  @ApiOperation({ summary: 'Get units by course ID' })
  @ApiResponse({ status: 200, description: 'Units retrieved successfully' })
  async getUnitsByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.coursesService.findUnitsByCourse(courseId);
  }

  @Get('units/:id')
  @ApiOperation({ summary: 'Get unit by ID' })
  @ApiResponse({ status: 200, description: 'Unit retrieved successfully' })
  async getUnitById(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findUnitById(id);
  }

  @Put('units/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update unit' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully' })
  async updateUnit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    return this.coursesService.updateUnit(id, updateUnitDto);
  }

  @Delete('units/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete unit' })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully' })
  async deleteUnit(@Param('id', ParseUUIDPipe) id: string) {
    await this.coursesService.deleteUnit(id);
    return { message: 'Unit deleted successfully' };
  }

  @Put('units/reorder')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Reorder units' })
  @ApiResponse({ status: 200, description: 'Units reordered successfully' })
  async reorderUnits(@Body() unitOrders: { id: string; order: number }[]) {
    await this.coursesService.reorderUnits(unitOrders);
    return { message: 'Units reordered successfully' };
  }
}
