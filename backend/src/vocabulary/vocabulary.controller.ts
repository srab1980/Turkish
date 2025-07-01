import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { CreateVocabularyDto, UpdateVocabularyDto, VocabularyFilterDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vocabulary')
@UseGuards(JwtAuthGuard)
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get()
  async findAll(@Query() filters: VocabularyFilterDto) {
    return await this.vocabularyService.findAll(filters);
  }

  @Get('categories')
  async findAllCategories() {
    return await this.vocabularyService.findAllCategories();
  }

  @Get('unit/:unitId')
  async findByUnit(@Param('unitId') unitId: string) {
    return await this.vocabularyService.findByUnit(unitId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.vocabularyService.findOne(id);
  }

  @Post()
  async create(@Body() createVocabularyDto: CreateVocabularyDto) {
    return await this.vocabularyService.create(createVocabularyDto);
  }

  @Post('bulk-import')
  async bulkImport(@Body() vocabularyItems: CreateVocabularyDto[]) {
    return await this.vocabularyService.bulkImport(vocabularyItems);
  }

  @Post('categories')
  async createCategory(@Body() categoryData: any) {
    return await this.vocabularyService.createCategory(categoryData);
  }

  @Post(':vocabularyId/assign-unit/:unitId')
  async assignToUnit(
    @Param('vocabularyId') vocabularyId: string,
    @Param('unitId') unitId: string,
    @Body() assignmentData: { isPrimary?: boolean; order?: number }
  ) {
    return await this.vocabularyService.assignToUnit(
      unitId,
      vocabularyId,
      assignmentData.isPrimary,
      assignmentData.order
    );
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVocabularyDto: UpdateVocabularyDto) {
    return await this.vocabularyService.update(id, updateVocabularyDto);
  }

  @Patch('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() categoryData: any) {
    return await this.vocabularyService.updateCategory(id, categoryData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.vocabularyService.remove(id);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCategory(@Param('id') id: string) {
    await this.vocabularyService.removeCategory(id);
  }
}
