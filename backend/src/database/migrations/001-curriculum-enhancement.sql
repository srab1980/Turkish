-- Migration: Enhanced Curriculum Database Schema
-- Description: Update database schema to support comprehensive A1 Turkish curriculum

-- 1. Update courses table
ALTER TABLE courses 
ADD COLUMN language_code VARCHAR(5) DEFAULT 'tr',
ADD COLUMN total_units INTEGER DEFAULT 0,
ADD COLUMN version INTEGER DEFAULT 1,
ALTER COLUMN title TYPE VARCHAR(255),
RENAME COLUMN "order" TO order_index;

-- 2. Update units table
ALTER TABLE units 
ADD COLUMN unit_number INTEGER,
ADD COLUMN learning_objectives TEXT[],
ADD COLUMN cultural_notes TEXT,
ADD COLUMN estimated_hours INTEGER DEFAULT 0,
ADD COLUMN is_published BOOLEAN DEFAULT false,
ALTER COLUMN title TYPE VARCHAR(255),
RENAME COLUMN "order" TO order_index,
DROP COLUMN is_locked;

-- 3. Update lessons table
ALTER TABLE lessons 
ADD COLUMN lesson_number INTEGER,
ADD COLUMN learning_objectives TEXT[],
ADD COLUMN prerequisites TEXT[],
ADD COLUMN difficulty_level INTEGER DEFAULT 1,
ALTER COLUMN title TYPE VARCHAR(255),
ALTER COLUMN content TYPE JSONB,
ALTER COLUMN type DROP NOT NULL,
RENAME COLUMN type TO lesson_type,
RENAME COLUMN "order" TO order_index,
RENAME COLUMN estimated_minutes TO estimated_duration,
DROP COLUMN xp_reward;

-- 4. Update vocabulary table
ALTER TABLE vocabulary_items RENAME TO vocabulary;
ALTER TABLE vocabulary 
ADD COLUMN part_of_speech VARCHAR(50),
ADD COLUMN frequency_rank INTEGER,
ADD COLUMN usage_context TEXT,
ADD COLUMN example_sentence_tr TEXT,
ADD COLUMN example_sentence_en TEXT,
ADD COLUMN audio_url VARCHAR(500),
ADD COLUMN image_url VARCHAR(500),
ALTER COLUMN lesson_id DROP NOT NULL,
RENAME COLUMN turkish TO turkish_word,
RENAME COLUMN english TO english_translation;

-- 5. Update grammar_rules table
ALTER TABLE grammar_rules RENAME TO grammar_points;
ALTER TABLE grammar_points 
ADD COLUMN description TEXT,
ADD COLUMN grammar_type VARCHAR(100),
ADD COLUMN rules TEXT[],
ADD COLUMN exceptions TEXT[],
ADD COLUMN related_points UUID[],
ALTER COLUMN title TYPE VARCHAR(255),
ALTER COLUMN examples TYPE JSONB,
ALTER COLUMN lesson_id DROP NOT NULL,
DROP COLUMN category;

-- 6. Create vocabulary_categories table
CREATE TABLE vocabulary_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color_code VARCHAR(7),
  icon VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Create vocabulary_category_mappings table
CREATE TABLE vocabulary_category_mappings (
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  category_id UUID REFERENCES vocabulary_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (vocabulary_id, category_id)
);

-- 8. Create exercise_types table
CREATE TABLE exercise_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  component_name VARCHAR(255),
  config_schema JSONB,
  skill_focus VARCHAR(100),
  interaction_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. Update exercises table
ALTER TABLE exercises 

ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT 'Exercise',
ADD COLUMN instructions TEXT,
ADD COLUMN content JSONB NOT NULL DEFAULT '{}',
ADD COLUMN correct_answers JSONB,
ADD COLUMN hints JSONB,
ADD COLUMN feedback JSONB,
ADD COLUMN time_limit INTEGER,
ADD COLUMN difficulty_level INTEGER DEFAULT 1,
ADD COLUMN is_published BOOLEAN DEFAULT false,
RENAME COLUMN "order" TO order_index,
DROP COLUMN type,
DROP COLUMN question,
DROP COLUMN options,
DROP COLUMN correct_answer,
DROP COLUMN explanation;

-- 10. Create media_files table
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  file_type VARCHAR(50) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  duration INTEGER,
  alt_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. Create content_media table
CREATE TABLE content_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL,
  content_id UUID NOT NULL,
  media_role VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 12. Update user_progress table
