import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Workout from '../models/Workout';

export const getUserAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    // Aggregate total distance, duration, and calories
    const stats = await Workout.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distance' },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$calories' },
          totalWorkouts: { $sum: 1 },
        },
      },
    ]);

    // Aggregate by activity type
    const activityDistribution = await Workout.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          distance: { $sum: '$distance' }
        }
      }
    ]);

    res.json({
      overall: stats.length > 0 ? stats[0] : { totalDistance: 0, totalDuration: 0, totalCalories: 0, totalWorkouts: 0 },
      activityDistribution
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
