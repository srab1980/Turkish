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
import { GrammarService } from './grammar.service';
import { CreateGrammarDto, UpdateGrammarDto, GrammarFilterDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('grammar-points')
@UseGuards(JwtAuthGuard)
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Get()
  async findAll(@Query() filters: GrammarFilterDto) {
    return await this.grammarService.findAll(filters);
  }

  @Get('unit/:unitId')
  async findByUnit(@Param('unitId') unitId: string) {
    return await this.grammarService.findByUnit(unitId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.grammarService.findOne(id);
  }

  @Get(':id/exercises')
  async findExercises(@Param('id') id: string) {
    return await this.grammarService.findExercisesForGrammarPoint(id);
  }

  @Post()
  async create(@Body() createGrammarDto: CreateGrammarDto) {
    return await this.grammarService.create(createGrammarDto);
  }

  @Post(':grammarPointId/assign-unit/:unitId')
  async assignToUnit(
    @Param('grammarPointId') grammarPointId: string,
    @Param('unitId') unitId: string,
    @Body() assignmentData: { isPrimary?: boolean; order?: number }
  ) {
    return await this.grammarService.assignToUnit(
      unitId,
      grammarPointId,
      assignmentData.isPrimary,
      assignmentData.order
    );
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateGrammarDto: UpdateGrammarDto) {
    return await this.grammarService.update(id, updateGrammarDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.grammarService.remove(id);
  }
}
