-- Migration: Add settings columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_slug text UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS accent_color text DEFAULT 'green';
ALTER TABLE users ADD COLUMN IF NOT EXISTS sync_frequency text DEFAULT '1h';
ALTER TABLE users ADD COLUMN IF NOT EXISTS excluded_repos jsonb DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS hidden_sections jsonb DEFAULT '[]';

-- Add comments for clarity
COMMENT ON COLUMN users.hidden_sections IS 'Example: ["skills", "heatmap", "activity"]';
