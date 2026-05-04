import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(schemas.sendMessage), chatController.sendMessage);
router.get('/:appointmentId', chatController.getChatHistory);

export default router;
