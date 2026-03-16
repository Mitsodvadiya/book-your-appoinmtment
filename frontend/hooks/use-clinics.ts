import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export const useUpdateClinic = () => {
  const queryClient = useQueryClient();
  const setAuthData = useAuthStore((state) => state.setAuthData);

  return useMutation({
    mutationFn: async ({ clinicId, data }: { clinicId: string; data: any }) => {
      const response = await api.patch(`/clinics/${clinicId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Allow clinic detail changes to cascade across cached views 
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      // Live-update the clinic properties embedded under the global authenticated user session
      const { user, accessToken, refreshToken, clinic } = useAuthStore.getState();
      if (clinic && data.clinic && user) {
        setAuthData(user, accessToken!, refreshToken!, data.clinic);
      }
    },
  });
};

export const useWorkingHours = (clinicId?: string) => {
  return useQuery({
    queryKey: ['workingHours', clinicId],
    queryFn: async () => {
      const response = await api.get(`/clinics/${clinicId}/working-hours`);
      return response.data;
    },
    enabled: !!clinicId,
  });
};

export const useUpdateWorkingHours = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clinicId, workingHours, schedules }: { clinicId: string; workingHours?: any; schedules?: any[] }) => {
      // Pass the specific parameters in the POST body to avoid dropping data
      const response = await api.post(`/clinics/${clinicId}/working-hours`, { 
        ...(workingHours && { ...workingHours }), 
        ...(schedules && { schedules }) 
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workingHours', variables.clinicId] });
    },
  });
};
