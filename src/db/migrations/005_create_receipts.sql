-- 005_create_receipts.sql
CREATE TABLE IF NOT EXISTS receipts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  filename       VARCHAR(255) NOT NULL,
  original_name  VARCHAR(255),
  mime_type      VARCHAR(100),
  size_bytes     INTEGER,
  url            TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_transaction_id ON receipts(transaction_id);
