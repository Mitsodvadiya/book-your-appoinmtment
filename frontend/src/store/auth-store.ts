import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Clinic } from '@/modules/auth/types';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    clinic: Clinic | null;
    _hasHydrated: boolean;
    setTokens: (access: string, refresh: string) => void;
    setUser: (user: User | null) => void;
    setClinic: (clinic: Clinic | null) => void;
    setHasHydrated: (state: boolean) => void;
    login: (access: string, refresh: string, user: User, clinic?: Clinic | false) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            clinic: null,
            _hasHydrated: false,
            setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
            setUser: (user) => set({ user }),
            setClinic: (clinic) => set({ clinic }),
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            login: (accessToken, refreshToken, user, clinic) =>
                set({
                    accessToken,
                    refreshToken,
                    user,
                    isAuthenticated: true,
                    clinic: clinic || null,
                }),
            logout: () =>
                set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false, clinic: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
