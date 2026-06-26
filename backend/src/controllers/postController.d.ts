import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const createPost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFeed: (req: AuthRequest, res: Response) => Promise<void>;
export declare const likePost: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=postController.d.ts.map