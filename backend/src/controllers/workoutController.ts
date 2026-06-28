import { Request, Response } from 'express';
import Workout from '../models/Workout';

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
