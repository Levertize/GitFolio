-- Migration: Add rich About Me fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS what_i_do text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS fun_facts jsonb DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability text DEFAULT 'open';

-- Add comment for clarity
COMMENT ON COLUMN users.fun_facts IS 'Array of strings: ["Fact 1", "Fact 2"]';
COMMENT ON COLUMN users.availability IS 'Values: open | freelance | busy | hidden';
