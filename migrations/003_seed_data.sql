-- Migration: 003_seed_data
-- Description: Initial seed data for heartbeat timer application
-- Date: 2024-08-13
-- Author: Claude Code Integration

-- Insert default heartbeat configuration
-- Set start date to 2nd day of previous month from current date
INSERT INTO heartbeat_config (start_date) VALUES (
  DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') + INTERVAL '1 day'
) ON CONFLICT DO NOTHING;

-- Insert default users (Rafey and Munisah)
INSERT INTO users (name, display_name) VALUES 
  ('rafey', 'Rafey'),
  ('munisah', 'Munisah')
ON CONFLICT DO NOTHING;

-- Add some example updates (optional - can be commented out)
-- These provide initial data for testing the application
WITH user_ids AS (
  SELECT id, name FROM users WHERE name IN ('rafey', 'munisah')
)
INSERT INTO updates (user_id, content, emotion_type, timestamp, is_read) 
SELECT 
  u.id,
  CASE u.name 
    WHEN 'rafey' THEN 'Feeling excited about our journey together! 🚀'
    WHEN 'munisah' THEN 'Heart overflowing with love ❤️'
  END,
  CASE u.name 
    WHEN 'rafey' THEN 'excited'
    WHEN 'munisah' THEN 'love'
  END,
  TO_CHAR(NOW() - INTERVAL '1 hour', 'HH24:MI'),
  false
FROM user_ids u
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE heartbeat_config IS 'Contains the heartbeat timer configuration with automatic start date calculation';
COMMENT ON TABLE users IS 'Pre-populated with Rafey and Munisah user profiles';
COMMENT ON TABLE updates IS 'May contain example updates for initial application state';