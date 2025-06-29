-- Seed data for Turkish Learning App
-- Initial data for development and testing

-- Insert sample achievements
INSERT INTO achievements (id, title, description, icon, xp_reward, criteria) VALUES
(uuid_generate_v4(), 'First Steps', 'Complete your first lesson', '🎯', 10, '{"type": "lessons", "target": 1}'),
(uuid_generate_v4(), 'Getting Started', 'Complete 5 lessons', '🚀', 25, '{"type": "lessons", "target": 5}'),
(uuid_generate_v4(), 'Dedicated Learner', 'Complete 25 lessons', '📚', 100, '{"type": "lessons", "target": 25}'),
(uuid_generate_v4(), 'Scholar', 'Complete 100 lessons', '🎓', 500, '{"type": "lessons", "target": 100}'),
(uuid_generate_v4(), 'Streak Starter', 'Maintain a 3-day streak', '🔥', 15, '{"type": "streak", "target": 3}'),
(uuid_generate_v4(), 'Consistent Learner', 'Maintain a 7-day streak', '⚡', 50, '{"type": "streak", "target": 7}'),
(uuid_generate_v4(), 'Unstoppable', 'Maintain a 30-day streak', '💪', 200, '{"type": "streak", "target": 30}'),
(uuid_generate_v4(), 'XP Hunter', 'Earn 1000 XP', '💎', 50, '{"type": "xp", "target": 1000}'),
(uuid_generate_v4(), 'Level Up', 'Reach A2 level', '⬆️', 100, '{"type": "level", "target": "A2"}'),
(uuid_generate_v4(), 'Intermediate', 'Reach B1 level', '🌟', 200, '{"type": "level", "target": "B1"}'),
(uuid_generate_v4(), 'Advanced', 'Reach B2 level', '🏆', 300, '{"type": "level", "target": "B2"}'),
(uuid_generate_v4(), 'Expert', 'Reach C1 level', '👑', 500, '{"type": "level", "target": "C1"}'),
(uuid_generate_v4(), 'Master', 'Reach C2 level', '🎖️', 1000, '{"type": "level", "target": "C2"}');

-- Insert sample courses
INSERT INTO courses (id, title, description, level, total_lessons, estimated_hours, is_published, order_index) VALUES
(uuid_generate_v4(), 'Turkish Basics - A1', 'Start your Turkish journey with fundamental vocabulary and basic grammar', 'A1', 20, 15, true, 1),
(uuid_generate_v4(), 'Elementary Turkish - A2', 'Build on your basics with more complex sentences and everyday conversations', 'A2', 25, 20, true, 2),
(uuid_generate_v4(), 'Intermediate Turkish - B1', 'Develop fluency with advanced grammar and cultural insights', 'B1', 30, 25, true, 3),
(uuid_generate_v4(), 'Upper Intermediate - B2', 'Master complex Turkish structures and idiomatic expressions', 'B2', 35, 30, true, 4),
(uuid_generate_v4(), 'Advanced Turkish - C1', 'Achieve near-native proficiency with sophisticated language use', 'C1', 40, 35, false, 5),
(uuid_generate_v4(), 'Mastery Level - C2', 'Perfect your Turkish with literary texts and professional communication', 'C2', 45, 40, false, 6);

-- Get course IDs for units (using the first course for sample data)
DO $$
DECLARE
    course_a1_id UUID;
    course_a2_id UUID;
    unit1_id UUID;
    unit2_id UUID;
    lesson1_id UUID;
    lesson2_id UUID;
