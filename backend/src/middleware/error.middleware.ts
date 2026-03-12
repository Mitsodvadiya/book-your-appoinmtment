import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        success: false,
        message,
        stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
