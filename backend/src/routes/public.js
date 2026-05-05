import { Router } from 'express';
import { publicController } from '../controllers/publicController.js';

const router = Router();

// All routes are public — no authentication
router.get('/info', publicController.getInfo);
router.get('/services', publicController.getServices);
router.get('/availability', publicController.getAvailability);
router.post('/book', publicController.book);

export default router;
