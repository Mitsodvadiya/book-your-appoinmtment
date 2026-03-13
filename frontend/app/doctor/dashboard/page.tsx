'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { useQueueStore } from '@/lib/queue-store'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  Users,
  FileText,
} from 'lucide-react'

export default function DoctorDashboardPage() {
  const doctors = useQueueStore((state) => state.doctors)
  const tokens = useQueueStore((state) => state.tokens)
  const completeToken = useQueueStore((state) => state.completeToken)
  const callNextToken = useQueueStore((state) => state.callNextToken)
  
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '')
  
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId)
  const doctorTokens = tokens.filter(t => t.doctor.id === selectedDoctorId)
  const currentToken = doctorTokens.find(t => t.status === 'CURRENT')
  const waitingTokens = doctorTokens.filter(t => t.status === 'WAITING').sort((a, b) => a.tokenNumber - b.tokenNumber)
  const completedTokens = doctorTokens.filter(t => t.status === 'COMPLETED')
  
  const handleComplete = () => {
    if (currentToken) {
      completeToken(currentToken.id)
    }
  }
  
  const handleNextPatient = () => {
    if (currentToken) {
      completeToken(currentToken.id)
    }
    // Find and set next waiting token as current
    if (waitingTokens.length > 0) {
      callNextToken()
    }
  }

  return (
    <div className="flex flex-col">
      <Header 
        title="Doctor Dashboard" 
        subtitle={selectedDoctor ? `${selectedDoctor.name} - ${selectedDoctor.specialty}` : 'Select a doctor'}
      />
      
      <div className="flex-1 p-6">
        {/* Doctor Selection */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Select Doctor
          </label>
          <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.filter(d => d.available).map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Stats Row */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-xl font-bold">
                {currentToken?.tokenNumber ?? '-'}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Token</p>
              <p className="font-semibold text-foreground">
                {currentToken?.patient.name ?? 'No patient'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/20 text-warning">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Waiting</p>
              <p className="text-2xl font-bold text-foreground">{waitingTokens.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/20 text-success">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Today</p>
              <p className="text-2xl font-bold text-foreground">{completedTokens.length}</p>
            </div>
          </div>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Patient */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="text-lg font-semibold text-foreground">Current Patient</h3>
            </div>
            
            {currentToken ? (
              <div className="p-6">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-foreground">
                      {currentToken.patient.name}
                    </h4>
                    <p className="text-muted-foreground">
                      Token #{currentToken.tokenNumber}
                    </p>
                  </div>
                </div>
                
                <div className="mb-6 grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Age</p>
                      <p className="font-medium text-foreground">{currentToken.patient.age} years</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="font-medium text-foreground">{currentToken.patient.gender}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{currentToken.patient.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Service</p>
                      <p className="font-medium text-foreground">{currentToken.service.name}</p>
                    </div>
                  </div>
                </div>
                
                {currentToken.notes && (
                  <div className="mb-6 rounded-lg bg-warning/10 p-4">
                    <div className="mb-2 flex items-center gap-2 text-warning">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">Notes</span>
                    </div>
                    <p className="text-foreground">{currentToken.notes}</p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleComplete}
                    className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Consultation
                  </Button>
                  <Button
                    onClick={handleNextPatient}
                    className="flex-1"
                    disabled={waitingTokens.length === 0}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Call Next Patient
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mb-4 text-muted-foreground">No patient currently being served</p>
                <Button
                  onClick={handleNextPatient}
                  disabled={waitingTokens.length === 0}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Call Next Patient
                </Button>
              </div>
            )}
          </div>
          
          {/* Waiting Queue */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="text-lg font-semibold text-foreground">
                Waiting Queue ({waitingTokens.length})
              </h3>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto p-4">
              {waitingTokens.length > 0 ? (
                <div className="space-y-3">
                  {waitingTokens.map((token, index) => (
                    <div
                      key={token.id}
                      className={`flex items-center justify-between rounded-lg border p-4 ${
                        index === 0
                          ? 'border-primary/20 bg-primary/5'
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                            index === 0
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          {token.tokenNumber}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{token.patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {token.service.name}
                          </p>
                        </div>
                      </div>
                      {index === 0 && (
                        <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                          Next
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  No patients waiting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
