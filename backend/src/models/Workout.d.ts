import mongoose, { Document } from 'mongoose';
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
    distance: number;
    duration: number;
    movingTime: number;
    stoppedTime: number;
    averageSpeed: number;
    maxSpeed: number;
    averagePace: number;
    maxPace: number;
    elevationGain: number;
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
declare const _default: mongoose.Model<IWorkout, {}, {}, {}, mongoose.Document<unknown, {}, IWorkout, {}, mongoose.DefaultSchemaOptions> & IWorkout & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IWorkout>;
export default _default;
//# sourceMappingURL=Workout.d.ts.map