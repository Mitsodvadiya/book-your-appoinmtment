import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const profileUpdateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3, // Limit each user to 3 update requests per windowMs
    message: {
        success: false,
        message: 'You have reached the maximum of 3 profile updates for today. Please try again tomorrow.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req: Request) => {
        // Use the authenticated user's ID as the key to limit by user, not IP address.
        // If for some reason the user is not authenticated yet, fallback to IP.
        return (req as any).user?.userId || req.ip;
    },
});
