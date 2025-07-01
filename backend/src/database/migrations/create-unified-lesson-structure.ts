import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class CreateUnifiedLessonStructure1703000000000 implements MigrationInterface {
  name = 'CreateUnifiedLessonStructure1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create sub_lessons table
    await queryRunner.createTable(
      new Table({
        name: 'sub_lessons',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'lesson_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'preparation',
              'reading',
              'grammar',
              'listening',
              'speaking',
              'writing',
              'vocabulary',
              'culture',
              'interactive',
              'classroom',
              'fun_learning',
              'review',
              'assessment'
            ],
            isNullable: false,
          },
          {
            name: 'content',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'learning_objectives',
            type: 'text',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'estimated_duration',
            type: 'integer',
            default: 10,
          },
          {
            name: 'difficulty_level',
            type: 'integer',
            default: 1,
          },
          {
            name: 'order_index',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'is_published',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_required',
            type: 'boolean',
            default: true,
          },
          {
            name: 'audio_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'video_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'image_urls',
            type: 'text',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'sub_lessons',
      {
        columnNames: ['lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'lessons',
        onDelete: 'CASCADE',
      }
    );

    // Add index for better performance
    await queryRunner.createIndex(
      'sub_lessons',
      {
        name: 'IDX_sub_lessons_lesson_id',
        columnNames: ['lesson_id'],
      }
    );

    await queryRunner.createIndex(
      'sub_lessons',
      {
        name: 'IDX_sub_lessons_type',
        columnNames: ['type'],
      }
    );

    await queryRunner.createIndex(
      'sub_lessons',
      {
        name: 'IDX_sub_lessons_order',
        columnNames: ['lesson_id', 'order_index'],
      }
    );

    // Add sub_lesson_id column to exercises table
    await queryRunner.query(`
      ALTER TABLE exercises 
      ADD COLUMN sub_lesson_id uuid NULL
    `);

    // Add foreign key for exercises -> sub_lessons
    await queryRunner.createForeignKey(
      'exercises',
      {
        columnNames: ['sub_lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'sub_lessons',
        onDelete: 'CASCADE',
      }
    );

    // Add sub_lesson_id column to vocabulary_items table
    await queryRunner.query(`
      ALTER TABLE vocabulary_items 
      ADD COLUMN sub_lesson_id uuid NULL
    `);

    // Add foreign key for vocabulary_items -> sub_lessons
    await queryRunner.createForeignKey(
      'vocabulary_items',
      {
        columnNames: ['sub_lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'sub_lessons',
        onDelete: 'CASCADE',
      }
    );

    // Add sub_lesson_id column to grammar_rules table
    await queryRunner.query(`
      ALTER TABLE grammar_rules 
      ADD COLUMN sub_lesson_id uuid NULL
    `);

    // Add foreign key for grammar_rules -> sub_lessons
    await queryRunner.createForeignKey(
      'grammar_rules',
      {
        columnNames: ['sub_lesson_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'sub_lessons',
        onDelete: 'CASCADE',
      }
    );

    // Create standard sub-lessons for existing lessons
    await this.createStandardSubLessons(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign keys first
    const exercisesForeignKey = await queryRunner.getTable('exercises');
    const vocabularyForeignKey = await queryRunner.getTable('vocabulary_items');
    const grammarForeignKey = await queryRunner.getTable('grammar_rules');

    if (exercisesForeignKey) {
      const exercisesFK = exercisesForeignKey.foreignKeys.find(fk => fk.columnNames.indexOf('sub_lesson_id') !== -1);
      if (exercisesFK) await queryRunner.dropForeignKey('exercises', exercisesFK);
    }

    if (vocabularyForeignKey) {
      const vocabularyFK = vocabularyForeignKey.foreignKeys.find(fk => fk.columnNames.indexOf('sub_lesson_id') !== -1);
      if (vocabularyFK) await queryRunner.dropForeignKey('vocabulary_items', vocabularyFK);
    }

    if (grammarForeignKey) {
      const grammarFK = grammarForeignKey.foreignKeys.find(fk => fk.columnNames.indexOf('sub_lesson_id') !== -1);
      if (grammarFK) await queryRunner.dropForeignKey('grammar_rules', grammarFK);
    }

    // Remove columns
    await queryRunner.query(`ALTER TABLE exercises DROP COLUMN IF EXISTS sub_lesson_id`);
    await queryRunner.query(`ALTER TABLE vocabulary_items DROP COLUMN IF EXISTS sub_lesson_id`);
    await queryRunner.query(`ALTER TABLE grammar_rules DROP COLUMN IF EXISTS sub_lesson_id`);

    // Drop sub_lessons table
    await queryRunner.dropTable('sub_lessons');
  }

  private async createStandardSubLessons(queryRunner: QueryRunner): Promise<void> {
    // Get all existing lessons
    const lessons = await queryRunner.query(`SELECT id, title FROM lessons`);

    const standardSubLessonTypes = [
      { type: 'preparation', title: 'Hazırlık Çalışmaları', order: 1, duration: 5 },
      { type: 'reading', title: 'Okuma', order: 2, duration: 15 },
      { type: 'vocabulary', title: 'Kelime Listesi', order: 3, duration: 10 },
      { type: 'grammar', title: 'Dilbilgisi', order: 4, duration: 15 },
      { type: 'listening', title: 'Dinleme', order: 5, duration: 10 },
      { type: 'speaking', title: 'Konuşma', order: 6, duration: 15 },
      { type: 'writing', title: 'Yazma', order: 7, duration: 20 },
      { type: 'culture', title: 'Kültürden Kültüre', order: 8, duration: 10, required: false },
      { type: 'review', title: 'Neler Öğrendik', order: 9, duration: 10 },
      { type: 'assessment', title: 'Öz Değerlendirme', order: 10, duration: 15 }
    ];

    for (const lesson of lessons) {
      for (const subLessonTemplate of standardSubLessonTypes) {
        await queryRunner.query(`
          INSERT INTO sub_lessons (
            lesson_id, title, description, type, content, learning_objectives,
            estimated_duration, difficulty_level, order_index, is_published, is_required
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          )
        `, [
          lesson.id,
          subLessonTemplate.title,
          `${subLessonTemplate.title} bölümü - ${lesson.title}`,
          subLessonTemplate.type,
          '{}',
          '{}',
          subLessonTemplate.duration,
          1,
          subLessonTemplate.order,
          false,
          subLessonTemplate.required !== false
        ]);
      }
    }

    // Move existing vocabulary items to vocabulary sub-lessons
    await queryRunner.query(`
      UPDATE vocabulary_items 
      SET sub_lesson_id = (
        SELECT sl.id 
        FROM sub_lessons sl 
        WHERE sl.lesson_id = vocabulary_items.lesson_id 
        AND sl.type = 'vocabulary' 
        LIMIT 1
      )
      WHERE lesson_id IS NOT NULL
    `);

    // Move existing grammar rules to grammar sub-lessons
    await queryRunner.query(`
      UPDATE grammar_rules 
      SET sub_lesson_id = (
        SELECT sl.id 
        FROM sub_lessons sl 
        WHERE sl.lesson_id = grammar_rules.lesson_id 
        AND sl.type = 'grammar' 
        LIMIT 1
      )
      WHERE lesson_id IS NOT NULL
    `);

    // Move existing exercises to appropriate sub-lessons based on their type
    await queryRunner.query(`
      UPDATE exercises 
      SET sub_lesson_id = (
        SELECT sl.id 
        FROM sub_lessons sl 
        WHERE sl.lesson_id = exercises.lesson_id 
        AND sl.type = CASE 
          WHEN exercises.type LIKE '%vocabulary%' THEN 'vocabulary'
          WHEN exercises.type LIKE '%grammar%' THEN 'grammar'
          WHEN exercises.type LIKE '%reading%' THEN 'reading'
          WHEN exercises.type LIKE '%listening%' THEN 'listening'
          WHEN exercises.type LIKE '%speaking%' THEN 'speaking'
          WHEN exercises.type LIKE '%writing%' THEN 'writing'
          ELSE 'review'
        END
        LIMIT 1
      )
      WHERE lesson_id IS NOT NULL
    `);
  }
}
