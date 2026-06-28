import mongoose, { Schema, Document } from 'mongoose';

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
  height?: number; // in cm
  weight?: number; // in kg
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

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    coverPhoto: { type: String, default: '' },
    bio: { type: String, default: '' },
    country: { type: String, default: '' },
    city: { type: String, default: '' },
    birthday: { type: Date },
    height: { type: Number },
    weight: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
    fitnessGoals: [{ type: String }],
    preferredSports: [{ type: String }],
    privacySettings: {
      profileVisibility: { type: String, enum: ['public', 'private', 'followers'], default: 'public' },
      activityVisibility: { type: String, enum: ['public', 'private', 'followers'], default: 'public' },
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    achievements: [{
      title: String,
      description: String,
      icon: String,
      earnedAt: Date
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);
