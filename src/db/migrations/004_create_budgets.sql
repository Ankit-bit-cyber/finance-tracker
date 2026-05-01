-- 004_create_budgets.sql
CREATE TABLE IF NOT EXISTS budgets (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount       NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  currency     VARCHAR(10) NOT NULL DEFAULT 'USD',
  period       VARCHAR(10) NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly','weekly','yearly')),
  month        SMALLINT CHECK (month BETWEEN 1 AND 12),
  year         SMALLINT,
  alert_at_pct SMALLINT DEFAULT 80 CHECK (alert_at_pct BETWEEN 1 AND 100),
  alerted      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, category_id, period, month, year)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);