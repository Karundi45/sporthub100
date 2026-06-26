import express from 'express';
import { createGroup, getGroups, joinGroup } from '../controllers/groupController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').post(protect, createGroup).get(protect, getGroups);
router.route('/:id/join').post(protect, joinGroup);

export default router;
