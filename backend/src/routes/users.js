import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

router.use(authenticate);

router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.get('/:id/appointments', userController.getUserAppointments);
router.get('/:id/services', userController.getServices);
router.post('/:id/services', validate(schemas.createService), userController.createService);
router.delete('/services/:serviceId', userController.deleteService);

export default router;
