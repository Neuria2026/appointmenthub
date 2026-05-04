-- ============================================================
-- AppointmentHub - Initial Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('client', 'provider', 'admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE notification_channel AS ENUM ('whatsapp', 'telegram', 'email');
CREATE TYPE notification_type AS ENUM ('confirmation', 'reminder', 'reschedule', 'cancellation', 'feedback');
CREATE TYPE notification_status AS ENUM ('sent', 'failed', 'pending');

-- ============================================================
-- USERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email                   VARCHAR(255) NOT NULL UNIQUE,
    password_hash           VARCHAR(255) NOT NULL,
    full_name               VARCHAR(100) NOT NULL,
    phone                   VARCHAR(20),
    address                 VARCHAR(200),
    role                    user_role NOT NULL DEFAULT 'client',
    profile_picture_url     TEXT,
    google_calendar_tokens  JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- SERVICES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS services (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    duration_minutes    INTEGER NOT NULL CHECK (duration_minutes >= 15 AND duration_minutes <= 480),
    price               DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    description         TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_provider_id ON services(provider_id);

-- ============================================================
-- APPOINTMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS appointments (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id                 UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    client_id                   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    service_id                  UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    start_time                  TIMESTAMPTZ NOT NULL,
    end_time                    TIMESTAMPTZ NOT NULL,
    status                      appointment_status NOT NULL DEFAULT 'pending',
    notes                       TEXT,
    cancellation_reason         TEXT,
    google_calendar_event_id    VARCHAR(255),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_time_order CHECK (end_time > start_time)
);

CREATE INDEX idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id  UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    client_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_appointment_id ON reviews(appointment_id);
CREATE INDEX idx_reviews_client_id ON reviews(client_id);

-- ============================================================
-- MESSAGES TABLE (Chat)
-- ============================================================

CREATE TABLE IF NOT EXISTS messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id  UUID REFERENCES appointments(id) ON DELETE CASCADE,
    sender_id       UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL = AI assistant
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_appointment_id ON messages(appointment_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- ============================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    channels        JSONB NOT NULL DEFAULT '["email"]'::jsonb,
    reminder_times  JSONB NOT NULL DEFAULT '[60, 1440]'::jsonb,
    phone_whatsapp  VARCHAR(20),
    telegram_id     VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- ============================================================
-- NOTIFICATION LOG TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id  UUID REFERENCES appointments(id) ON DELETE CASCADE,
    channel         VARCHAR(20) NOT NULL,
    type            VARCHAR(50) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_log_user_id ON notification_log(user_id);
CREATE INDEX idx_notification_log_appointment_id ON notification_log(appointment_id);
CREATE INDEX idx_notification_log_sent_at ON notification_log(sent_at);

-- ============================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
