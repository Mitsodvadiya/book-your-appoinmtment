import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';
import { LoginInput, RegisterInput } from '../types';
import { useRouter } from 'next/navigation';

export const useLogin = () => {
    const login = useAuthStore((state) => state.login);
    const router = useRouter();

    return useMutation({
        mutationFn: (data: LoginInput) => authService.login(data),
        onSuccess: (response) => {
            const { accessToken, refreshToken, user } = response.data;
            login(accessToken, refreshToken, user);
            router.push('/dashboard');
        },
    });
};

export const useRegister = () => {
    return useMutation({
        mutationFn: (data: RegisterInput) => authService.register(data),
    });
};

export const useProfile = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await authService.getProfile();
            if (response.success) {
                setUser(response.data);
            }
            return response.data;
        },
        enabled: isAuthenticated,
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
