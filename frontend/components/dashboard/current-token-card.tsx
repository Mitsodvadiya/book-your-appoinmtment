'use client'

import { useState } from 'react'
import { User, Stethoscope, Clock, ChevronRight, Phone, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useQueueStore } from '@/lib/queue-store'
import type { Token } from '@/lib/types'

interface CurrentTokenCardProps {
  token: Token | null
}

export function CurrentTokenCard({ token }: CurrentTokenCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const callNextToken = useQueueStore((state) => state.callNextToken)
  const getWaitingTokens = useQueueStore((state) => state.getWaitingTokens)
  
  const waitingTokens = getWaitingTokens()
  const hasWaiting = waitingTokens.length > 0

  if (!token) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground">Current Token</h3>
        <div className="mt-4 flex flex-col items-center justify-center gap-4 py-8">
          <p className="text-muted-foreground">No patient currently being served</p>
          {hasWaiting && (
            <Button onClick={callNextToken} className="gap-2">
              <ChevronRight className="h-4 w-4" />
              Call Next Patient
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">Current Token</h3>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {token.tokenNumber}
          </span>
        </div>
        
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="mt-6 w-full space-y-4 text-left transition-opacity hover:opacity-80"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <User className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="font-medium text-card-foreground">{token.patient.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Stethoscope className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Doctor</p>
              <p className="font-medium text-card-foreground">{token.doctor.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Clock className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Service</p>
              <p className="font-medium text-card-foreground">{token.service.name}</p>
            </div>
          </div>
          
          {token.notes && (
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm text-card-foreground">{token.notes}</p>
            </div>
          )}
        </button>
        
        <div className="mt-6 flex gap-3">
          <Button 
            onClick={callNextToken} 
            className="flex-1 gap-2"
            disabled={!hasWaiting}
          >
            <ChevronRight className="h-4 w-4" />
            Next Patient
          </Button>
        </div>
        
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Click on patient info to view details
        </p>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {token.tokenNumber}
              </span>
              Patient Details
            </DialogTitle>
            <DialogDescription>
              Complete information for the current patient.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Patient Information</h4>
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{token.patient.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{token.patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Age / Gender</p>
                    <p className="font-medium">{token.patient.age} years / {token.patient.gender}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Service Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Service Details</h4>
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor</p>
                    <p className="font-medium">{token.doctor.name}</p>
                    <p className="text-xs text-muted-foreground">{token.doctor.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p className="font-medium">{token.service.name}</p>
                    <p className="text-xs text-muted-foreground">Est. {token.service.estimatedTime} mins</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            {token.notes && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notes</h4>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-sm">{token.notes}</p>
                </div>
              </div>
            )}
            
            {/* Timestamps */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Timeline</h4>
              <div className="rounded-lg bg-secondary p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Token Created</span>
                  <span className="text-sm font-medium">
                    {token.createdAt.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
