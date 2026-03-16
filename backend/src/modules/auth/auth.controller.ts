import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { successResponse } from '../../utils/response';
import { UserRole } from '@prisma/client';

export class AuthController {
    // static async register(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const user = await AuthService.register(req.body);
    //         return successResponse(res, user, 'User registered successfully', 201);
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    private static setRefreshTokenCookie(res: Response, refreshToken: string) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }

    private static clearRefreshTokenCookie(res: Response) {
        res.cookie('refreshToken', '', {
            httpOnly: true,
            expires: new Date(0),
        });
    }

    static async registerOwner(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.register({
                ...req.body,
                role: UserRole.CLINIC_ADMIN,
            });
            
            // Owners always get refresh token in cookie
            AuthController.setRefreshTokenCookie(res, result.refreshToken);
            
            const { refreshToken, ...dataWithoutRefreshToken } = result;
            return successResponse(res, dataWithoutRefreshToken, 'Clinic owner registered successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    static async registerPatient(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.register({
                ...req.body,
                role: UserRole.PATIENT,
            });
            
            // Patients always get refresh token in body (mobile side)
            return successResponse(res, result, 'Patient registered successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.login(req.body);
            
            if (result.user.role === UserRole.PATIENT) {
                // Patient gets it in body
                return successResponse(res, result, 'Login successful');
            } else {
                // Others get it in cookie
                AuthController.setRefreshTokenCookie(res, result.refreshToken);
                const { refreshToken, ...dataWithoutRefreshToken } = result;
                return successResponse(res, dataWithoutRefreshToken, 'Login successful');
            }
        } catch (error) {
            next(error);
        }
    }

    static async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
            
            if (!refreshToken) {
                return res.status(401).json({ success: false, message: 'Refresh token missing' });
            }

            const result = await AuthService.refreshToken(refreshToken);
            
            if (result.user.role === UserRole.PATIENT) {
                // Patient gets it in body
                return successResponse(res, result, 'Tokens refreshed successfully');
            } else {
                // Others get it in cookie
                AuthController.setRefreshTokenCookie(res, result.refreshToken);
                const { refreshToken: _, ...tokensWithoutRefreshToken } = result;
                return successResponse(res, tokensWithoutRefreshToken, 'Tokens refreshed successfully');
            }
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

    static async me(req: any, res: Response, next: NextFunction) {
        try {
            const user = await AuthService.getMe(req.user.userId);
            return successResponse(res, user, 'Profile fetched successfully');
        } catch (error) {
            next(error);
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            AuthController.clearRefreshTokenCookie(res);
            return successResponse(res, null, 'Logged out successfully');
        } catch (error) {
            next(error);
        }
    }
}
