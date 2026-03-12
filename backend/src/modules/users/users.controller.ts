import { Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { successResponse } from '../../utils/response';

export class UsersController {
    static async getProfile(req: any, res: Response, next: NextFunction) {
        try {
            const user = await UsersService.getProfile(req.user.userId);
            return successResponse(res, user, 'Profile fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async updateProfile(req: any, res: Response, next: NextFunction) {
        try {
            const user = await UsersService.updateProfile(req.user.userId, req.body);
            return successResponse(res, user, 'Profile updated successfully');
        } catch (error) {
            next(error);
        }
    }
}
