import express from 'express';
import { createPost, getFeed, likePost, commentPost } from '../controllers/postController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').post(protect, createPost);
router.route('/feed').get(protect, getFeed);
router.route('/:id/like').put(protect, likePost);
router.route('/:id/comment').post(protect, commentPost);

export default router;
