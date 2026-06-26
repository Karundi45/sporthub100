import express from 'express';
import { getChallenges, joinChallenge } from '../controllers/challengeController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getChallenges);
router.route('/:id/join').post(protect, joinChallenge);

export default router;
