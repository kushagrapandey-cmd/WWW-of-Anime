CREATE TABLE IF NOT EXISTS app_users (
 id uuid PRIMARY KEY, username text NOT NULL, normalized_name text UNIQUE NOT NULL,
 password_hash text NOT NULL, profile jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS app_sessions (
 token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS session_expiry ON app_sessions(expires_at);
CREATE TABLE IF NOT EXISTS app_limits (
 key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS app_matches (
 id uuid PRIMARY KEY, host_id uuid NOT NULL REFERENCES app_users(id), guest_id uuid REFERENCES app_users(id),
 invite_hash text UNIQUE, expires_at timestamptz NOT NULL, state jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS matches_host ON app_matches(host_id, created_at DESC);
CREATE INDEX IF NOT EXISTS matches_guest ON app_matches(guest_id, created_at DESC);
CREATE TABLE IF NOT EXISTS app_activities (
 id text NOT NULL, user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK (kind IN ('quiz','mini')), daily_date text, state jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,id)
);
CREATE UNIQUE INDEX IF NOT EXISTS one_daily_attempt ON app_activities(user_id,daily_date) WHERE daily_date IS NOT NULL;
