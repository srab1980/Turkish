# Database Schema Documentation

## Overview

The Turkish Learning App uses PostgreSQL as the primary database with the following key features:
- UUID primary keys for all tables
- JSONB columns for flexible content storage
- Comprehensive indexing for performance
- Triggers for automated data management
- Views for complex queries

## Core Tables

### Users Table
Stores user account information and learning progress.

```sql
users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_image VARCHAR(500),
    role user_role DEFAULT 'student',
    level cefr_level DEFAULT 'A1',
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
```

### Courses Table
Defines the course structure and metadata.

```sql
courses (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    level cefr_level NOT NULL,
    image_url VARCHAR(500),
    total_lessons INTEGER DEFAULT 0,
    estimated_hours INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
```

### Lessons Table
Contains lesson content and structure.

```sql
lessons (
    id UUID PRIMARY KEY,
    unit_id UUID REFERENCES units(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type lesson_type NOT NULL,
    content JSONB,
    order_index INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 10,
    estimated_minutes INTEGER DEFAULT 15,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
```

## Content Structure

### Lesson Content JSONB Schema
```json
{
  "text": "Lesson introduction text",
  "audio": "https://example.com/audio.mp3",
  "images": ["https://example.com/image1.jpg"],
  "video": "https://example.com/video.mp4",
  "vocabulary": [
    {
      "turkish": "Merhaba",
      "english": "Hello",
      "pronunciation": "mer-ha-BA",
      "audio": "https://example.com/merhaba.mp3",
      "example": "Merhaba, nasılsın?",
      "imageUrl": "https://example.com/hello.jpg"
    }
  ],
  "grammarRules": [
    {
      "title": "Present Tense",
      "explanation": "How to form present tense in Turkish",
      "examples": [
        {
          "turkish": "Ben okuyorum",
          "english": "I am reading",
          "breakdown": "Ben (I) + oku (read) + yor (present) + um (1st person)"
        }
      ]
    }
  ]
}
```

### Exercise Options JSONB Schema
```json
{
  "multiple_choice": ["Option A", "Option B", "Option C", "Option D"],
  "fill_blank": {
    "sentence": "Ben _____ okuyorum",
    "blanks": ["kitap", "gazete", "dergi"]
  },
  "matching": {
    "left": ["Merhaba", "Günaydın", "İyi geceler"],
    "right": ["Hello", "Good morning", "Good night"]
  },
  "ordering": {
    "words": ["Ben", "kitap", "okuyorum"],
    "correct_order": [0, 2, 1]
  }
}
```

## Progress Tracking

### User Progress Table
Tracks individual lesson completion and performance.

```sql
user_progress (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    lesson_id UUID REFERENCES lessons(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, lesson_id)
)
```

### Exercise Attempts Table
Detailed tracking of exercise performance.

```sql
exercise_attempts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    exercise_id UUID REFERENCES exercises(id),
    user_answer JSONB,
    is_correct BOOLEAN NOT NULL,
    time_spent INTEGER DEFAULT 0,
    attempted_at TIMESTAMP WITH TIME ZONE
)
```

## Gamification System

### Achievements Table
Defines available achievements and their criteria.

```sql
achievements (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    xp_reward INTEGER DEFAULT 0,
    criteria JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE
)
```

### Achievement Criteria JSONB Schema
```json
{
  "type": "lessons|xp|streak|level|time",
  "target": 10,
  "additional_conditions": {
    "level": "A1",
    "lesson_type": "vocabulary",
    "timeframe": "daily|weekly|monthly"
  }
}
```

## Spaced Repetition System

### Review Items Table
Manages spaced repetition scheduling.

```sql
review_items (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    content_id UUID NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    difficulty DECIMAL(3,2) DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    next_review_date DATE NOT NULL,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
```

## Database Functions and Triggers

### Automatic Timestamp Updates
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### Streak Management
```sql
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
-- Automatically updates user streak based on daily activity
```

### Achievement System
```sql
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
-- Automatically checks and awards achievements when progress is made
```

## Performance Optimization

### Indexes
```sql
-- User-related indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_level ON users(level);

-- Content-related indexes
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_lessons_unit_id ON lessons(unit_id);
CREATE INDEX idx_exercises_lesson_id ON exercises(lesson_id);

-- Progress-related indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_completed ON user_progress(is_completed);
CREATE INDEX idx_review_items_next_review ON review_items(next_review_date);
```

### Views
```sql
-- User statistics view
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.xp,
    u.streak,
    u.level,
    COALESCE(progress_stats.lessons_completed, 0) as lessons_completed,
    COALESCE(progress_stats.total_time_spent, 0) as total_time_spent,
    COALESCE(achievement_stats.achievements_count, 0) as achievements_count
FROM users u
LEFT JOIN (...) progress_stats ON u.id = progress_stats.user_id
LEFT JOIN (...) achievement_stats ON u.id = achievement_stats.user_id;
```

## Data Relationships

### Entity Relationship Diagram
```
Users (1) ←→ (1) UserPreferences
Users (1) ←→ (M) UserProgress
Users (1) ←→ (M) UserAchievements
Users (1) ←→ (M) ReviewItems

Courses (1) ←→ (M) Units
Units (1) ←→ (M) Lessons
Lessons (1) ←→ (M) Exercises
Lessons (1) ←→ (M) VocabularyItems
Lessons (1) ←→ (M) GrammarRules

UserProgress (M) ←→ (1) Lessons
ExerciseAttempts (M) ←→ (1) Exercises
ExerciseAttempts (M) ←→ (1) Users
```

## Data Migration Strategy

### Version Control
- All schema changes tracked in migration files
- Rollback scripts for each migration
- Database version tracking table

### Migration Process
1. Create migration script
2. Test on development environment
3. Backup production database
4. Apply migration with rollback plan
5. Verify data integrity
6. Update application code if needed

## Backup and Recovery

### Backup Strategy
- Daily full database backups
- Hourly incremental backups
- Point-in-time recovery capability
- Cross-region backup replication

### Recovery Procedures
- Automated backup verification
- Recovery time objective: 1 hour
- Recovery point objective: 15 minutes
- Disaster recovery testing quarterly
