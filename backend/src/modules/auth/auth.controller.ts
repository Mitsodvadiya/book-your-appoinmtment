import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { successResponse } from '../../utils/response';

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await AuthService.register(req.body);
            return successResponse(res, user, 'User registered successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await AuthService.login(req.body);
            return successResponse(res, data, 'Login successful');
        } catch (error) {
            next(error);
        }
    }

    static async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const tokens = await AuthService.refreshToken(req.body.refreshToken);
            return successResponse(res, tokens, 'Tokens refreshed successfully');
        } catch (error) {
            next(error);
        }
    }

    static async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            await AuthService.forgotPassword(req.body.email);
            return successResponse(res, null, 'If that email exists, a reset token has been generated');
        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, newPassword } = req.body;
            await AuthService.resetPassword(token, newPassword);
            return successResponse(res, null, 'Password reset successfully');
        } catch (error) {
            next(error);
        }
    }

    static async changePassword(req: any, res: Response, next: NextFunction) {
        try {
            const { oldPassword, newPassword } = req.body;
            await AuthService.changePassword(req.user.userId, oldPassword, newPassword);
            return successResponse(res, null, 'Password changed successfully');
        } catch (error) {
            next(error);
        }
    }
}
