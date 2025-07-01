-- Database functions and triggers for Turkish Learning App

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_items_updated_at BEFORE UPDATE ON review_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user level from XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(xp_amount / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate XP needed for next level
CREATE OR REPLACE FUNCTION calculate_xp_for_level(level_number INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN POWER(level_number - 1, 2) * 100;
END;
$$ LANGUAGE plpgsql;

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_activity DATE;
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Get user's last activity date
    SELECT last_activity_date INTO last_activity FROM users WHERE id = NEW.user_id;
    
    -- Update streak logic
    IF last_activity IS NULL THEN
        -- First activity
        UPDATE users SET 
            streak = 1,
            last_activity_date = current_date
        WHERE id = NEW.user_id;
    ELSIF last_activity = current_date THEN
        -- Same day, no change to streak
        RETURN NEW;
    ELSIF last_activity = current_date - INTERVAL '1 day' THEN
        -- Consecutive day, increment streak
        UPDATE users SET 
            streak = streak + 1,
            last_activity_date = current_date
        WHERE id = NEW.user_id;
    ELSE
        -- Streak broken, reset to 1
        UPDATE users SET 
            streak = 1,
            last_activity_date = current_date
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update streak when user completes a lesson (INSERT)
CREATE TRIGGER update_streak_on_lesson_complete_insert
    AFTER INSERT ON user_progress
    FOR EACH ROW
    WHEN (NEW.is_completed = true)
    EXECUTE FUNCTION update_user_streak();

-- Trigger to update streak when user completes a lesson (UPDATE)
CREATE TRIGGER update_streak_on_lesson_complete_update
    AFTER UPDATE ON user_progress
    FOR EACH ROW
    WHEN (NEW.is_completed = true AND OLD.is_completed = false)
    EXECUTE FUNCTION update_user_streak();

-- Function to update course lesson count
CREATE OR REPLACE FUNCTION update_course_lesson_count()
RETURNS TRIGGER AS $$
DECLARE
    course_uuid UUID;
    lesson_count INTEGER;
BEGIN
    -- Get course ID from unit
    IF TG_OP = 'DELETE' THEN
        SELECT course_id INTO course_uuid FROM units WHERE id = OLD.unit_id;
    ELSE
        SELECT course_id INTO course_uuid FROM units WHERE id = NEW.unit_id;
    END IF;
    
    -- Count total lessons in course
    SELECT COUNT(*) INTO lesson_count
    FROM lessons l
    JOIN units u ON l.unit_id = u.id
    WHERE u.course_id = course_uuid;
    
    -- Update course
    UPDATE courses SET total_lessons = lesson_count WHERE id = course_uuid;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update course lesson count
CREATE TRIGGER update_course_lesson_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_course_lesson_count();

-- Function to create user preferences when user is created
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user preferences
CREATE TRIGGER create_user_preferences_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_preferences();

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
    achievement_record RECORD;
    user_lessons_count INTEGER;
    user_xp INTEGER;
    user_streak INTEGER;
    user_level cefr_level;
BEGIN
    -- Get user stats
    SELECT 
        (SELECT COUNT(*) FROM user_progress WHERE user_id = NEW.user_id AND is_completed = true),
        xp,
        streak,
        level
    INTO user_lessons_count, user_xp, user_streak, user_level
    FROM users WHERE id = NEW.user_id;
    
    -- Check all achievements
    FOR achievement_record IN 
        SELECT a.* FROM achievements a 
        WHERE a.id NOT IN (
            SELECT achievement_id FROM user_achievements WHERE user_id = NEW.user_id
        )
    LOOP
        -- Check lesson-based achievements
        IF (achievement_record.criteria->>'type' = 'lessons' AND 
            user_lessons_count >= (achievement_record.criteria->>'target')::INTEGER) THEN
            INSERT INTO user_achievements (user_id, achievement_id) 
            VALUES (NEW.user_id, achievement_record.id);
            
            -- Award XP
            UPDATE users SET xp = xp + achievement_record.xp_reward 
            WHERE id = NEW.user_id;
        END IF;
        
        -- Check XP-based achievements
        IF (achievement_record.criteria->>'type' = 'xp' AND 
            user_xp >= (achievement_record.criteria->>'target')::INTEGER) THEN
            INSERT INTO user_achievements (user_id, achievement_id) 
            VALUES (NEW.user_id, achievement_record.id);
        END IF;
        
        -- Check streak-based achievements
        IF (achievement_record.criteria->>'type' = 'streak' AND 
            user_streak >= (achievement_record.criteria->>'target')::INTEGER) THEN
            INSERT INTO user_achievements (user_id, achievement_id) 
            VALUES (NEW.user_id, achievement_record.id);
            
            -- Award XP
            UPDATE users SET xp = xp + achievement_record.xp_reward 
            WHERE id = NEW.user_id;
        END IF;
        
        -- Check level-based achievements
        IF (achievement_record.criteria->>'type' = 'level' AND 
            user_level::TEXT = achievement_record.criteria->>'target') THEN
            INSERT INTO user_achievements (user_id, achievement_id) 
            VALUES (NEW.user_id, achievement_record.id);
            
            -- Award XP
            UPDATE users SET xp = xp + achievement_record.xp_reward 
            WHERE id = NEW.user_id;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check achievements when progress is updated
CREATE TRIGGER check_achievements_trigger
    AFTER INSERT OR UPDATE ON user_progress
    FOR EACH ROW
    WHEN (NEW.is_completed = true)
    EXECUTE FUNCTION check_achievements();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.xp,
    u.streak,
    u.level,
    COALESCE(progress_stats.lessons_completed, 0) as lessons_completed,
    COALESCE(progress_stats.total_time_spent, 0) as total_time_spent,
    COALESCE(achievement_stats.achievements_count, 0) as achievements_count,
    calculate_level_from_xp(u.xp) as calculated_level
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as lessons_completed,
        SUM(time_spent) as total_time_spent
    FROM user_progress 
    WHERE is_completed = true 
    GROUP BY user_id
) progress_stats ON u.id = progress_stats.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as achievements_count
    FROM user_achievements 
    GROUP BY user_id
) achievement_stats ON u.id = achievement_stats.user_id;
