import { IsString, IsOptional, MaxLength, MinLength, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CEFRLevel } from '../../shared/types';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  profileImage?: string;
}

export class UpdatePreferencesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  reminderNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  achievementNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  dailyXpGoal?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  weeklyLessonGoal?: number;

  @ApiProperty({ required: false, enum: CEFRLevel })
  @IsOptional()
  @IsEnum(CEFRLevel)
  targetLevel?: CEFRLevel;
}
