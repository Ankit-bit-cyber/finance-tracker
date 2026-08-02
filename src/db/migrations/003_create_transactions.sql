-- 003_create_transactions.sql
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  type            VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount          NUMERIC(15, 2) NOT NULL,
  currency        VARCHAR(10) NOT NULL DEFAULT 'USD',
  amount_in_base  NUMERIC(15, 2),            -- converted to user's base currency
  exchange_rate   NUMERIC(15, 6) DEFAULT 1,
  description     TEXT,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  is_refund       BOOLEAN DEFAULT FALSE,
  receipt_url     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_amount_not_zero CHECK (amount != 0)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id    ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date       ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category   ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type       ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date  ON transactions(user_id, date DESC);
