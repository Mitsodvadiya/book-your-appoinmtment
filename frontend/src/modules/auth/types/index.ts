export interface Clinic {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    email: string;
    logo?: string;
    isActive: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
}

// Auth response now includes tokens at the top level (for both login and register)
export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
        clinic?: Clinic | false; // only on login
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
}
