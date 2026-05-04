import { Router } from 'express';
import { reviewController } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = Router();

router.use(authenticate);

router.post('/appointments/:appointmentId/reviews', validate(schemas.createReview), reviewController.createReview);
router.get('/appointments/:appointmentId/reviews', reviewController.getAppointmentReview);
router.get('/users/:userId/reviews', reviewController.getUserReviews);

export default router;
