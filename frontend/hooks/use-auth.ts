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
      const { user, accessToken, refreshToken, clinic } = data.data;
      setAuthData(user, accessToken, refreshToken);
      setClinic(clinic || null);
    },
  });
};

export const useRegister = () => {
  const setAuthData = useAuthStore((state) => state.setAuthData);

  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data.data;
      setAuthData(user, accessToken, refreshToken);
    },
  });
};
