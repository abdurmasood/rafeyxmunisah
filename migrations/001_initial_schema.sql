-- Migration: 001_initial_schema
-- Description: Initial database schema for heartbeat timer application
-- Date: 2024-08-13
-- Author: Claude Code Integration

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Heartbeat configuration table
CREATE TABLE heartbeat_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updates table
CREATE TABLE updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  emotion_type TEXT NOT NULL,
  timestamp TEXT NOT NULL, -- Display timestamp (HH:MM format)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_updates_created_at ON updates(created_at DESC);
CREATE INDEX idx_updates_user_id ON updates(user_id);
CREATE INDEX idx_updates_is_read ON updates(is_read);
CREATE INDEX idx_users_name ON users(name);

-- Comments for documentation
COMMENT ON TABLE users IS 'User profiles for the heartbeat timer application';
COMMENT ON TABLE heartbeat_config IS 'Configuration for the heartbeat timer start date';
COMMENT ON TABLE updates IS 'Emotion updates with user attribution';

COMMENT ON COLUMN updates.timestamp IS 'Display timestamp in HH:MM format for UI';
COMMENT ON COLUMN updates.emotion_type IS 'Type of emotion (happy, sad, love, etc.)';
COMMENT ON COLUMN updates.is_read IS 'Whether the update has been read by users';