import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsBoolean, IsObject, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LessonType, CEFRLevel } from '../../shared/types';

export class CreateLessonDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty()
  @IsString()
  unitId: string;

  @ApiProperty({ enum: LessonType })
  @IsEnum(LessonType)
  type: LessonType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  audioUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  videoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  estimatedMinutes?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateLessonDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: LessonType, required: false })
  @IsOptional()
  @IsEnum(LessonType)
  type?: LessonType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  audioUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  videoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  estimatedMinutes?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class CreateExerciseDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty()
  @IsString()
  lessonId: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsObject()
  content: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  points?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateExerciseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  content?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  points?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class CreateVocabularyDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  word: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  translation: string;

  @ApiProperty()
  @IsString()
  lessonId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  pronunciation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  definition?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  example?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  audioUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiProperty({ enum: CEFRLevel, required: false })
  @IsOptional()
  @IsEnum(CEFRLevel)
  difficulty?: CEFRLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateGrammarRuleDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  explanation: string;

  @ApiProperty()
  @IsString()
  lessonId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examples?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  pattern?: string;

  @ApiProperty({ enum: CEFRLevel, required: false })
  @IsOptional()
  @IsEnum(CEFRLevel)
  difficulty?: CEFRLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