BEGIN
    -- Get A1 course ID
    SELECT id INTO course_a1_id FROM courses WHERE level = 'A1' LIMIT 1;
    SELECT id INTO course_a2_id FROM courses WHERE level = 'A2' LIMIT 1;
    
    -- Insert sample units for A1 course
    INSERT INTO units (id, course_id, title, description, order_index) VALUES
    (uuid_generate_v4(), course_a1_id, 'Greetings and Introductions', 'Learn basic greetings and how to introduce yourself', 1),
    (uuid_generate_v4(), course_a1_id, 'Numbers and Time', 'Master numbers, dates, and telling time in Turkish', 2),
    (uuid_generate_v4(), course_a1_id, 'Family and Relationships', 'Vocabulary for family members and describing relationships', 3),
    (uuid_generate_v4(), course_a1_id, 'Food and Drinks', 'Essential vocabulary for dining and Turkish cuisine', 4);
    
    -- Get first unit ID for lessons
    SELECT id INTO unit1_id FROM units WHERE course_id = course_a1_id ORDER BY order_index LIMIT 1;
    
    -- Insert sample lessons
    INSERT INTO lessons (id, unit_id, title, description, type, content, order_index, xp_reward, estimated_minutes) VALUES
    (uuid_generate_v4(), unit1_id, 'Basic Greetings', 'Learn essential Turkish greetings', 'vocabulary', 
     '{"text": "In this lesson, you will learn the most common Turkish greetings used in daily life.", "vocabulary": [{"turkish": "Merhaba", "english": "Hello", "pronunciation": "mer-ha-BA"}, {"turkish": "Günaydın", "english": "Good morning", "pronunciation": "gün-ay-DIN"}]}', 
     1, 15, 10),
    (uuid_generate_v4(), unit1_id, 'Introducing Yourself', 'Learn how to introduce yourself in Turkish', 'speaking', 
     '{"text": "Practice introducing yourself with name, age, and nationality.", "examples": [{"turkish": "Benim adım Ali.", "english": "My name is Ali."}, {"turkish": "Ben Türküm.", "english": "I am Turkish."}]}', 
     2, 20, 15);
    
    -- Get lesson IDs for exercises
    SELECT id INTO lesson1_id FROM lessons WHERE unit_id = unit1_id ORDER BY order_index LIMIT 1;
    SELECT id INTO lesson2_id FROM lessons WHERE unit_id = unit1_id ORDER BY order_index OFFSET 1 LIMIT 1;
    
    -- Insert sample vocabulary items
    INSERT INTO vocabulary_items (lesson_id, turkish, english, pronunciation, example_sentence) VALUES
    (lesson1_id, 'Merhaba', 'Hello', 'mer-ha-BA', 'Merhaba, nasılsın?'),
    (lesson1_id, 'Günaydın', 'Good morning', 'gün-ay-DIN', 'Günaydın! Bugün hava çok güzel.'),
    (lesson1_id, 'İyi akşamlar', 'Good evening', 'i-yi ak-şam-LAR', 'İyi akşamlar, aile!'),
    (lesson1_id, 'Hoşça kal', 'Goodbye', 'hoş-ça KAL', 'Hoşça kal, yarın görüşürüz.'),
    (lesson2_id, 'Benim adım', 'My name is', 'be-nim a-DIM', 'Benim adım Ayşe.'),
    (lesson2_id, 'Ben', 'I am', 'BEN', 'Ben öğrenciyim.'),
    (lesson2_id, 'Türküm', 'I am Turkish', 'tür-KÜM', 'Ben Türküm ve İstanbul''da yaşıyorum.');
    
    -- Insert sample exercises
    INSERT INTO exercises (lesson_id, type, question, options, correct_answer, explanation, order_index, xp_reward) VALUES
    (lesson1_id, 'multiple_choice', 'How do you say "Hello" in Turkish?', 
     '["Merhaba", "Günaydın", "İyi akşamlar", "Hoşça kal"]', 
     '"Merhaba"', 'Merhaba is the most common way to say hello in Turkish.', 1, 5),
    (lesson1_id, 'multiple_choice', 'What does "Günaydın" mean?', 
     '["Good evening", "Good morning", "Goodbye", "Hello"]', 
     '"Good morning"', 'Günaydın is used to greet someone in the morning.', 2, 5),
    (lesson2_id, 'fill_blank', 'Complete: "_____ adım Mehmet."', 
     '[]', '"Benim"', 'Use "Benim" to say "My" when introducing your name.', 1, 5),
    (lesson2_id, 'translation', 'Translate: "I am Turkish"', 
     '[]', '"Ben Türküm"', 'Remember that "Ben" means "I" and "Türküm" means "I am Turkish".', 2, 5);
    
END $$;
