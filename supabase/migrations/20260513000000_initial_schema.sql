-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TABLE: users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id bigint UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  name text,
  avatar_url text,
  bio text,
  email text,
  wakatime_token text,
  location text,
  website text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TABLE: github_stats
CREATE TABLE IF NOT EXISTS github_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  total_commits int DEFAULT 0,
  total_stars int DEFAULT 0,
  total_repos int DEFAULT 0,
  followers int DEFAULT 0,
  languages jsonb DEFAULT '{}',
  contribution_data jsonb DEFAULT '[]',
  top_repos jsonb DEFAULT '[]',
  synced_at timestamptz DEFAULT now()
);

-- TABLE: dev_notes
CREATE TABLE IF NOT EXISTS dev_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  content text,
  linked_commits jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TRIGGERS
CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_dev_notes
BEFORE UPDATE ON dev_notes
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_github_stats_user_id ON github_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_dev_notes_user_id_date ON dev_notes(user_id, date);

-- ENABLE RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_notes ENABLE ROW LEVEL SECURITY;

-- POLICIES: users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON users
  FOR SELECT USING (is_public = true);

-- POLICIES: github_stats
CREATE POLICY "Users can read own stats" ON github_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON github_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public stats are viewable by everyone" ON github_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = github_stats.user_id AND users.is_public = true
    )
  );

-- POLICIES: dev_notes
CREATE POLICY "Users can manage own notes" ON dev_notes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public notes are viewable by everyone" ON dev_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = dev_notes.user_id AND users.is_public = true
    )
  );
