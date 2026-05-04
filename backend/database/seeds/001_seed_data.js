import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SALT_ROUNDS = 12;

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Seeding database...');

    // ---- Users ----
    const providerPassword = await bcrypt.hash('Provider123!', SALT_ROUNDS);
    const clientPassword = await bcrypt.hash('Client123!', SALT_ROUNDS);

    const provider1Id = uuidv4();
    const provider2Id = uuidv4();
    const client1Id = uuidv4();
    const client2Id = uuidv4();

    await client.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, address, role) VALUES
       ($1, 'dr.garcia@example.com', $5, 'Dr. Carlos García', '+52 55 1234 5678', 'Av. Insurgentes Sur 1234, CDMX', 'provider'),
       ($2, 'nutriologa@example.com', $5, 'Lic. María López', '+52 55 8765 4321', 'Col. Polanco, CDMX', 'provider'),
       ($3, 'juan.perez@example.com', $6, 'Juan Pérez', '+52 55 9999 0000', 'Col. Roma Norte, CDMX', 'client'),
       ($4, 'ana.martinez@example.com', $6, 'Ana Martínez', '+52 55 1111 2222', 'Col. Condesa, CDMX', 'client')
       ON CONFLICT (email) DO NOTHING`,
      [provider1Id, provider2Id, client1Id, client2Id, providerPassword, clientPassword]
    );

    console.log('✅ Users created');

    // ---- Services ----
    const service1Id = uuidv4();
    const service2Id = uuidv4();
    const service3Id = uuidv4();
    const service4Id = uuidv4();

    await client.query(
      `INSERT INTO services (id, provider_id, name, duration_minutes, price, description) VALUES
       ($1, $5, 'Consulta General', 30, 500, 'Consulta médica general. Diagnóstico y tratamiento de enfermedades comunes.'),
       ($2, $5, 'Consulta Especializada', 60, 1200, 'Consulta con especialista. Requiere referencia médica.'),
       ($3, $6, 'Consulta Nutricional Inicial', 60, 800, 'Evaluación nutricional completa con plan alimenticio personalizado.'),
       ($4, $6, 'Seguimiento Nutricional', 30, 400, 'Seguimiento de plan nutricional y ajustes según progreso.')
       ON CONFLICT DO NOTHING`,
      [service1Id, service2Id, service3Id, service4Id, provider1Id, provider2Id]
    );

    console.log('✅ Services created');

    // ---- Appointments ----
    const now = new Date();
    const apt1Id = uuidv4();
    const apt2Id = uuidv4();
    const apt3Id = uuidv4();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(9, 0, 0, 0);

    await client.query(
      `INSERT INTO appointments (id, provider_id, client_id, service_id, start_time, end_time, status, notes) VALUES
       ($1, $4, $5, $7, $9, $10, 'confirmed', 'Primera consulta del paciente'),
       ($2, $4, $6, $8, $11, $12, 'pending', 'Consulta de seguimiento'),
       ($3, $4, $5, $7, $13, $14, 'completed', NULL)
       ON CONFLICT DO NOTHING`,
      [
        apt1Id, apt2Id, apt3Id,
        provider1Id, client1Id, client2Id,
        service1Id, service2Id,
        tomorrow.toISOString(),
        new Date(tomorrow.getTime() + 30 * 60000).toISOString(),
        nextWeek.toISOString(),
        new Date(nextWeek.getTime() + 60 * 60000).toISOString(),
        yesterday.toISOString(),
        new Date(yesterday.getTime() + 30 * 60000).toISOString(),
      ]
    );

    console.log('✅ Appointments created');

    // ---- Notification Preferences ----
    await client.query(
      `INSERT INTO notification_preferences (id, user_id, channels, reminder_times)
       VALUES ($1, $3, '["email", "whatsapp"]', '[15, 60, 1440]'),
              ($2, $4, '["email"]', '[60, 1440]')
       ON CONFLICT (user_id) DO NOTHING`,
      [uuidv4(), uuidv4(), client1Id, client2Id]
    );

    console.log('✅ Notification preferences created');

    // ---- Review ----
    const reviewId = uuidv4();
    await client.query(
      `INSERT INTO reviews (id, appointment_id, client_id, rating, comment)
       VALUES ($1, $2, $3, 5, '¡Excelente atención! Muy profesional y puntual. Lo recomiendo ampliamente.')
       ON CONFLICT DO NOTHING`,
      [reviewId, apt3Id, client1Id]
    );

    console.log('✅ Reviews created');

    await client.query('COMMIT');
    console.log('\n✅ Seed completed successfully!');
    console.log('\nTest accounts:');
    console.log('  Provider: dr.garcia@example.com / Provider123!');
    console.log('  Client:   juan.perez@example.com / Client123!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
