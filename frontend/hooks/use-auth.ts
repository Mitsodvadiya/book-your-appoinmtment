import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export const useLogin = () => {
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const setClinic = useAuthStore((state) => state.setClinic);

  return useMutation({
    mutationFn: async (credentials: any) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data.data;
      setAuthData(user, accessToken, refreshToken, user.clinic || null);
    },
  });
};

export const useRegister = () => {
  const setAuthData = useAuthStore((state) => state.setAuthData);

  return useMutation({
    mutationFn: async ({ userData, isPatient = false }: { userData: any, isPatient?: boolean }) => {
      const endpoint = isPatient ? '/auth/register-patient' : '/auth/register';
      const response = await api.post(endpoint, userData);
      return response.data;
    },
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data.data;
      setAuthData(user, accessToken, refreshToken, user.clinic || null);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/logout');
      return response.data;
    },
    onSettled: () => {
      logout();
      window.location.href = '/login';
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    },
  });
};
