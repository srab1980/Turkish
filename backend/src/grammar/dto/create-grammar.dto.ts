import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';

export class CreateGrammarDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  explanation: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  difficultyLevel?: number;

  @IsOptional()
  @IsString()
  grammarType?: string;

  @IsOptional()
  examples?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exceptions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedPoints?: string[];

  @IsOptional()
  @IsString()
  lessonId?: string;
}
