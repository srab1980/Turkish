import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProgressDto {
  @ApiProperty()
  @IsString()
  lessonId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercentage?: number;
}

export class UpdateProgressDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercentage?: number;
}

export class CreateExerciseAttemptDto {
  @ApiProperty()
  @IsString()
  exerciseId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  userAnswer?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  feedback?: string;
}

export class ProgressQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class AnalyticsQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  period?: 'day' | 'week' | 'month' | 'year';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  courseId?: string;
}
