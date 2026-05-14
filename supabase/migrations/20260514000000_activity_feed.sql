-- Migration: Add recent_activity column to github_stats
ALTER TABLE github_stats ADD COLUMN IF NOT EXISTS recent_activity jsonb DEFAULT '[]';

-- Add comment
COMMENT ON COLUMN github_stats.recent_activity IS 'Stores the latest GitHub events and commits';
