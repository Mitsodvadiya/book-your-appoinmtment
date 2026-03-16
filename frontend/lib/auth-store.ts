'use client'

import { create } from 'zustand'
import type { User, Clinic } from './types'

interface AuthState {
  user: User | null
  clinic: Clinic | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  setAuthData: (user: User, accessToken: string, refreshToken?: string, clinic?: Clinic | null) => void
  setClinic: (clinic: Clinic | null) => void
  setInitialized: (value: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  clinic: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  setAuthData: (user, accessToken, refreshToken, clinic) => {
    set({ 
      user, 
      accessToken, 
      refreshToken: refreshToken || null, 
      clinic: clinic !== undefined ? clinic : null,
      isAuthenticated: true 
    })
  },

  setClinic: (clinic) => {
    set({ clinic })
  },

  setInitialized: (value) => {
    set({ isInitialized: value })
  },

  logout: () => {
    set({ 
      user: null, 
      clinic: null, 
      accessToken: null, 
      refreshToken: null, 
      isAuthenticated: false 
    })
  },
}))
