import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Group from '../models/Group';

export const createGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, isPrivate, location } = req.body;

    const group = await Group.create({
      name,
      description,
      isPrivate: isPrivate || false,
      admins: [req.user._id],
      members: [req.user._id],
      location
    });

    res.status(201).json(group);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const groups = await Group.find({ isPrivate: false })
      .populate('admins', 'username')
      .limit(20);
    res.json(groups);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const joinGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    if (group.members.includes(req.user._id)) {
      res.status(400).json({ message: 'Already a member' });
      return;
    }

    if (group.isPrivate) {
      if (!group.joinRequests.includes(req.user._id)) {
        group.joinRequests.push(req.user._id);
        await group.save();
      }
      res.json({ message: 'Join request sent' });
    } else {
      group.members.push(req.user._id);
      await group.save();
      res.json({ message: 'Successfully joined the group', group });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

import Message from '../models/Message';

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await Message.find({ group: req.params.id })
      .populate('sender', 'username fullName profilePicture')
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    const message = await Message.create({
      group: req.params.id,
      sender: req.user._id,
      text,
    });
    
    const populatedMessage = await Message.findById(message._id).populate('sender', 'username fullName profilePicture');
    res.status(201).json(populatedMessage);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
