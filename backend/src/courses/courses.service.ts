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
      .orderBy('course.order', 'ASC')
      .addOrderBy('units.order', 'ASC');

    if (level) {
      queryBuilder.andWhere('course.level = :level', { level });
    }

    if (isPublished !== undefined) {
      queryBuilder.andWhere('course.isPublished = :isPublished', { isPublished });
    }

    return queryBuilder.getMany();
  }

  async findCourseById(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['units', 'units.lessons', 'units.lessons.exercises'],
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
      order: { order: 'ASC' },
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
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.units', 'units')
      .leftJoinAndSelect('units.lessons', 'lessons')
      .leftJoinAndSelect('lessons.exercises', 'exercises')
      .where('course.id = :courseId', { courseId })
      .getOne();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const totalUnits = course.units?.length || 0;
    const totalLessons = course.units?.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0) || 0;
    const totalExercises = course.units?.reduce((sum, unit) => 
      sum + (unit.lessons?.reduce((lessonSum, lesson) => 
        lessonSum + (lesson.exercises?.length || 0), 0) || 0), 0) || 0;

    return {
      course: {
        id: course.id,
        title: course.title,
        level: course.level,
        estimatedHours: course.estimatedHours,
      },
      stats: {
        totalUnits,
        totalLessons,
        totalExercises,
        isComplete: totalUnits > 0 && totalLessons > 0,
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
      await this.courseRepository.update(id, { order });
    }
  }

  async reorderUnits(unitOrders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of unitOrders) {
      await this.unitRepository.update(id, { order });
    }
  }
}
