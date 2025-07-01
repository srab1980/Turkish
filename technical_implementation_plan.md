# Technical Implementation Plan - A1 Turkish Curriculum

## Database Schema Enhancement

### 1. Core Curriculum Tables

#### Courses Table (Enhanced)
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(10) NOT NULL, -- A1, A2, B1, etc.
  language_code VARCHAR(5) DEFAULT 'tr',
  total_units INTEGER DEFAULT 0,
  estimated_hours INTEGER,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1
);
```

#### Units Table (New)
```sql
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  unit_number INTEGER NOT NULL,
  learning_objectives TEXT[],
  cultural_notes TEXT,
  estimated_hours INTEGER,
  order_index INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Lessons Table (Enhanced)
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  lesson_number INTEGER NOT NULL,
  lesson_type VARCHAR(50), -- introduction, vocabulary, grammar, practice, assessment
  content JSONB, -- Structured lesson content
  learning_objectives TEXT[],
  prerequisites TEXT[],
  estimated_duration INTEGER, -- in minutes
  difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
  order_index INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Vocabulary Management

#### Vocabulary Table (New)
```sql
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turkish_word VARCHAR(255) NOT NULL,
  english_translation VARCHAR(255) NOT NULL,
  pronunciation VARCHAR(255),
  part_of_speech VARCHAR(50), -- noun, verb, adjective, etc.
  difficulty_level INTEGER DEFAULT 1,
  frequency_rank INTEGER, -- how common the word is
  usage_context TEXT,
  example_sentence_tr TEXT,
  example_sentence_en TEXT,
  audio_url VARCHAR(500),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Vocabulary Categories (New)
```sql
CREATE TABLE vocabulary_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color_code VARCHAR(7), -- hex color for UI
  icon VARCHAR(100),
  order_index INTEGER
);

CREATE TABLE vocabulary_category_mappings (
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  category_id UUID REFERENCES vocabulary_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (vocabulary_id, category_id)
);
```

#### Unit Vocabulary Mappings (New)
```sql
CREATE TABLE unit_vocabulary (
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- main vocabulary for the unit
  introduction_order INTEGER,
  PRIMARY KEY (unit_id, vocabulary_id)
);
```

### 3. Grammar System

#### Grammar Points Table (New)
```sql
CREATE TABLE grammar_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  explanation TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1,
  grammar_type VARCHAR(100), -- case, tense, suffix, etc.
  examples JSONB, -- Array of example objects
  rules TEXT[],
  exceptions TEXT[],
  related_points UUID[], -- References to other grammar_points
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Unit Grammar Mappings (New)
```sql
CREATE TABLE unit_grammar (
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  grammar_point_id UUID REFERENCES grammar_points(id) ON DELETE CASCADE,
  introduction_order INTEGER,
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY (unit_id, grammar_point_id)
);
```

### 4. Exercise System

#### Exercise Types Table (New)
```sql
CREATE TABLE exercise_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  component_name VARCHAR(255), -- React component name
  config_schema JSONB, -- JSON schema for exercise configuration
  skill_focus VARCHAR(100), -- vocabulary, grammar, reading, listening, etc.
  interaction_type VARCHAR(100) -- multiple_choice, drag_drop, fill_blank, etc.
);
```

#### Exercises Table (Enhanced)
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  exercise_type_id UUID REFERENCES exercise_types(id),
  title VARCHAR(255) NOT NULL,
  instructions TEXT,
  content JSONB NOT NULL, -- Exercise-specific content and configuration
  correct_answers JSONB,
  hints JSONB,
  feedback JSONB,
  points INTEGER DEFAULT 10,
  time_limit INTEGER, -- in seconds
  difficulty_level INTEGER DEFAULT 1,
  order_index INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Progress Tracking Enhancement

#### User Progress Table (Enhanced)
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES courses(id),
  unit_id UUID REFERENCES units(id),
  lesson_id UUID REFERENCES lessons(id),
  exercise_id UUID REFERENCES exercises(id),
  progress_type VARCHAR(50), -- course, unit, lesson, exercise, vocabulary, grammar
  status VARCHAR(50), -- not_started, in_progress, completed, mastered
  score INTEGER,
  max_score INTEGER,
  attempts INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  first_attempt_at TIMESTAMP,
  completed_at TIMESTAMP,
  last_accessed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Vocabulary Progress (New)
```sql
CREATE TABLE vocabulary_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vocabulary_id UUID REFERENCES vocabulary(id),
  mastery_level INTEGER DEFAULT 0, -- 0-5 scale
  correct_attempts INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP,
  next_review_at TIMESTAMP,
  spaced_repetition_interval INTEGER DEFAULT 1, -- days
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, vocabulary_id)
);
```

#### Grammar Progress (New)
```sql
CREATE TABLE grammar_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  grammar_point_id UUID REFERENCES grammar_points(id),
  understanding_level INTEGER DEFAULT 0, -- 0-5 scale
  correct_attempts INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, grammar_point_id)
);
```

