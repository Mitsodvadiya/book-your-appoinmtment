export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    clinicId?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}

export interface LoginInput {
    email: string;
    password?: string;
}

export interface RegisterInput {
    name: string;
    email: string;
    password?: string;
    phone: string;
    role: string;
}
