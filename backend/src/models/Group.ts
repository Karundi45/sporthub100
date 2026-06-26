import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description: string;
  coverPhoto?: string;
  isPrivate: boolean;
  admins: mongoose.Types.ObjectId[];
  moderators: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  joinRequests: mongoose.Types.ObjectId[];
  location?: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    coverPhoto: { type: String, default: '' },
    isPrivate: { type: Boolean, default: false },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

GroupSchema.index({ location: '2dsphere' });

export default mongoose.model<IGroup>('Group', GroupSchema);
