import express from 'express';
import { getProfile, updateProfile, searchUsers, followUser, unfollowUser, updatePushToken } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.route('/search').get(protect, searchUsers);
router.route('/:id/follow').put(protect, followUser);
router.route('/:id/unfollow').put(protect, unfollowUser);
router.route('/push-token').put(protect, updatePushToken);

export default router;
