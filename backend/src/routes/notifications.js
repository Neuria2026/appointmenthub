import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

router.use(authenticate);

router.get('/preferences', notificationController.getPreferences);
router.put(
  '/preferences',
  validate(schemas.updateNotificationPreferences),
  notificationController.updatePreferences
);
router.get('/history', notificationController.getHistory);

export default router;
