import { Controller, Post, Get, HttpException, HttpStatus } from '@nestjs/common';
import { CurriculumImportService } from './curriculum-import.service';

@Controller('curriculum')
export class CurriculumController {
  constructor(
    private readonly curriculumImportService: CurriculumImportService
  ) {}

  @Post('import')
  async importA1Curriculum() {
    try {
      const result = await this.curriculumImportService.importA1TurkishCurriculum();
      
      return {
        success: true,
        message: 'A1 Turkish curriculum imported successfully',
        data: {
          course: result.course.title,
          unitsCreated: result.units.length,
          lessonsCreated: result.lessons.length,
          exercisesCreated: result.exercises.length,
          vocabularyCreated: result.vocabulary.length,
          grammarRulesCreated: result.grammar.length
        }
      };
    } catch (error) {
      console.error('Error importing curriculum:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to import curriculum',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status')
  async getCurriculumStatus() {
    try {
      // This endpoint can be used to check if curriculum is already imported
      return {
        success: true,
        message: 'Curriculum status retrieved',
        // Add logic to check if curriculum exists
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get curriculum status',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('data')
  async getCurriculumData() {
    try {
      const curriculumData = await this.curriculumImportService.getCurriculumData();

      return {
        success: true,
        message: 'Curriculum data retrieved successfully',
        data: curriculumData
      };
    } catch (error) {
      console.error('Error getting curriculum data:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get curriculum data',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
