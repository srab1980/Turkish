import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { VocabularyItem } from '../lessons/entities/vocabulary-item.entity';
import { VocabularyCategory } from '../lessons/entities/vocabulary-category.entity';
import { UnitVocabulary } from '../courses/entities/unit-vocabulary.entity';
import { CreateVocabularyDto, UpdateVocabularyDto, VocabularyFilterDto } from './dto';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(VocabularyItem)
    private vocabularyRepository: Repository<VocabularyItem>,
    @InjectRepository(VocabularyCategory)
    private categoryRepository: Repository<VocabularyCategory>,
    @InjectRepository(UnitVocabulary)
    private unitVocabularyRepository: Repository<UnitVocabulary>
  ) {}

  async findAll(filters: VocabularyFilterDto) {
    const queryBuilder = this.vocabularyRepository.createQueryBuilder('vocabulary');

    if (filters.search) {
      queryBuilder.where(
        '(vocabulary.turkishWord ILIKE :search OR vocabulary.englishTranslation ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.difficultyLevel) {
      queryBuilder.andWhere('vocabulary.difficultyLevel = :difficultyLevel', {
        difficultyLevel: filters.difficultyLevel
      });
    }

    if (filters.partOfSpeech) {
      queryBuilder.andWhere('vocabulary.partOfSpeech = :partOfSpeech', {
        partOfSpeech: filters.partOfSpeech
      });
    }

    if (filters.categoryId) {
      queryBuilder
        .leftJoin('vocabulary.categories', 'category')
        .andWhere('category.id = :categoryId', { categoryId: filters.categoryId });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('vocabulary.frequencyRank', 'ASC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string): Promise<VocabularyItem> {
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id },
      relations: ['categories']
    });

    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary item with ID ${id} not found`);
    }

    return vocabulary;
  }

  async create(createVocabularyDto: CreateVocabularyDto): Promise<VocabularyItem> {
    const vocabulary = this.vocabularyRepository.create(createVocabularyDto);
    return await this.vocabularyRepository.save(vocabulary);
  }

  async update(id: string, updateVocabularyDto: UpdateVocabularyDto): Promise<VocabularyItem> {
    const vocabulary = await this.findOne(id);
    Object.assign(vocabulary, updateVocabularyDto);
    return await this.vocabularyRepository.save(vocabulary);
  }

  async remove(id: string): Promise<void> {
    const vocabulary = await this.findOne(id);
    await this.vocabularyRepository.remove(vocabulary);
  }

  async bulkImport(vocabularyItems: CreateVocabularyDto[]): Promise<VocabularyItem[]> {
    const vocabularies = this.vocabularyRepository.create(vocabularyItems);
    return await this.vocabularyRepository.save(vocabularies);
  }

  async findByUnit(unitId: string): Promise<VocabularyItem[]> {
    const unitVocabularies = await this.unitVocabularyRepository.find({
      where: { unitId },
      relations: ['vocabularyItem'],
      order: { introductionOrder: 'ASC' }
    });

    return unitVocabularies.map(uv => uv.vocabularyItem);
  }

  async assignToUnit(unitId: string, vocabularyId: string, isPrimary = false, order?: number): Promise<UnitVocabulary> {
    const unitVocabulary = this.unitVocabularyRepository.create({
      unitId,
      vocabularyId,
      isPrimary,
      introductionOrder: order
    });

    return await this.unitVocabularyRepository.save(unitVocabulary);
  }

  // Category management
  async findAllCategories(): Promise<VocabularyCategory[]> {
    return await this.categoryRepository.find({
      order: { orderIndex: 'ASC' }
    });
  }

  async createCategory(categoryData: Partial<VocabularyCategory>): Promise<VocabularyCategory> {
    const category = this.categoryRepository.create(categoryData);
    return await this.categoryRepository.save(category);
  }

  async updateCategory(id: string, categoryData: Partial<VocabularyCategory>): Promise<VocabularyCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    Object.assign(category, categoryData);
    return await this.categoryRepository.save(category);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    await this.categoryRepository.remove(category);
  }
}
