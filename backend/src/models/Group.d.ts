import mongoose, { Document } from 'mongoose';
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
        coordinates: number[];
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IGroup, {}, {}, {}, mongoose.Document<unknown, {}, IGroup, {}, mongoose.DefaultSchemaOptions> & IGroup & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IGroup>;
export default _default;
//# sourceMappingURL=Group.d.ts.map