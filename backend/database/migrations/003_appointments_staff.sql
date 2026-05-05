-- Migration 003: Link appointments to specific staff member
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON appointments(staff_id);
