import { Request, Response } from 'express';
import Workout from '../models/Workout';
import User from '../models/User';

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
export const createWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      activityType,
      description,
      route,
      distance,
      duration,
      movingTime,
      stoppedTime,
      averageSpeed,
      maxSpeed,
      averagePace,
      maxPace,
      elevationGain,
      calories,
      steps,
      startTime,
      endTime,
    } = req.body;

    if (!route || route.length === 0) {
      res.status(400).json({ message: 'No route data provided' });
      return;
    }

    const workout = new Workout({
      user: (req as any).user._id,
      title: title || `${activityType} Workout`,
      activityType,
      description,
      route,
      distance,
      duration,
      movingTime,
      stoppedTime,
      averageSpeed,
      maxSpeed,
      averagePace,
      maxPace,
      elevationGain,
      calories,
      steps,
      startTime,
      endTime,
    });

    const createdWorkout = await workout.save();

    // Achievement Logic
    const user = await User.findById((req as any).user._id);
    if (user) {
      const achievementsToAward = [];
      const userAchievements = user.achievements || [];
      const hasAchievement = (title: string) => userAchievements.some((a) => a.title === title);

      if (userAchievements.length === 0 && !hasAchievement('First Steps')) {
        achievementsToAward.push({ title: 'First Steps', description: 'Tracked your very first workout!', icon: '👟', earnedAt: new Date() });
      }
      
      if (distance >= 5000 && !hasAchievement('5K Finisher')) {
        achievementsToAward.push({ title: '5K Finisher', description: 'Completed a 5K in a single session.', icon: '🏅', earnedAt: new Date() });
      }

      if (distance >= 10000 && !hasAchievement('10K Master')) {
        achievementsToAward.push({ title: '10K Master', description: 'Completed a 10K in a single session.', icon: '🏆', earnedAt: new Date() });
      }

      if (achievementsToAward.length > 0) {
        user.achievements.push(...achievementsToAward);
        await user.save();
      }
    }

    res.status(201).json(createdWorkout);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all workouts for current user
// @route   GET /api/workouts
// @access  Private
export const getMyWorkouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const workouts = await Workout.find({ user: (req as any).user._id }).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
