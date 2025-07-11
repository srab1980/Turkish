import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Unit } from './entities/unit.entity';
import { CreateCourseDto, UpdateCourseDto, CreateUnitDto, UpdateUnitDto } from './dto/create-course.dto';
import { CEFRLevel } from '../shared/types';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  // Course CRUD operations
  async createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    return this.courseRepository.save(course);
  }

  async findAllCourses(level?: CEFRLevel, isPublished?: boolean): Promise<Course[]> {
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.units', 'units')
      .orderBy('course.orderIndex', 'ASC')
      .addOrderBy('units.orderIndex', 'ASC');

    if (level) {
      queryBuilder.andWhere('course.level = :level', { level });
    }

    if (isPublished !== undefined) {
      queryBuilder.andWhere('course.isPublished = :isPublished', { isPublished });
    }

    return queryBuilder.getMany();
  }

  async findCourseById(id: string): Promise<Course> {
    // TODO: Consider creating different DTOs for different contexts (e.g., course preview vs course detail)
    // and select relations more granularly based on what's needed to avoid over-fetching.
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['units', 'units.lessons'], // Removed 'units.lessons.exercises' for default load
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findCourseById(id);
    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  async deleteCourse(id: string): Promise<void> {
    const course = await this.findCourseById(id);
    await this.courseRepository.remove(course);
  }

  // Unit CRUD operations
  async createUnit(createUnitDto: CreateUnitDto): Promise<Unit> {
    const course = await this.courseRepository.findOne({
      where: { id: createUnitDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const unit = this.unitRepository.create({
      ...createUnitDto,
      course,
    });

    return this.unitRepository.save(unit);
  }

  async findUnitsByCourse(courseId: string): Promise<Unit[]> {
    return this.unitRepository.find({
      where: { course: { id: courseId } },
      relations: ['lessons'],
      order: { orderIndex: 'ASC' },
    });
  }

  async findUnitById(id: string): Promise<Unit> {
    const unit = await this.unitRepository.findOne({
      where: { id },
      relations: ['course', 'lessons', 'lessons.exercises'],
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }

  async updateUnit(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findUnitById(id);
    Object.assign(unit, updateUnitDto);
    return this.unitRepository.save(unit);
  }

  async deleteUnit(id: string): Promise<void> {
    const unit = await this.findUnitById(id);
    await this.unitRepository.remove(unit);
  }

  // Course statistics and analytics
  async getCourseStats(courseId: string) {
    const courseData = await this.courseRepository
      .createQueryBuilder('course')
      .select([
        'course.id',
        'course.title',
        'course.level',
        'course.estimatedHours',
        'COUNT(DISTINCT units.id) AS "totalUnits"',
        'COUNT(DISTINCT lessons.id) AS "totalLessons"',
        'COUNT(DISTINCT exercises.id) AS "totalExercises"',
      ])
      .leftJoin('course.units', 'units')
      .leftJoin('units.lessons', 'lessons')
      .leftJoin('lessons.exercises', 'exercises')
      .where('course.id = :courseId', { courseId })
      .groupBy('course.id')
      .getRawOne();

    if (!courseData) {
      throw new NotFoundException('Course not found or no data available');
    }

    const totalUnits = parseInt(courseData.totalUnits, 10) || 0;
    const totalLessons = parseInt(courseData.totalLessons, 10) || 0;
    const totalExercises = parseInt(courseData.totalExercises, 10) || 0;

    return {
      course: {
        id: courseData.course_id,
        title: courseData.course_title,
        level: courseData.course_level,
        estimatedHours: courseData.course_estimatedHours,
      },
      stats: {
        totalUnits,
        totalLessons,
        totalExercises,
        isComplete: totalUnits > 0 && totalLessons > 0, // This logic might need refinement based on actual completion criteria
      },
    };
  }

  async getCoursesOverview() {
    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.units', 'units')
      .leftJoin('units.lessons', 'lessons')
      .select([
        'course.id',
        'course.title',
        'course.level',
        'course.isPublished',
        'COUNT(DISTINCT units.id) as unitCount',
        'COUNT(DISTINCT lessons.id) as lessonCount',
      ])
      .groupBy('course.id')
      .getRawAndEntities();

    return courses.entities.map((course, index) => ({
      ...course,
      unitCount: parseInt(courses.raw[index].unitCount) || 0,
      lessonCount: parseInt(courses.raw[index].lessonCount) || 0,
    }));
  }

  async reorderCourses(courseOrders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of courseOrders) {
      await this.courseRepository.update(id, { orderIndex: order });
    }
  }

  async reorderUnits(unitOrders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of unitOrders) {
      await this.unitRepository.update(id, { orderIndex: order });
    }
  }
}
