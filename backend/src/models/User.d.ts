import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    fullName: string;
    profilePicture?: string;
    coverPhoto?: string;
    bio?: string;
    country?: string;
    city?: string;
    birthday?: Date;
    height?: number;
    weight?: number;
    gender?: string;
    fitnessGoals?: string[];
    preferredSports?: string[];
    privacySettings: {
        profileVisibility: 'public' | 'private' | 'followers';
        activityVisibility: 'public' | 'private' | 'followers';
    };
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
//# sourceMappingURL=User.d.ts.map