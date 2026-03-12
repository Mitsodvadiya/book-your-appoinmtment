export const successResponse = (res: any, data: any, message = 'Success', status = 200) => {
    return res.status(status).json({
        success: true,
        message,
        data,
    });
};

export const errorResponse = (res: any, message = 'Error', status = 500, error?: any) => {
    return res.status(status).json({
        success: false,
        message,
        error: error || null,
    });
};
