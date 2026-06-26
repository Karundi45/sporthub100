import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Challenge from '../models/Challenge';

export const getChallenges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challenges = await Challenge.find({
      endDate: { $gte: new Date() } // Get active and upcoming challenges
    }).sort({ startDate: 1 });
    
    res.json(challenges);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const joinChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }

    const isParticipating = challenge.participants.some(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipating) {
      challenge.participants.push({
        user: req.user._id,
        progress: 0,
        completed: false
      });
      await challenge.save();
    }

    res.json({ message: 'Joined challenge successfully', challenge });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