ALTER TABLE user_progress 
ADD COLUMN course_id UUID,
ADD COLUMN unit_id UUID,
ADD COLUMN exercise_id UUID,
ADD COLUMN progress_type VARCHAR(50) NOT NULL DEFAULT 'lesson',
ADD COLUMN status VARCHAR(50) DEFAULT 'not_started',
ADD COLUMN max_score INTEGER,
ADD COLUMN attempts INTEGER DEFAULT 0,
ADD COLUMN first_attempt_at TIMESTAMP,
RENAME COLUMN is_completed TO completed_at,
RENAME COLUMN completion_percentage TO time_spent,
RENAME COLUMN attempts_count TO attempts,
RENAME COLUMN best_score TO score,
ALTER COLUMN lesson_id DROP NOT NULL;

-- 13. Create vocabulary_progress table
CREATE TABLE vocabulary_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  mastery_level INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP,
  next_review_at TIMESTAMP,
  spaced_repetition_interval INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, vocabulary_id)
);

-- 14. Create grammar_progress table
CREATE TABLE grammar_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  grammar_point_id UUID REFERENCES grammar_points(id) ON DELETE CASCADE,
  understanding_level INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, grammar_point_id)
);

-- 15. Create unit_vocabulary table
CREATE TABLE unit_vocabulary (
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  introduction_order INTEGER,
  PRIMARY KEY (unit_id, vocabulary_id)
);

-- 16. Create unit_grammar table
CREATE TABLE unit_grammar (
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  grammar_point_id UUID REFERENCES grammar_points(id) ON DELETE CASCADE,
  introduction_order INTEGER,
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY (unit_id, grammar_point_id)
);

-- 17. Insert default exercise types
INSERT INTO exercise_types (name, description, component_name, skill_focus, interaction_type) VALUES
('Vocabulary Matching', 'Match Turkish words with corresponding images or translations', 'VocabMatchingExercise', 'vocabulary', 'drag_drop'),
('Fill in the Blank', 'Complete sentences with appropriate vocabulary or grammar', 'FillBlankExercise', 'vocabulary', 'fill_blank'),
('Multiple Choice', 'Choose the correct answer from multiple options', 'MultipleChoiceExercise', 'grammar', 'multiple_choice'),
('Listening Comprehension', 'Answer questions based on audio recordings', 'ListeningExercise', 'listening', 'multiple_choice'),
('Reading Comprehension', 'Answer questions based on reading passages', 'ReadingExercise', 'reading', 'multiple_choice'),
('Pronunciation Practice', 'Practice pronunciation with speech recognition', 'PronunciationExercise', 'speaking', 'audio_response'),
('Sentence Building', 'Construct sentences from given words', 'SentenceBuildingExercise', 'grammar', 'drag_drop'),
('Dictation', 'Write down what you hear', 'DictationExercise', 'listening', 'fill_blank');

-- 18. Insert default vocabulary categories
INSERT INTO vocabulary_categories (name, description, color_code, icon, order_index) VALUES
('Greetings', 'Basic greetings and farewells', '#FF6B6B', 'wave', 1),
('Family', 'Family members and relationships', '#4ECDC4', 'users', 2),
('Numbers', 'Numbers and counting', '#45B7D1', 'hash', 3),
('Colors', 'Colors and descriptions', '#96CEB4', 'palette', 4),
('Food', 'Food and drinks', '#FFEAA7', 'utensils', 5),
('School', 'School and education', '#DDA0DD', 'graduation-cap', 6),
('Time', 'Time expressions and calendar', '#98D8C8', 'clock', 7),
('Places', 'Locations and directions', '#F7DC6F', 'map-marker', 8);

-- 19. Create indexes for performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX idx_user_progress_unit_id ON user_progress(unit_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_vocabulary_progress_user_id ON vocabulary_progress(user_id);
CREATE INDEX idx_grammar_progress_user_id ON grammar_progress(user_id);
CREATE INDEX idx_content_media_content ON content_media(content_type, content_id);
CREATE INDEX idx_vocabulary_difficulty ON vocabulary(difficulty_level);
CREATE INDEX idx_exercises_lesson_id ON exercises(lesson_id);

-- 20. Add updated_at triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vocabulary_categories_updated_at BEFORE UPDATE ON vocabulary_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercise_types_updated_at BEFORE UPDATE ON exercise_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vocabulary_progress_updated_at BEFORE UPDATE ON vocabulary_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grammar_progress_updated_at BEFORE UPDATE ON grammar_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
