import { IsString, IsOptional, IsNumber, IsUrl, Min, Max } from 'class-validator';

export class CreateVocabularyDto {
  @IsString()
  turkishWord: string;

  @IsString()
  englishTranslation: string;

  @IsOptional()
  @IsString()
  pronunciation?: string;

  @IsOptional()
  @IsString()
  partOfSpeech?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  difficultyLevel?: number;

  @IsOptional()
  @IsNumber()
  frequencyRank?: number;

  @IsOptional()
  @IsString()
  usageContext?: string;

  @IsOptional()
  @IsString()
  exampleSentenceTr?: string;

  @IsOptional()
  @IsString()
  exampleSentenceEn?: string;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  lessonId?: string;
}