### 6. Media Management

#### Media Files Table (New)
```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  file_type VARCHAR(50), -- image, audio, video
  mime_type VARCHAR(100),
  file_size INTEGER,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  duration INTEGER, -- for audio/video files
  alt_text TEXT, -- for accessibility
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Content Media Mappings (New)
```sql
CREATE TABLE content_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES media_files(id),
  content_type VARCHAR(50), -- lesson, exercise, vocabulary, grammar
  content_id UUID NOT NULL,
  media_role VARCHAR(50), -- main_image, audio_pronunciation, example_audio, etc.
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints Enhancement

### 1. Course Management APIs

#### Course Endpoints
```typescript
// GET /api/courses - List all courses with filtering
// GET /api/courses/:id - Get course details with units
// POST /api/courses - Create new course
// PUT /api/courses/:id - Update course
// DELETE /api/courses/:id - Delete course
// POST /api/courses/:id/publish - Publish course
```

#### Unit Endpoints
```typescript
// GET /api/courses/:courseId/units - List units for a course
// GET /api/units/:id - Get unit details with lessons
// POST /api/courses/:courseId/units - Create new unit
// PUT /api/units/:id - Update unit
// DELETE /api/units/:id - Delete unit
// POST /api/units/:id/reorder - Reorder lessons in unit
```

#### Lesson Endpoints
```typescript
// GET /api/units/:unitId/lessons - List lessons for a unit
// GET /api/lessons/:id - Get lesson details with exercises
// POST /api/units/:unitId/lessons - Create new lesson
// PUT /api/lessons/:id - Update lesson
// DELETE /api/lessons/:id - Delete lesson
// POST /api/lessons/:id/duplicate - Duplicate lesson
```

### 2. Vocabulary Management APIs

```typescript
// GET /api/vocabulary - List vocabulary with filtering and search
// GET /api/vocabulary/:id - Get vocabulary details
// POST /api/vocabulary - Create new vocabulary entry
// PUT /api/vocabulary/:id - Update vocabulary
// DELETE /api/vocabulary/:id - Delete vocabulary
// POST /api/vocabulary/bulk-import - Bulk import vocabulary
// GET /api/vocabulary/categories - List vocabulary categories
// POST /api/vocabulary/categories - Create vocabulary category
```

### 3. Grammar Management APIs

```typescript
// GET /api/grammar-points - List grammar points
// GET /api/grammar-points/:id - Get grammar point details
// POST /api/grammar-points - Create new grammar point
// PUT /api/grammar-points/:id - Update grammar point
// DELETE /api/grammar-points/:id - Delete grammar point
// GET /api/grammar-points/:id/exercises - Get exercises for grammar point
```

### 4. Exercise Management APIs

```typescript
// GET /api/exercise-types - List available exercise types
// GET /api/lessons/:lessonId/exercises - List exercises for a lesson
// GET /api/exercises/:id - Get exercise details
// POST /api/lessons/:lessonId/exercises - Create new exercise
// PUT /api/exercises/:id - Update exercise
// DELETE /api/exercises/:id - Delete exercise
// POST /api/exercises/:id/test - Test exercise configuration
```

### 5. Progress Tracking APIs

```typescript
// GET /api/users/:userId/progress - Get user's overall progress
// GET /api/users/:userId/progress/course/:courseId - Course-specific progress
// POST /api/users/:userId/progress/exercise/:exerciseId - Record exercise attempt
// GET /api/users/:userId/vocabulary-progress - Vocabulary mastery status
// GET /api/users/:userId/grammar-progress - Grammar understanding status
// POST /api/users/:userId/vocabulary/:vocabId/review - Record vocabulary review
```

### 6. Media Management APIs

```typescript
// POST /api/media/upload - Upload media file
// GET /api/media/:id - Get media file details
// DELETE /api/media/:id - Delete media file
// POST /api/media/bulk-upload - Bulk upload media files
// GET /api/content/:contentType/:contentId/media - Get media for content
// POST /api/content/:contentType/:contentId/media - Associate media with content
```

## Implementation Priority

### Phase 1 (Week 1): Core Schema
1. Create enhanced courses, units, lessons tables
2. Implement basic CRUD APIs for course structure
3. Set up media file management

### Phase 2 (Week 2): Vocabulary System
1. Create vocabulary and category tables
2. Implement vocabulary management APIs
3. Set up vocabulary-unit relationships

### Phase 3 (Week 2): Grammar System
1. Create grammar points table
2. Implement grammar management APIs
3. Set up grammar-unit relationships

### Phase 4 (Week 3): Exercise System
1. Create exercise types and exercises tables
2. Implement exercise management APIs
3. Set up exercise configuration system

### Phase 5 (Week 3): Progress Tracking
1. Enhance progress tracking tables
2. Implement detailed progress APIs
3. Set up spaced repetition system

This technical plan provides a robust foundation for implementing the A1 Turkish curriculum with comprehensive content management, progress tracking, and multimedia support.
