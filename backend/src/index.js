import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import 'express-async-errors';

import { env } from './config/env.js';
import { testConnection } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { startNotificationScheduler } from './services/notificationScheduler.js';
import { telegramService } from './services/telegramService.js';

// Routes
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointments.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';
import chatRoutes from './routes/chat.js';
import reviewRoutes from './routes/reviews.js';
import staffRoutes from './routes/staff.js';
import publicRoutes from './routes/public.js';

const app = express();

// Trust Railway's proxy
app.set('trust proxy', 1);

// ============================================================
// Security middleware
// ============================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TooManyRequests',
    message: 'Demasiadas solicitudes. Intenta en 15 minutos.',
  },
});
app.use(limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'TooManyRequests',
    message: 'Demasiados intentos de autenticación.',
  },
});

// ============================================================
// Body parsing
// ============================================================
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging with Morgan
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400, // Only log errors in production
  }));
}

// ============================================================
// Health check
// ============================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: `${env.APP_NAME} API`,
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', reviewRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/public', publicRoutes);

// Calendar routes (inline, simple)
import { googleCalendarService } from './services/googleCalendarService.js';
import { authenticate } from './middleware/auth.js';

app.get('/api/calendar/auth-url', authenticate, (req, res, next) => {
  try {
    const url = googleCalendarService.getAuthUrl(req.user.id);
    res.json({ success: true, url });
  } catch (error) {
    next(error);
  }
});

app.get('/api/calendar/status', authenticate, async (req, res, next) => {
  try {
    const status = await googleCalendarService.getSyncStatus(req.user.id);
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/calendar/disconnect', authenticate, async (req, res, next) => {
  try {
    await googleCalendarService.disconnect(req.user.id);
    res.json({ success: true, message: 'Google Calendar desconectado' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/calendar/sync', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Sincronización iniciada' });
});

// Services route (global, without user prefix)
import { userController } from './controllers/userController.js';
import { validate, schemas } from './middleware/validation.js';

app.get('/api/services', authenticate, async (req, res, next) => {
  try {
    const { query: dbQuery } = await import('./config/database.js');
    const result = await dbQuery(
      `SELECT s.*,
         json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email) as provider,
         COALESCE(
           json_agg(
             json_build_object('id', st.id, 'name', st.name, 'specialty', st.specialty)
           ) FILTER (WHERE st.id IS NOT NULL),
           '[]'
         ) as staff
       FROM services s
       LEFT JOIN users u ON s.provider_id = u.id
       LEFT JOIN service_staff ss ON s.id = ss.service_id
       LEFT JOIN staff st ON ss.staff_id = st.id
       GROUP BY s.id, u.id
       ORDER BY s.created_at DESC`,
      []
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

app.post('/api/services', authenticate, validate(schemas.createService), userController.createService);
app.put('/api/services/:serviceId', authenticate, userController.updateService);
app.delete('/api/services/:serviceId', authenticate, userController.deleteService);

// ============================================================
// Error handling
// ============================================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// Start server
// ============================================================
const PORT = parseInt(env.PORT) || 5000;

async function start() {
  // Test database connection
  await testConnection();

  // Start notification scheduler
  startNotificationScheduler();

  // Start Telegram bot (if configured)
  if (env.TELEGRAM_BOT_TOKEN) {
    telegramService.setupBot();
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 AppointmentHub API running on http://localhost:${PORT}`);
    console.log(`📖 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
    console.log(`📚 Health check: http://localhost:${PORT}/health\n`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
