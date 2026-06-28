import mongoose, { Schema, Document } from 'mongoose';

export interface ITrainingPlan extends Document {
  title: string;
  description: string;
  durationWeeks: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  workoutsPerWeek: number;
  enrolledUsers: mongoose.Types.ObjectId[];
}

const TrainingPlanSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    durationWeeks: { type: Number, required: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    workoutsPerWeek: { type: Number, required: true },
    enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model<ITrainingPlan>('TrainingPlan', TrainingPlanSchema);
