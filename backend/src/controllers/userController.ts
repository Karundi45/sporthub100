import { Request, Response } from 'express';
import User from '../models/User';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id).select('-passwordHash');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.height = req.body.height || user.height;
      user.weight = req.body.weight || user.weight;
      user.gender = req.body.gender || user.gender;
      user.fitnessGoals = req.body.fitnessGoals || user.fitnessGoals;
      user.preferredSports = req.body.preferredSports || user.preferredSports;
      user.profilePicture = req.body.profilePicture || user.profilePicture;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        bio: updatedUser.bio,
        height: updatedUser.height,
        weight: updatedUser.weight,
        gender: updatedUser.gender,
        fitnessGoals: updatedUser.fitnessGoals,
        preferredSports: updatedUser.preferredSports,
        profilePicture: updatedUser.profilePicture,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    const keyword = q
      ? {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { fullName: { $regex: q, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find({ ...keyword, _id: { $ne: (req as any).user._id } }).select('username fullName profilePicture bio');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const followUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = (req as any).user._id;

    if (targetUserId === currentUserId.toString()) {
      res.status(400).json({ message: 'You cannot follow yourself' });
      return;
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (targetUser && currentUser) {
      if (!currentUser.following.includes(targetUser._id)) {
        currentUser.following.push(targetUser._id);
        targetUser.followers.push(currentUser._id);

        await currentUser.save();
        await targetUser.save();
      }
      res.json({ message: 'Successfully followed user' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const unfollowUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = (req as any).user._id;

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (targetUser && currentUser) {
      currentUser.following = currentUser.following.filter((id) => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== currentUserId.toString());

      await currentUser.save();
      await targetUser.save();

      res.json({ message: 'Successfully unfollowed user' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePushToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pushToken } = req.body;
    
    const user = await User.findById((req as any).user._id);
    if (user) {
      user.expoPushToken = pushToken;
      await user.save();
    }
    
    res.json({ message: 'Push token updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upgrade user to premium
// @route   POST /api/users/upgrade
// @access  Private
export const upgradeUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);
    
    if (user) {
      user.isPremium = true;
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        isPremium: updatedUser.isPremium,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
