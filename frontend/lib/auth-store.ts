'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Clinic } from './types'

interface AuthState {
  user: User | null
  clinic: Clinic | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setAuthData: (user: User, accessToken: string, refreshToken: string) => void
  setClinic: (clinic: Clinic | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      clinic: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuthData: (user, accessToken, refreshToken) => {
        set({ 
          user, 
          accessToken, 
          refreshToken, 
          isAuthenticated: true 
        })
      },

      setClinic: (clinic) => {
        set({ clinic })
      },

      logout: () => {
        set({ 
          user: null, 
          clinic: null, 
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false 
        })
        localStorage.removeItem('clinic-auth-storage')
      },
    }),
    {
      name: 'clinic-auth-storage',
    }
  )
)
