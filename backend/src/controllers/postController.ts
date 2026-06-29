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
      ...(workout ? { workout } : {}),
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
    
    // Fetch posts from users the current user is following, AND the current user's own posts
    const following = req.user.following || [];
    const targetUsers = [...following, req.user._id];

    const posts = await Post.find({ user: { $in: targetUsers } })
      .populate('user', 'username fullName profilePicture')
      .populate('workout', 'title distance duration activityType route')
      .populate('comments.user', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Post.countDocuments({ user: { $in: targetUsers } });

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

    const isLiked = post.likes.some((id: any) => id.toString() === req.user._id.toString());

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

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
// @access  Private
export const commentPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const comment = {
      user: req.user._id,
      text,
      createdAt: new Date(),
    };

    post.comments.push(comment as any);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username fullName profilePicture')
      .populate('workout', 'title distance duration activityType route')
      .populate('comments.user', 'username fullName profilePicture');

    res.status(201).json(populatedPost?.comments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
