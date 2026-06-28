import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Challenge from '../models/Challenge';
import Workout from '../models/Workout';

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

export const createChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, type, target, startDate, endDate } = req.body;
    
    const challenge = await Challenge.create({
      title,
      description,
      type,
      target,
      startDate,
      endDate,
      participants: []
    });

    res.status(201).json(challenge);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Rank users by total distance covered
    const leaderboard = await Workout.aggregate([
      {
        $group: {
          _id: '$user',
          totalDistance: { $sum: '$distance' },
          totalWorkouts: { $sum: 1 },
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          totalDistance: 1,
          totalWorkouts: 1,
          username: '$userDetails.username',
          fullName: '$userDetails.fullName',
          profilePicture: '$userDetails.profilePicture'
        }
      },
      { $sort: { totalDistance: -1 } },
      { $limit: 50 }
    ]);

    res.json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
