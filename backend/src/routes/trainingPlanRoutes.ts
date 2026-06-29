import express from 'express';
import { getPlans, enrollInPlan } from '../controllers/trainingPlanController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getPlans);
router.post('/:id/enroll', protect, enrollInPlan);

export default router;
