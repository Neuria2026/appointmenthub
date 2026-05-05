import { Router } from 'express';
import { staffController } from '../controllers/staffController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', staffController.getStaff);
router.post('/', staffController.createStaff);
router.put('/:staffId', staffController.updateStaff);
router.delete('/:staffId', staffController.deleteStaff);

router.get('/services/:serviceId', staffController.getServiceStaff);
router.put('/services/:serviceId', staffController.setServiceStaff);

export default router;
