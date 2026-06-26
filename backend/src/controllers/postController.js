"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePost = exports.getFeed = exports.createPost = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Post_1 = __importDefault(require("../models/Post"));
// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { content, photos, workout } = req.body;
        const post = await Post_1.default.create({
            user: req.user._id,
            content,
            photos: photos || [],
            workout: workout || null,
        });
        const populatedPost = await Post_1.default.findById(post._id).populate('user', 'username fullName profilePicture');
        res.status(201).json(populatedPost);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createPost = createPost;
// @desc    Get social feed
// @route   GET /api/posts/feed
// @access  Private
const getFeed = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        // In a real app, this would filter by user's following list.
        // For now, we'll fetch all public posts.
        const posts = await Post_1.default.find()
            .populate('user', 'username fullName profilePicture')
            .populate('workout', 'title distance duration activityType route')
            .populate('comments.user', 'username fullName profilePicture')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = await Post_1.default.countDocuments();
        res.json({
            posts,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getFeed = getFeed;
// @desc    Like or Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        const isLiked = post.likes.includes(req.user._id);
        if (isLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
        }
        else {
            post.likes.push(req.user._id);
        }
        await post.save();
        res.json(post.likes);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.likePost = likePost;
//# sourceMappingURL=postController.js.map