import { fetchClient } from '@/lib/fetch-client';
import { LoginInput, RegisterInput, AuthResponse, User } from '../modules/auth/types';

export const authService = {
    login: (data: LoginInput): Promise<AuthResponse> =>
        fetchClient('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    register: (data: RegisterInput): Promise<AuthResponse> =>
        fetchClient('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getProfile: (): Promise<{ success: boolean; data: User }> =>
        fetchClient('/users/profile'),

    updateProfile: (data: Partial<User>): Promise<{ success: boolean; data: User }> =>
        fetchClient('/users/profile', {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    forgotPassword: (email: string): Promise<{ success: boolean; message: string }> =>
        fetchClient('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),

    resetPassword: (data: { token: string; password?: string }): Promise<{ success: boolean; message: string }> =>
        fetchClient('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    changePassword: (data: { currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; message: string }> =>
        fetchClient('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};
