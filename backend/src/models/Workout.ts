import mongoose, { Schema, Document } from 'mongoose';

export interface IRoutePoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp: Date;
  speed?: number;
  heartRate?: number;
}

export interface IWorkout extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  activityType: string;
  description?: string;
  route: IRoutePoint[];
  distance: number; // in meters
  duration: number; // total time in seconds
  movingTime: number; // in seconds
  stoppedTime: number; // in seconds
  averageSpeed: number; // m/s
  maxSpeed: number; // m/s
  averagePace: number; // seconds per km
  maxPace: number;
  elevationGain: number; // in meters
  calories: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  cadence?: number;
  steps?: number;
  photos: string[];
  privacy: 'public' | 'private' | 'followers';
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RoutePointSchema = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  altitude: { type: Number },
  timestamp: { type: Date, required: true },
  speed: { type: Number },
  heartRate: { type: Number },
}, { _id: false });

const WorkoutSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    activityType: { 
      type: String, 
      required: true,
      enum: ['Walking', 'Running', 'Trail Running', 'Cycling', 'Mountain Biking', 'Swimming', 'Hiking', 'Gym', 'Yoga', 'Football', 'Basketball', 'Volleyball', 'Tennis', 'Badminton', 'Boxing', 'Skating', 'Rowing', 'Kayaking', 'Custom'] 
    },
    description: { type: String, default: '' },
    route: [RoutePointSchema],
    distance: { type: Number, default: 0 },
    duration: { type: Number, required: true },
    movingTime: { type: Number, required: true },
    stoppedTime: { type: Number, default: 0 },
    averageSpeed: { type: Number, default: 0 },
    maxSpeed: { type: Number, default: 0 },
    averagePace: { type: Number, default: 0 },
    maxPace: { type: Number, default: 0 },
    elevationGain: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    averageHeartRate: { type: Number },
    maxHeartRate: { type: Number },
    cadence: { type: Number },
    steps: { type: Number },
    photos: [{ type: String }],
    privacy: { type: String, enum: ['public', 'private', 'followers'], default: 'public' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);
