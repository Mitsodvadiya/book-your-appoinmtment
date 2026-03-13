export type TokenStatus = 'WAITING' | 'CURRENT' | 'COMPLETED' | 'CANCELLED' | 'SKIPPED'

export interface Patient {
  id: string
  name: string
  phone: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  lastVisit?: Date
  totalVisits: number
  createdAt: Date
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  available: boolean
  avatar?: string
}

export interface Service {
  id: string
  name: string
  duration: number // in minutes
}

export interface Token {
  id: string
  tokenNumber: number
  patient: Patient
  doctor: Doctor
  service: Service
  status: TokenStatus
  notes?: string
  createdAt: Date
  completedAt?: Date
}

export interface Staff {
  id: string
  name: string
  role: 'Admin' | 'Receptionist' | 'Nurse'
  email: string
  phone: string
  active: boolean
}

export interface QueueStats {
  currentToken: Token | null
  waitingCount: number
  completedCount: number
  cancelledCount: number
  availableDoctors: number
}

export interface Clinic {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  specialization: string
  openTime: string
  closeTime: string
  workingDays: string[]
  logo?: string
  createdAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'staff' | 'doctor'
  clinicId: string
  avatar?: string
  createdAt: Date
  onboardingComplete: boolean
}
