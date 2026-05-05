-- ============================================================
-- Migration 004: Anchor each client to a single provider
-- ============================================================

-- Add assigned_provider_id to users (only used for role='client')
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS assigned_provider_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_assigned_provider_id ON users(assigned_provider_id);

-- Backfill: for each existing client, set assigned_provider_id from
-- their most recent appointment's provider.
UPDATE users u
SET assigned_provider_id = sub.provider_id
FROM (
    SELECT DISTINCT ON (client_id) client_id, provider_id
    FROM appointments
    ORDER BY client_id, created_at DESC
) sub
WHERE u.id = sub.client_id
  AND u.role = 'client'
  AND u.assigned_provider_id IS NULL;
