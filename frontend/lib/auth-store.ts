'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Clinic } from './types'

interface AuthState {
  user: User | null
  clinic: Clinic | null
  isAuthenticated: boolean
  isLoading: boolean
  showGuide: boolean
  guideStep: number
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  setClinic: (clinic: Clinic) => void
  completeOnboarding: () => void
  setShowGuide: (show: boolean) => void
  nextGuideStep: () => void
  resetGuide: () => void
}

// Mock user database
const mockUsers: { email: string; password: string; user: User }[] = []

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      clinic: null,
      isAuthenticated: false,
      isLoading: false,
      showGuide: false,
      guideStep: 0,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const found = mockUsers.find(u => u.email === email && u.password === password)
        
        if (found) {
          set({ 
            user: found.user, 
            isAuthenticated: true, 
            isLoading: false,
            showGuide: !found.user.onboardingComplete
          })
          return true
        }
        
        // Demo login for testing
        if (email === 'demo@clinic.com' && password === 'demo123') {
          const demoUser: User = {
            id: 'demo-user',
            name: 'Demo User',
            email: 'demo@clinic.com',
            role: 'owner',
            clinicId: 'demo-clinic',
            createdAt: new Date(),
            onboardingComplete: true
          }
          const demoClinic: Clinic = {
            id: 'demo-clinic',
            name: 'Demo Clinic',
            email: 'demo@clinic.com',
            phone: '+1 234 567 8900',
            address: '123 Medical Plaza',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            specialization: 'General Practice',
            openTime: '09:00',
            closeTime: '18:00',
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            createdAt: new Date()
          }
          set({ 
            user: demoUser, 
            clinic: demoClinic,
            isAuthenticated: true, 
            isLoading: false 
          })
          return true
        }
        
        set({ isLoading: false })
        return false
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true })
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check if user already exists
        if (mockUsers.find(u => u.email === email)) {
          set({ isLoading: false })
          return false
        }
        
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email,
          role: 'owner',
          clinicId: '',
          createdAt: new Date(),
          onboardingComplete: false
        }
        
        mockUsers.push({ email, password, user: newUser })
        
        set({ 
          user: newUser, 
          isAuthenticated: true, 
          isLoading: false,
          showGuide: true,
          guideStep: 0
        })
        return true
      },

      logout: () => {
        set({ 
          user: null, 
          clinic: null, 
          isAuthenticated: false,
          showGuide: false,
          guideStep: 0
        })
      },

      setClinic: (clinic: Clinic) => {
        const user = get().user
        if (user) {
          set({ 
            clinic,
            user: { ...user, clinicId: clinic.id }
          })
        }
      },

      completeOnboarding: () => {
        const user = get().user
        if (user) {
          set({ 
            user: { ...user, onboardingComplete: true },
            showGuide: true,
            guideStep: 0
          })
        }
      },

      setShowGuide: (show: boolean) => {
        set({ showGuide: show })
      },

      nextGuideStep: () => {
        set((state) => ({ guideStep: state.guideStep + 1 }))
      },

      resetGuide: () => {
        set({ guideStep: 0, showGuide: false })
      }
    }),
    {
      name: 'clinic-auth-storage',
      partialize: (state) => ({
        user: state.user,
        clinic: state.clinic,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
