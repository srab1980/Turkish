-- Turkish Learning Platform Database Initialization
-- This script sets up the initial database schema and data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types
CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');
CREATE TYPE proficiency_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE content_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    native_language VARCHAR(100),
    proficiency_level proficiency_level DEFAULT 'BEGINNER',
    learning_goals TEXT[],
    avatar_url VARCHAR(500),
    timezone VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level proficiency_level NOT NULL,
    status content_status DEFAULT 'DRAFT',
    thumbnail_url VARCHAR(500),
    estimated_duration INTEGER, -- in minutes
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB,
    order_index INTEGER NOT NULL,
    duration INTEGER, -- in minutes
    status content_status DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turkish VARCHAR(255) NOT NULL,
    english VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255),
    category VARCHAR(100),
    difficulty proficiency_level,
    audio_url VARCHAR(500),
    example_sentence TEXT,
    example_translation TEXT,
    tags TEXT[],
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grammar rules table
CREATE TABLE IF NOT EXISTS grammar_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rule_text TEXT NOT NULL,
    level proficiency_level NOT NULL,
    category VARCHAR(100),
    examples JSONB,
    exceptions TEXT[],
    status content_status DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- multiple_choice, fill_blank, matching, etc.
    content JSONB NOT NULL,
    difficulty proficiency_level,
    points INTEGER DEFAULT 10,
    time_limit INTEGER, -- in seconds
    status content_status DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP,
    score INTEGER,
    time_spent INTEGER, -- in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Exercise attempts table
CREATE TABLE IF NOT EXISTS exercise_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    answers JSONB,
    score INTEGER,
    max_score INTEGER,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_taken INTEGER -- in seconds
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0,
    target_audience VARCHAR(100) DEFAULT 'all',
    environments JSONB DEFAULT '{"development": false, "staging": false, "production": false}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_vocabulary_category ON vocabulary(category);
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty ON vocabulary(difficulty);
CREATE INDEX IF NOT EXISTS idx_vocabulary_turkish ON vocabulary USING gin(turkish gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vocabulary_english ON vocabulary USING gin(english gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson_id ON exercises(lesson_id);
CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises(type);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vocabulary_updated_at BEFORE UPDATE ON vocabulary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grammar_rules_updated_at BEFORE UPDATE ON grammar_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO users (email, password_hash, full_name, role, email_verified) VALUES
('admin@turkishlearning.com', '$2b$10$example_hash_here', 'Admin User', 'ADMIN', true),
('teacher@turkishlearning.com', '$2b$10$example_hash_here', 'Teacher User', 'TEACHER', true),
('student@turkishlearning.com', '$2b$10$example_hash_here', 'Student User', 'STUDENT', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample vocabulary
INSERT INTO vocabulary (turkish, english, pronunciation, category, difficulty, example_sentence, example_translation, tags) VALUES
('merhaba', 'hello', 'mer-ha-BA', 'greetings', 'BEGINNER', 'Merhaba, nasılsın?', 'Hello, how are you?', ARRAY['greeting', 'basic']),
('teşekkür ederim', 'thank you', 'te-shek-KUER e-de-RIM', 'politeness', 'BEGINNER', 'Yardımınız için teşekkür ederim.', 'Thank you for your help.', ARRAY['politeness', 'gratitude']),
('günaydın', 'good morning', 'guen-ay-DIN', 'greetings', 'BEGINNER', 'Günaydın! Nasıl uyudunuz?', 'Good morning! How did you sleep?', ARRAY['greeting', 'time']),
('okul', 'school', 'o-KUL', 'education', 'BEGINNER', 'Okula gidiyorum.', 'I am going to school.', ARRAY['education', 'building'])
ON CONFLICT DO NOTHING;

-- Insert sample feature flags
INSERT INTO feature_flags (name, display_name, description, enabled, rollout_percentage, target_audience, environments) VALUES
('ai_content_generation', 'AI Content Generation', 'Enable AI-powered content generation for lessons and exercises', true, 100, 'all', '{"development": true, "staging": true, "production": true}'),
('advanced_analytics', 'Advanced Analytics Dashboard', 'Show detailed analytics and reporting features', true, 50, 'premium', '{"development": true, "staging": true, "production": false}'),
('voice_recognition', 'Voice Recognition Exercises', 'Enable voice recognition for pronunciation exercises', false, 10, 'beta', '{"development": true, "staging": false, "production": false}'),
('social_learning', 'Social Learning Features', 'Enable social features like study groups and peer interactions', false, 0, 'none', '{"development": false, "staging": false, "production": false}')
ON CONFLICT (name) DO NOTHING;

-- Create views for analytics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE role = 'STUDENT') as total_students,
    COUNT(*) FILTER (WHERE role = 'TEACHER') as total_teachers,
    COUNT(*) FILTER (WHERE role = 'ADMIN') as total_admins,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE last_login_at > CURRENT_DATE - INTERVAL '30 days') as monthly_active_users,
    COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '30 days') as new_users_this_month
FROM users;

CREATE OR REPLACE VIEW content_stats AS
SELECT 
    (SELECT COUNT(*) FROM courses) as total_courses,
    (SELECT COUNT(*) FROM courses WHERE status = 'PUBLISHED') as published_courses,
    (SELECT COUNT(*) FROM lessons) as total_lessons,
    (SELECT COUNT(*) FROM lessons WHERE status = 'PUBLISHED') as published_lessons,
    (SELECT COUNT(*) FROM vocabulary) as total_vocabulary,
    (SELECT COUNT(*) FROM exercises) as total_exercises;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
