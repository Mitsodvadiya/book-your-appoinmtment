'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQueueStore } from '@/lib/queue-store'
import { Plus, CheckCircle } from 'lucide-react'
import type { Patient } from '@/lib/types'

export function NewPatientDialog() {
  const [open, setOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newTokenNumber, setNewTokenNumber] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '' as 'Male' | 'Female' | 'Other' | '',
    doctorId: '',
    serviceId: '',
    notes: '',
  })
  
  const doctors = useQueueStore((state) => state.doctors)
  const services = useQueueStore((state) => state.services)
  const patients = useQueueStore((state) => state.patients)
  const addToken = useQueueStore((state) => state.addToken)
  
  const availableDoctors = doctors.filter(d => d.available)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const selectedDoctor = doctors.find(d => d.id === formData.doctorId)
    const selectedService = services.find(s => s.id === formData.serviceId)
    
    if (!selectedDoctor || !selectedService || !formData.name || !formData.phone) {
      return
    }
    
    // Check if patient exists
    let patient = patients.find(p => p.phone === formData.phone)
    
    if (!patient) {
      patient = {
        id: String(Date.now()),
        name: formData.name,
        phone: formData.phone,
        age: parseInt(formData.age) || 0,
        gender: (formData.gender || 'Other') as 'Male' | 'Female' | 'Other',
        totalVisits: 1,
        createdAt: new Date(),
      }
    }
    
    const token = addToken(patient, selectedDoctor, selectedService, formData.notes || undefined)
    setNewTokenNumber(token.tokenNumber)
    setShowSuccess(true)
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      age: '',
      gender: '',
      doctorId: '',
      serviceId: '',
      notes: '',
    })
    
    // Close success after 2 seconds
    setTimeout(() => {
      setShowSuccess(false)
      setOpen(false)
    }, 2000)
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-foreground">Token Generated!</h3>
            <p className="mt-2 text-muted-foreground">Token Number</p>
            <span className="mt-1 text-4xl font-bold text-primary">{newTokenNumber}</span>
            <p className="mt-4 text-sm text-muted-foreground">Patient added to queue</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Register a new patient and generate a token for the queue.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Patient Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-input px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter patient name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-input px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-input px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter age"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Gender</label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value as 'Male' | 'Female' | 'Other' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Service <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData.serviceId}
                    onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} ({service.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Doctor <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-[80px] w-full rounded-md border border-input bg-input px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Add any notes or symptoms..."
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Generate Token</Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
