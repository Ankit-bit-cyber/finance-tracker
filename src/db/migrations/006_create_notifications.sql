-- 006_create_notifications.sql
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL,   -- 'budget_alert', 'budget_overrun', etc.
  title      VARCHAR(255) NOT NULL,
  message    TEXT,
  is_read    BOOLEAN DEFAULT FALSE,
  sent_email BOOLEAN DEFAULT FALSE,
  meta       JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON notifications(user_id, is_read);
