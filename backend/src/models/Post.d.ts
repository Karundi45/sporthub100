import mongoose, { Document } from 'mongoose';
export interface IPost extends Document {
    user: mongoose.Types.ObjectId;
    content: string;
    photos: string[];
    workout?: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    comments: {
        user: mongoose.Types.ObjectId;
        text: string;
        createdAt: Date;
    }[];
    hashtags: string[];
    mentions: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPost, {}, {}, {}, mongoose.Document<unknown, {}, IPost, {}, mongoose.DefaultSchemaOptions> & IPost & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPost>;
export default _default;
//# sourceMappingURL=Post.d.ts.map