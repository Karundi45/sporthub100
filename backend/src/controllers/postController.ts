import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Post from '../models/Post';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, photos, workout } = req.body;

    const post = await Post.create({
      user: req.user._id,
      content,
      photos: photos || [],
      workout: workout || null,
    });

    const populatedPost = await Post.findById(post._id).populate('user', 'username fullName profilePicture');
    
    res.status(201).json(populatedPost);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get social feed
// @route   GET /api/posts/feed
// @access  Private
export const getFeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // In a real app, this would filter by user's following list.
    // For now, we'll fetch all public posts.
    const posts = await Post.find()
      .populate('user', 'username fullName profilePicture')
      .populate('workout', 'title distance duration activityType route')
      .populate('comments.user', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Post.countDocuments();

    res.json({
      posts,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json(post.likes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
