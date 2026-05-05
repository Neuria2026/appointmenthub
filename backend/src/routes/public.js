import { Router } from 'express';
import { publicController } from '../controllers/publicController.js';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Open routes (no auth required)
router.get('/info', publicController.getInfo);
router.get('/services', publicController.getServices);
router.get('/availability', publicController.getAvailability);

// Booking accepts an optional client JWT to anchor the appointment to that client
router.post('/book', optionalAuth, publicController.book);

// Client-only routes (require auth + role=client)
router.get('/my-provider', authenticate, requireRole('client'), publicController.getMyProvider);
router.get('/my-appointments', authenticate, requireRole('client'), publicController.getMyAppointments);
router.post('/set-password', authenticate, requireRole('client'), publicController.setPassword);

export default router;
