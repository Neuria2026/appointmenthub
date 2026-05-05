import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function tableExists(name) {
  const result = await client.query(
    `SELECT COUNT(*) FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [name]
  );
  return parseInt(result.rows[0].count) > 0;
}

async function migrate() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Migration 001 - initial schema
    const usersExist = await tableExists('users');
    if (!usersExist) {
      console.log('🔄 Running migration 001 (initial schema)...');
      const sql = fs.readFileSync(path.join(migrationsDir, '001_initial_schema.sql'), 'utf8');
      await client.query(sql);
      console.log('✅ Migration 001 completed');
    } else {
      console.log('ℹ️  Migration 001 already applied');
    }

    // Migration 002 - logo + staff
    const staffExists = await tableExists('staff');
    if (!staffExists) {
      console.log('🔄 Running migration 002 (logo + staff)...');
      const sql = fs.readFileSync(path.join(migrationsDir, '002_logo_staff.sql'), 'utf8');
      await client.query(sql);
      console.log('✅ Migration 002 completed');
    } else {
      console.log('ℹ️  Migration 002 already applied');
    }

    // Migration 003 - staff_id on appointments
    const col = await client.query(
      `SELECT COUNT(*) FROM information_schema.columns
       WHERE table_name = 'appointments' AND column_name = 'staff_id'`
    );
    if (parseInt(col.rows[0].count) === 0) {
      console.log('🔄 Running migration 003 (appointments.staff_id)...');
      const sql = fs.readFileSync(path.join(migrationsDir, '003_appointments_staff.sql'), 'utf8');
      await client.query(sql);
      console.log('✅ Migration 003 completed');
    } else {
      console.log('ℹ️  Migration 003 already applied');
    }

    // Migration 004 - assigned_provider_id on users (clients)
    const col4 = await client.query(
      `SELECT COUNT(*) FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'assigned_provider_id'`
    );
    if (parseInt(col4.rows[0].count) === 0) {
      console.log('🔄 Running migration 004 (users.assigned_provider_id)...');
      const sql = fs.readFileSync(path.join(migrationsDir, '004_client_assigned_provider.sql'), 'utf8');
      await client.query(sql);
      console.log('✅ Migration 004 completed');
    } else {
      console.log('ℹ️  Migration 004 already applied');
    }

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
