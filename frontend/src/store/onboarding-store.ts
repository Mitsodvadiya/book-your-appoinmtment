import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OnboardingState {
    currentStep: number;
    clinicId: string | null;
    doctorId: string | null;
    doctorName: string | null;
    doctorEmail: string | null;

    setStep: (step: number) => void;
    setClinicId: (id: string) => void;
    setDoctorId: (id: string) => void;
    setDoctorData: (name: string, email: string) => void;
    resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            currentStep: 1,
            clinicId: null,
            doctorId: null,
            doctorName: null,
            doctorEmail: null,

            setStep: (currentStep) => set({ currentStep }),
            setClinicId: (clinicId) => set({ clinicId }),
            setDoctorId: (doctorId) => set({ doctorId }),
            setDoctorData: (doctorName, doctorEmail) => set({ doctorName, doctorEmail }),
            resetOnboarding: () => set({
                currentStep: 1,
                clinicId: null,
                doctorId: null,
                doctorName: null,
                doctorEmail: null
            }),
        }),
        {
            name: 'onboarding-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
