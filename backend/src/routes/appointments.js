import { Router } from 'express';
import { appointmentController } from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', appointmentController.getAppointments);
router.get('/availability', appointmentController.getAvailability);
router.get('/:id', appointmentController.getAppointment);
router.post('/', validate(schemas.createAppointment), appointmentController.createAppointment);
router.put('/:id', validate(schemas.updateAppointment), appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);
router.post('/:id/complete', appointmentController.completeAppointment);

export default router;
