-- 002_create_categories.sql
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  type       VARCHAR(10)  NOT NULL CHECK (type IN ('income', 'expense')),
  icon       VARCHAR(10)  DEFAULT '📦',
  is_default BOOLEAN      DEFAULT FALSE,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- user_id NULL = system default category (visible to all)
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type    ON categories(type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_user_name_type
  ON categories(user_id, name, type) WHERE user_id IS NOT NULL;