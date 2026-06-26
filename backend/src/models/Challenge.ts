import mongoose, { Schema, Document } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  description: string;
  type: 'distance' | 'calories' | 'time' | 'elevation' | 'custom';
  targetValue: number; // e.g., 50 (km), 10000 (calories)
  startDate: Date;
  endDate: Date;
  participants: {
    user: mongoose.Types.ObjectId;
    progress: number;
    completed: boolean;
  }[];
  badgeIcon?: string;
  xpReward: number;
  creator?: mongoose.Types.ObjectId; // null if system-created
  isGlobal: boolean; // true for monthly/weekly global challenges
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['distance', 'calories', 'time', 'elevation', 'custom'], required: true },
    targetValue: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
      },
    ],
    badgeIcon: { type: String },
    xpReward: { type: Number, default: 100 },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isGlobal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema);
