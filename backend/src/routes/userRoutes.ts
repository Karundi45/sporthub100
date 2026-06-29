import express from 'express';
import { getUserProfile, updateUserProfile, searchUsers, followUser, unfollowUser, updatePushToken, upgradeUser } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/search').get(protect, searchUsers);
router.route('/:id/follow').put(protect, followUser);
router.route('/:id/unfollow').put(protect, unfollowUser);
router.put('/push-token', protect, updatePushToken);
router.post('/upgrade', protect, upgradeUser);

export default router;
