import { Request, Response } from 'express';
import TrainingPlan from '../models/TrainingPlan';

// @desc    Get all training plans
// @route   GET /api/plans
// @access  Private
export const getPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await TrainingPlan.find();
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enroll in a training plan
// @route   POST /api/plans/:id/enroll
// @access  Private
export const enrollInPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const planId = req.params.id;
    const userId = (req as any).user._id;

    const plan = await TrainingPlan.findById(planId);
    if (!plan) {
      res.status(404).json({ message: 'Training plan not found' });
      return;
    }

    if (plan.enrolledUsers.some((id: any) => id.toString() === userId.toString())) {
      res.status(400).json({ message: 'You are already enrolled in this plan' });
      return;
    }

    plan.enrolledUsers.push(userId);
    await plan.save();

    res.status(200).json({ message: 'Successfully enrolled', plan });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
