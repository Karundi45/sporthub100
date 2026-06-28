import express from 'express';
import { getChallenges, joinChallenge, createChallenge, getLeaderboard } from '../controllers/challengeController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getChallenges).post(protect, createChallenge);
router.route('/leaderboard').get(protect, getLeaderboard);
router.route('/:id/join').post(protect, joinChallenge);

export default router;
