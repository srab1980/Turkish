import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { Unit } from './entities/unit.entity';
import { Lesson } from './entities/lesson.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { CEFRLevel } from './enums/cefr-level.enum';
import { CourseStatus } from './enums/course-status.enum';

describe('CoursesService', () => {
  let service: CoursesService;
  let courseRepository: Repository<Course>;
  let unitRepository: Repository<Unit>;
  let lessonRepository: Repository<Lesson>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    role: UserRole.INSTRUCTOR,
    isActive: true,
  } as User;

  const mockCourse = {
    id: '1',
    title: 'Test Course',
    description: 'Test Description',
    level: CEFRLevel.A1,
    status: CourseStatus.PUBLISHED,
    instructor: mockUser,
    instructorId: mockUser.id,
    units: [],
    enrollments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Course;

  const mockCourseRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUnitRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockLessonRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
        {
          provide: getRepositoryToken(Unit),
          useValue: mockUnitRepository,
        },
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockLessonRepository,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    courseRepository = module.get<Repository<Course>>(getRepositoryToken(Course));
    unitRepository = module.get<Repository<Unit>>(getRepositoryToken(Unit));
    lessonRepository = module.get<Repository<Lesson>>(getRepositoryToken(Lesson));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated courses', async () => {
      const courses = [mockCourse];
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([courses, 1]),
      };

      mockCourseRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        search: '',
        level: undefined,
        status: undefined,
      });

      expect(result).toEqual({
        data: courses,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockCourseRepository.createQueryBuilder).toHaveBeenCalledWith('course');
    });

    it('should apply search filter when provided', async () => {
      const courses = [mockCourse];
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([courses, 1]),
      };

      mockCourseRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAll({
        page: 1,
        limit: 10,
        search: 'test',
        level: undefined,
        status: undefined,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(course.title ILIKE :search OR course.description ILIKE :search)',
        { search: '%test%' }
      );
    });
  });

  describe('findOne', () => {
    it('should return course when found', async () => {
      mockCourseRepository.findOne.mockResolvedValue(mockCourse);

      const result = await service.findOne('1');

      expect(result).toEqual(mockCourse);
      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['instructor', 'units', 'units.lessons', 'enrollments'],
      });
    });

    it('should throw NotFoundException when course not found', async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create course successfully', async () => {
      const createCourseDto = {
        title: 'New Course',
        description: 'New Description',
        level: CEFRLevel.A1,
        status: CourseStatus.DRAFT,
      };

      mockCourseRepository.create.mockReturnValue({
        ...createCourseDto,
        instructor: mockUser,
      });
      mockCourseRepository.save.mockResolvedValue(mockCourse);

      const result = await service.create(createCourseDto, mockUser);

      expect(result).toEqual(mockCourse);
      expect(mockCourseRepository.create).toHaveBeenCalledWith({
        ...createCourseDto,
        instructor: mockUser,
      });
      expect(mockCourseRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update course when user is instructor', async () => {
      const updateCourseDto = {
        title: 'Updated Course',
        description: 'Updated Description',
      };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockCourseRepository.save.mockResolvedValue({
        ...mockCourse,
        ...updateCourseDto,
      });

      const result = await service.update('1', updateCourseDto, mockUser);

      expect(result.title).toBe(updateCourseDto.title);
      expect(result.description).toBe(updateCourseDto.description);
      expect(mockCourseRepository.save).toHaveBeenCalled();
    });

    it('should allow admin to update any course', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      const updateCourseDto = {
        title: 'Updated Course',
      };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockCourseRepository.save.mockResolvedValue({
        ...mockCourse,
        ...updateCourseDto,
      });

      const result = await service.update('1', updateCourseDto, adminUser);

      expect(result.title).toBe(updateCourseDto.title);
      expect(mockCourseRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not instructor or admin', async () => {
      const studentUser = { ...mockUser, role: UserRole.STUDENT };
      const updateCourseDto = {
        title: 'Updated Course',
      };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);

      await expect(service.update('1', updateCourseDto, studentUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw NotFoundException when course not found', async () => {
      const updateCourseDto = {
        title: 'Updated Course',
      };

      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateCourseDto, mockUser)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    it('should delete course when user is instructor', async () => {
      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockCourseRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1', mockUser);

      expect(mockCourseRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should allow admin to delete any course', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockCourseRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1', adminUser);

      expect(mockCourseRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw ForbiddenException when user is not instructor or admin', async () => {
      const studentUser = { ...mockUser, role: UserRole.STUDENT };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);

      await expect(service.remove('1', studentUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('enrollUser', () => {
    it('should enroll user in course', async () => {
      const studentUser = { ...mockUser, role: UserRole.STUDENT };
      const courseWithEnrollments = {
        ...mockCourse,
        enrollments: [],
      };

      mockCourseRepository.findOne.mockResolvedValue(courseWithEnrollments);
      mockCourseRepository.save.mockResolvedValue({
        ...courseWithEnrollments,
        enrollments: [{ user: studentUser, enrolledAt: new Date() }],
      });

      const result = await service.enrollUser('1', studentUser);

      expect(result.enrollments).toHaveLength(1);
      expect(result.enrollments[0].user).toEqual(studentUser);
      expect(mockCourseRepository.save).toHaveBeenCalled();
    });

    it('should throw error when user already enrolled', async () => {
      const studentUser = { ...mockUser, role: UserRole.STUDENT };
      const courseWithEnrollments = {
        ...mockCourse,
        enrollments: [{ user: studentUser, enrolledAt: new Date() }],
      };

      mockCourseRepository.findOne.mockResolvedValue(courseWithEnrollments);

      await expect(service.enrollUser('1', studentUser)).rejects.toThrow(
        'User is already enrolled in this course'
      );
    });
  });

  describe('getUserProgress', () => {
    it('should return user progress for course', async () => {
      const studentUser = { ...mockUser, role: UserRole.STUDENT };
      const mockProgress = {
        courseId: '1',
        userId: studentUser.id,
        completedLessons: 5,
        totalLessons: 10,
        progressPercentage: 50,
        lastAccessedAt: new Date(),
      };

      // Mock the progress calculation logic
      jest.spyOn(service, 'getUserProgress').mockResolvedValue(mockProgress);

      const result = await service.getUserProgress('1', studentUser.id);

      expect(result).toEqual(mockProgress);
    });
  });
});
