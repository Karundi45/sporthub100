import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const createGroup: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getGroups: (req: AuthRequest, res: Response) => Promise<void>;
export declare const joinGroup: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=groupController.d.ts.map