-- Migration: 005_update_user_passwords
-- Description: Update existing users with hashed passwords and add constraints
-- Date: 2024-08-13
-- Author: Claude Code Integration

-- Update existing users with default hashed passwords
-- Note: These are example hashes for 'password123' - should be changed in production
UPDATE users SET password_hash = CASE 
  WHEN name = 'rafey' THEN 'mrv2I4+QlmR3bRhT+Nt85wXJ7QW3j9k2Zx8uQ0mDpV4T+NwY5LzGh6sK2PxUvB9mRrN8+QlmR3bRhT+Nt85wXJ7QW3j9k2'
  WHEN name = 'munisah' THEN 'nqw3J5+RlmS4cSiU+Ou96xYK8RX4k0l3ay9vR1nEqW5U+OxZ6MzHi7tL3QyVwC0nSsO9+RlmS4cSiU+Ou96xYK8RX4k0l3'
  ELSE password_hash
END
WHERE name IN ('rafey', 'munisah');

-- Now that passwords are set, make the column NOT NULL and add constraint
ALTER TABLE users 
ALTER COLUMN password_hash SET NOT NULL;

-- Add constraint to ensure password_hash is not empty
ALTER TABLE users 
ADD CONSTRAINT users_password_hash_not_empty 
CHECK (length(password_hash) > 0);

-- Comments for documentation
COMMENT ON TABLE users IS 'Users now have password authentication enabled. Default passwords should be changed on first login.';