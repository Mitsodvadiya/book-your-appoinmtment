import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    refreshTokenSchema,
} from './auth.schema';
import { authenticateUser } from './auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { success: false, message: 'Too many login attempts, please try again after a minute' },
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3,
    message: { success: false, message: 'Too many forgot password requests, please try again after a minute' },
});

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', loginLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/change-password', authenticateUser, validate(changePasswordSchema), AuthController.changePassword);

export default router;
