-- ============================================================
-- Migration 002: Business logo + staff management
-- ============================================================

-- Add business logo to users (providers)
ALTER TABLE users ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- ============================================================
-- STAFF TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS staff (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    specialty       VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_provider_id ON staff(provider_id);

-- ============================================================
-- SERVICE-STAFF JUNCTION TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS service_staff (
    service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    staff_id    UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, staff_id)
);

-- Trigger for staff.updated_at
CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
