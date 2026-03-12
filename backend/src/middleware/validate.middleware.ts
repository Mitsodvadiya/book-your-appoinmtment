import { NextFunction, Request, Response } from 'express';
import { ZodObject } from 'zod';

export const validate = (schema: ZodObject<any, any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req?.body, req.query, req.params, "req")
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e: any) {
        console.error("Validation Error:", e.errors || e);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: e.errors || e.issues || [],
        });
    }
};
