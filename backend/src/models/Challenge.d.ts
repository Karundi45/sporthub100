import mongoose, { Document } from 'mongoose';
export interface IChallenge extends Document {
    title: string;
    description: string;
    type: 'distance' | 'calories' | 'time' | 'elevation' | 'custom';
    targetValue: number;
    startDate: Date;
    endDate: Date;
    participants: {
        user: mongoose.Types.ObjectId;
        progress: number;
        completed: boolean;
    }[];
    badgeIcon?: string;
    xpReward: number;
    creator?: mongoose.Types.ObjectId;
    isGlobal: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IChallenge, {}, {}, {}, mongoose.Document<unknown, {}, IChallenge, {}, mongoose.DefaultSchemaOptions> & IChallenge & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IChallenge>;
export default _default;
//# sourceMappingURL=Challenge.d.ts.map