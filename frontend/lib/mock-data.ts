import type { Patient, Doctor, Service, Token, Staff } from './types'

export const doctors: Doctor[] = [
  { id: '1', name: 'Dr. Mehta', specialty: 'General Medicine', available: true },
  { id: '2', name: 'Dr. Sharma', specialty: 'Pediatrics', available: true },
  { id: '3', name: 'Dr. Patel', specialty: 'Orthopedics', available: false },
  { id: '4', name: 'Dr. Gupta', specialty: 'Dermatology', available: true },
]

export const services: Service[] = [
  { id: '1', name: 'Consultation', duration: 15 },
  { id: '2', name: 'Follow-up', duration: 10 },
  { id: '3', name: 'Check-up', duration: 20 },
  { id: '4', name: 'Vaccination', duration: 10 },
]

export const patients: Patient[] = [
  { id: '1', name: 'Rahul Patel', phone: '9876543210', age: 45, gender: 'Male', totalVisits: 5, lastVisit: new Date('2024-03-10'), createdAt: new Date('2024-01-01') },
  { id: '2', name: 'Amit Shah', phone: '9876543211', age: 32, gender: 'Male', totalVisits: 3, lastVisit: new Date('2024-03-08'), createdAt: new Date('2024-02-15') },
  { id: '3', name: 'Kiran Patel', phone: '9876543212', age: 28, gender: 'Female', totalVisits: 2, lastVisit: new Date('2024-03-05'), createdAt: new Date('2024-03-01') },
  { id: '4', name: 'Rakesh Kumar', phone: '9876543213', age: 55, gender: 'Male', totalVisits: 8, lastVisit: new Date('2024-03-09'), createdAt: new Date('2023-12-01') },
  { id: '5', name: 'Priya Singh', phone: '9876543214', age: 24, gender: 'Female', totalVisits: 1, lastVisit: new Date('2024-03-11'), createdAt: new Date('2024-03-11') },
  { id: '6', name: 'Suresh Yadav', phone: '9876543215', age: 40, gender: 'Male', totalVisits: 4, lastVisit: new Date('2024-03-07'), createdAt: new Date('2024-01-20') },
  { id: '7', name: 'Meena Devi', phone: '9876543216', age: 60, gender: 'Female', totalVisits: 12, lastVisit: new Date('2024-03-06'), createdAt: new Date('2023-06-01') },
  { id: '8', name: 'Vikram Joshi', phone: '9876543217', age: 35, gender: 'Male', totalVisits: 2, lastVisit: new Date('2024-03-04'), createdAt: new Date('2024-02-28') },
]

export const initialTokens: Token[] = [
  {
    id: '1',
    tokenNumber: 9,
    patient: patients[6],
    doctor: doctors[0],
    service: services[0],
    status: 'COMPLETED',
    createdAt: new Date(),
    completedAt: new Date(),
  },
  {
    id: '2',
    tokenNumber: 10,
    patient: patients[7],
    doctor: doctors[0],
    service: services[0],
    status: 'COMPLETED',
    createdAt: new Date(),
    completedAt: new Date(),
  },
  {
    id: '3',
    tokenNumber: 11,
    patient: patients[3],
    doctor: doctors[0],
    service: services[1],
    status: 'COMPLETED',
    createdAt: new Date(),
    completedAt: new Date(),
  },
  {
    id: '4',
    tokenNumber: 12,
    patient: patients[0],
    doctor: doctors[0],
    service: services[0],
    status: 'CURRENT',
    notes: 'Fever and cold symptoms',
    createdAt: new Date(),
  },
  {
    id: '5',
    tokenNumber: 13,
    patient: patients[1],
    doctor: doctors[0],
    service: services[0],
    status: 'WAITING',
    createdAt: new Date(),
  },
  {
    id: '6',
    tokenNumber: 14,
    patient: patients[2],
    doctor: doctors[0],
    service: services[0],
    status: 'WAITING',
    createdAt: new Date(),
  },
  {
    id: '7',
    tokenNumber: 15,
    patient: patients[4],
    doctor: doctors[1],
    service: services[2],
    status: 'WAITING',
    createdAt: new Date(),
  },
  {
    id: '8',
    tokenNumber: 16,
    patient: patients[5],
    doctor: doctors[0],
    service: services[0],
    status: 'WAITING',
    createdAt: new Date(),
  },
]

export const staff: Staff[] = [
  { id: '1', name: 'Anjali Verma', role: 'Admin', email: 'anjali@clinic.com', phone: '9876543220', active: true },
  { id: '2', name: 'Ravi Kumar', role: 'Receptionist', email: 'ravi@clinic.com', phone: '9876543221', active: true },
  { id: '3', name: 'Sunita Devi', role: 'Nurse', email: 'sunita@clinic.com', phone: '9876543222', active: true },
  { id: '4', name: 'Mohan Singh', role: 'Receptionist', email: 'mohan@clinic.com', phone: '9876543223', active: false },
]
