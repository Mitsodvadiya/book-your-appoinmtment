'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { useQueueStore } from '@/lib/queue-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import {
  User,
  Phone,
  Calendar,
  Users,
  Search,
  ChevronRight,
  Clock,
  History,
} from 'lucide-react'
import type { Patient } from '@/lib/types'

export default function PatientsPage() {
  const patients = useQueueStore((state) => state.patients)
  const tokens = useQueueStore((state) => state.tokens)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)
  )
  
  const getPatientTokenHistory = (patientId: string) => {
    return tokens.filter(t => t.patient.id === patientId)
  }

  return (
    <div className="flex flex-col">
      <Header 
        title="Patients" 
        subtitle="Manage patient records and history"
      />
      
      <div className="flex-1 p-6">
        {/* Search and Stats */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patients by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring md:w-80"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Patients:</span>
              <span className="font-semibold text-foreground">{patients.length}</span>
            </div>
          </div>
        </div>
        
        {/* Patients Table */}
        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Age
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Gender
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Last Visit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Total Visits
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-muted/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-foreground">{patient.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                      {patient.phone}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-foreground">
                      {patient.age} years
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-foreground">
                      {patient.gender}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-foreground">
                      {patient.lastVisit
                        ? format(patient.lastVisit, 'MMM dd, yyyy')
                        : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {patient.totalVisits}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPatients.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No patients found matching your search
            </div>
          )}
        </div>
      </div>
      
      {/* Patient Details Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              View patient information and visit history.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {selectedPatient.name}
                  </h3>
                  <p className="text-muted-foreground">
                    Patient since {format(selectedPatient.createdAt, 'MMMM yyyy')}
                  </p>
                </div>
              </div>
              
              {/* Patient Details Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{selectedPatient.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="font-medium text-foreground">{selectedPatient.age} years</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="font-medium text-foreground">{selectedPatient.gender}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Last Visit</p>
                    <p className="font-medium text-foreground">
                      {selectedPatient.lastVisit
                        ? format(selectedPatient.lastVisit, 'MMM dd, yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Visit History */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <History className="h-4 w-4" />
                  Token History
                </h4>
                
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {getPatientTokenHistory(selectedPatient.id).length > 0 ? (
                    getPatientTokenHistory(selectedPatient.id).map((token) => (
                      <div
                        key={token.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                            {token.tokenNumber}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {token.service.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {token.doctor.name}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            token.status === 'COMPLETED'
                              ? 'bg-success/10 text-success'
                              : token.status === 'CURRENT'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {token.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-muted-foreground">
                      No token history available
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
