-- Fix exercise type column
-- Add back the type column that was dropped in the previous migration

ALTER TABLE exercises 
ADD COLUMN type VARCHAR(100) NOT NULL DEFAULT 'multiple_choice';

-- Update the type column with appropriate values based on content or other criteria
UPDATE exercises SET type = 'multiple_choice' WHERE type = 'multiple_choice';

-- Create index for better performance
CREATE INDEX idx_exercises_type ON exercises(type);
