import express from 'express';
import { createWorkout, getMyWorkouts } from '../controllers/workoutController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').post(protect, createWorkout).get(protect, getMyWorkouts);

export default router;
