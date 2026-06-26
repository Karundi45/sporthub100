import express from 'express';
import { getUserAnalytics } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getUserAnalytics);

export default router;
