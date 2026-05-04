import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, '..', 'database', 'migrations', '001_initial_schema.sql');

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sql);

    console.log('✅ Migration completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
