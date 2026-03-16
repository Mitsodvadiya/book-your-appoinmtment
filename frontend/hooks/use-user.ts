import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache to prevent dev double fetching
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setAuthData = useAuthStore((state) => state.setAuthData);

  return useMutation({
    mutationFn: async (data: { name?: string; phone?: string }) => {
      const response = await api.patch('/users/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Refresh the query cache
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Update global auth store state using the new user values
      const { user } = useAuthStore.getState();
      if (user) {
         // Using the partial properties returned from the success response to override the old user object
         const updatedUser = { ...user, ...data.data };
         setAuthData(updatedUser, useAuthStore.getState().accessToken!, useAuthStore.getState().refreshToken!, useAuthStore.getState().clinic);
      }
    },
  });
};
