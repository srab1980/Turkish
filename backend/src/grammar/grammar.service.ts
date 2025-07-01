import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrammarRule } from '../lessons/entities/grammar-rule.entity';
import { UnitGrammar } from '../courses/entities/unit-grammar.entity';
import { CreateGrammarDto, UpdateGrammarDto, GrammarFilterDto } from './dto';

@Injectable()
export class GrammarService {
  constructor(
    @InjectRepository(GrammarRule)
    private grammarRepository: Repository<GrammarRule>,
    @InjectRepository(UnitGrammar)
    private unitGrammarRepository: Repository<UnitGrammar>
  ) {}

  async findAll(filters: GrammarFilterDto) {
    const queryBuilder = this.grammarRepository.createQueryBuilder('grammar');

    if (filters.search) {
      queryBuilder.where(
        '(grammar.title ILIKE :search OR grammar.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.difficultyLevel) {
      queryBuilder.andWhere('grammar.difficultyLevel = :difficultyLevel', {
        difficultyLevel: filters.difficultyLevel
      });
    }

    if (filters.grammarType) {
      queryBuilder.andWhere('grammar.grammarType = :grammarType', {
        grammarType: filters.grammarType
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('grammar.difficultyLevel', 'ASC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string): Promise<GrammarRule> {
    const grammar = await this.grammarRepository.findOne({
      where: { id }
    });

    if (!grammar) {
      throw new NotFoundException(`Grammar point with ID ${id} not found`);
    }

    return grammar;
  }

  async create(createGrammarDto: CreateGrammarDto): Promise<GrammarRule> {
    const grammar = this.grammarRepository.create(createGrammarDto);
    return await this.grammarRepository.save(grammar);
  }

  async update(id: string, updateGrammarDto: UpdateGrammarDto): Promise<GrammarRule> {
    const grammar = await this.findOne(id);
    Object.assign(grammar, updateGrammarDto);
    return await this.grammarRepository.save(grammar);
  }

  async remove(id: string): Promise<void> {
    const grammar = await this.findOne(id);
    await this.grammarRepository.remove(grammar);
  }

  async findByUnit(unitId: string): Promise<GrammarRule[]> {
    const unitGrammar = await this.unitGrammarRepository.find({
      where: { unitId },
      relations: ['grammarRule'],
      order: { introductionOrder: 'ASC' }
    });

    return unitGrammar.map(ug => ug.grammarRule);
  }

  async assignToUnit(unitId: string, grammarPointId: string, isPrimary = false, order?: number): Promise<UnitGrammar> {
    const unitGrammar = this.unitGrammarRepository.create({
      unitId,
      grammarPointId,
      isPrimary,
      introductionOrder: order
    });

    return await this.unitGrammarRepository.save(unitGrammar);
  }

  async findExercisesForGrammarPoint(grammarPointId: string) {
    // This would integrate with the exercise service to find exercises
    // that practice this specific grammar point
    return [];
  }
}
