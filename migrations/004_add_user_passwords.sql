-- Migration: 004_add_user_passwords
-- Description: Add password authentication to users table
-- Date: 2024-08-13
-- Author: Claude Code Integration

-- Add password_hash column to users table (nullable initially)
-- Only add if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT;
    END IF;
END $$;

-- Add index on name for login lookups
CREATE INDEX IF NOT EXISTS idx_users_name_login ON users(name);

-- Comments for documentation
COMMENT ON COLUMN users.password_hash IS 'Hashed password for user authentication (bcrypt/scrypt)';
COMMENT ON INDEX idx_users_name_login IS 'Index for efficient user login lookups by name';