'use client'

import { create } from 'zustand'
import type { Token, Patient, Doctor, Service, QueueStats } from './types'
import { initialTokens, doctors, services, patients } from './mock-data'

interface QueueStore {
  tokens: Token[]
  doctors: Doctor[]
  services: Service[]
  patients: Patient[]
  
  // Actions
  addToken: (patient: Patient, doctor: Doctor, service: Service, notes?: string) => Token
  completeToken: (tokenId: string) => void
  cancelToken: (tokenId: string) => void
  skipToken: (tokenId: string) => void
  callNextToken: () => void
  
  // Getters
  getStats: () => QueueStats
  getCurrentToken: () => Token | null
  getWaitingTokens: () => Token[]
  getCompletedTokens: () => Token[]
  getTokensByDoctor: (doctorId: string) => Token[]
}

export const useQueueStore = create<QueueStore>((set, get) => ({
  tokens: initialTokens,
  doctors: doctors,
  services: services,
  patients: patients,
  
  addToken: (patient, doctor, service, notes) => {
    const { tokens } = get()
    const maxToken = Math.max(...tokens.map(t => t.tokenNumber), 0)
    const newToken: Token = {
      id: String(Date.now()),
      tokenNumber: maxToken + 1,
      patient,
      doctor,
      service,
      status: 'WAITING',
      notes,
      createdAt: new Date(),
    }
    set({ tokens: [...tokens, newToken] })
    return newToken
  },
  
  completeToken: (tokenId) => {
    set((state) => ({
      tokens: state.tokens.map(t => 
        t.id === tokenId 
          ? { ...t, status: 'COMPLETED' as const, completedAt: new Date() }
          : t
      )
    }))
  },
  
  cancelToken: (tokenId) => {
    set((state) => ({
      tokens: state.tokens.map(t => 
        t.id === tokenId 
          ? { ...t, status: 'CANCELLED' as const }
          : t
      )
    }))
  },
  
  skipToken: (tokenId) => {
    set((state) => ({
      tokens: state.tokens.map(t => 
        t.id === tokenId 
          ? { ...t, status: 'SKIPPED' as const }
          : t
      )
    }))
  },
  
  callNextToken: () => {
    const { tokens } = get()
    const currentToken = tokens.find(t => t.status === 'CURRENT')
    const waitingTokens = tokens.filter(t => t.status === 'WAITING').sort((a, b) => a.tokenNumber - b.tokenNumber)
    
    if (currentToken && waitingTokens.length > 0) {
      set({
        tokens: tokens.map(t => {
          if (t.id === currentToken.id) {
            return { ...t, status: 'COMPLETED' as const, completedAt: new Date() }
          }
          if (t.id === waitingTokens[0].id) {
            return { ...t, status: 'CURRENT' as const }
          }
          return t
        })
      })
    } else if (!currentToken && waitingTokens.length > 0) {
      set({
        tokens: tokens.map(t => 
          t.id === waitingTokens[0].id 
            ? { ...t, status: 'CURRENT' as const }
            : t
        )
      })
    }
  },
  
  getStats: () => {
    const { tokens, doctors: allDoctors } = get()
    const currentToken = tokens.find(t => t.status === 'CURRENT') || null
    const waitingCount = tokens.filter(t => t.status === 'WAITING').length
    const completedCount = tokens.filter(t => t.status === 'COMPLETED').length
    const cancelledCount = tokens.filter(t => t.status === 'CANCELLED').length
    const availableDoctors = allDoctors.filter(d => d.available).length
    
    return {
      currentToken,
      waitingCount,
      completedCount,
      cancelledCount,
      availableDoctors,
    }
  },
  
  getCurrentToken: () => {
    const { tokens } = get()
    return tokens.find(t => t.status === 'CURRENT') || null
  },
  
  getWaitingTokens: () => {
    const { tokens } = get()
    return tokens.filter(t => t.status === 'WAITING').sort((a, b) => a.tokenNumber - b.tokenNumber)
  },
  
  getCompletedTokens: () => {
    const { tokens } = get()
    return tokens.filter(t => t.status === 'COMPLETED').sort((a, b) => b.tokenNumber - a.tokenNumber)
  },
  
  getTokensByDoctor: (doctorId) => {
    const { tokens } = get()
    return tokens.filter(t => t.doctor.id === doctorId)
  },
}))
