import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface UserProfile {
  id: string; // The membership/staff mapping ID
  userId: string; // Global User ID
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  doctorProfile?: {
    id: string;
    specialization: string;
    consultationDuration: number;
    maxTokensPerDay: number;
  };
}

export const useClinicStaff = (clinicId: string) => {
  return useQuery({
    queryKey: ['staff', clinicId],
    queryFn: async (): Promise<UserProfile[]> => {
      const response = await api.get(`/clinics/${clinicId}/staff`);
      return response.data.data; // assuming successResponse wrapper structure
    },
    enabled: !!clinicId,
  });
};

export const useAddStaff = (clinicId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/clinics/${clinicId}/staff`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', clinicId] });
    },
  });
};

export const useUpdateStaffStatus = (clinicId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await api.patch(`/staff/${userId}/status`, { isActive });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', clinicId] });
    },
  });
};
