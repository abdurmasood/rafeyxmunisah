-- Migration: 002_rls_policies
-- Description: Row Level Security (RLS) policies for data access control
-- Date: 2024-08-13
-- Author: Claude Code Integration

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE heartbeat_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Allow read access for all users (since this is a shared heartbeat timer)
CREATE POLICY "Allow read access for users" ON users 
  FOR SELECT USING (true);

-- Allow insert for users (for user registration)
CREATE POLICY "Allow insert for users" ON users 
  FOR INSERT WITH CHECK (true);

-- Allow update for users (for profile updates)
CREATE POLICY "Allow update for users" ON users 
  FOR UPDATE USING (true);

-- RLS Policies for heartbeat_config table
-- Allow read access for heartbeat configuration
CREATE POLICY "Allow read access for heartbeat_config" ON heartbeat_config 
  FOR SELECT USING (true);

-- Allow insert/update for heartbeat configuration
CREATE POLICY "Allow insert for heartbeat_config" ON heartbeat_config 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for heartbeat_config" ON heartbeat_config 
  FOR UPDATE USING (true);

-- RLS Policies for updates table
-- Allow read access for all updates (shared heartbeat)
CREATE POLICY "Allow read access for updates" ON updates 
  FOR SELECT USING (true);

-- Allow insert for updates
CREATE POLICY "Allow insert for updates" ON updates 
  FOR INSERT WITH CHECK (true);

-- Allow update for updates (for marking as read, etc.)
CREATE POLICY "Allow update for updates" ON updates 
  FOR UPDATE USING (true);

-- Optional: Allow delete for updates (if needed for cleanup)
CREATE POLICY "Allow delete for updates" ON updates 
  FOR DELETE USING (true);

-- Comments for documentation
COMMENT ON POLICY "Allow read access for users" ON users IS 'Allows all users to read user profiles';
COMMENT ON POLICY "Allow read access for updates" ON updates IS 'Allows all users to read emotion updates';
COMMENT ON POLICY "Allow read access for heartbeat_config" ON heartbeat_config IS 'Allows all users to read heartbeat configuration';