import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export const useCreateClinic = () => {
  return useMutation({
    mutationFn: async (clinicData: any) => {
      const response = await api.post('/clinics', clinicData);
      return response.data;
    },
  });
};

export const useSaveWorkingHours = () => {
  return useMutation({
    mutationFn: async ({ clinicId, workingHours }: { clinicId: string; workingHours: any }) => {
      const response = await api.post(`/clinics/${clinicId}/working-hours`, workingHours);
      return response.data;
    },
  });
};

export const useAddDoctor = () => {
  return useMutation({
    mutationFn: async ({ clinicId, doctorData }: { clinicId: string; doctorData: any }) => {
      const response = await api.post(`/clinics/${clinicId}/doctors`, doctorData);
      return response.data;
    },
  });
};

export const useInviteStaff = () => {
  return useMutation({
    mutationFn: async ({ clinicId, staffData }: { clinicId: string; staffData: any }) => {
      const response = await api.post(`/clinics/${clinicId}/invite`, staffData);
      return response.data;
    },
  });
};
