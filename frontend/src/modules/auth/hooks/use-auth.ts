import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';
import { Clinic, LoginInput, RegisterInput } from '../types';
import { useRouter } from 'next/navigation';

export const useLogin = () => {
    const login = useAuthStore((state) => state.login);
    const router = useRouter();

    return useMutation({
        mutationFn: (data: LoginInput) => authService.login(data),
        onSuccess: (response) => {
            const { accessToken, refreshToken, user, clinic } = response.data;
            login(accessToken, refreshToken, user, clinic);

            // If clinic exists, go to dashboard; otherwise go to onboarding
            if (clinic) {
                router.push('/dashboard');
            } else {
                router.push('/onboarding');
            }
        },
    });
};

export const useRegister = () => {
    const login = useAuthStore((state) => state.login);

    return useMutation({
        mutationFn: (data: RegisterInput) => authService.register(data),
        onSuccess: (response) => {
            const { accessToken, refreshToken, user } = response.data;
            // Auto-login: store tokens and user immediately after registration
            // No clinic yet — they will be redirected to create one
            login(accessToken, refreshToken, user, false);
        },
    });
};

export const useProfile = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await authService.getProfile();
            if (response.success) {
                setUser(response.data);
            }
            return response.data;
        },
        // Only fetch if authenticated AND user not yet loaded
        enabled: isAuthenticated && !user,
    });
};

export const useUpdateProfile = () => {
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: (data: any) => authService.updateProfile(data),
        onSuccess: (response: any) => {
            setUser(response.data);
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: any) => authService.changePassword(data),
    });
};
