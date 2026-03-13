'use client'

import { Header } from '@/components/dashboard/header'
import { CurrentTokenCard } from '@/components/dashboard/current-token-card'
import { QueueTable } from '@/components/dashboard/queue-table'
import { NewPatientDialog } from '@/components/dashboard/new-patient-dialog'
import { TokenActions } from '@/components/dashboard/token-actions'
import { useQueueStore } from '@/lib/queue-store'
import { cn } from '@/lib/utils'
import { Clock, CheckCircle, XCircle, SkipForward } from 'lucide-react'

export default function QueuePage() {
  const tokens = useQueueStore((state) => state.tokens)
  const getCurrentToken = useQueueStore((state) => state.getCurrentToken)
  const getWaitingTokens = useQueueStore((state) => state.getWaitingTokens)
  const getCompletedTokens = useQueueStore((state) => state.getCompletedTokens)
  
  const currentToken = getCurrentToken()
  const waitingTokens = getWaitingTokens()
  const completedTokens = getCompletedTokens()
  const cancelledTokens = tokens.filter(t => t.status === 'CANCELLED' || t.status === 'SKIPPED')

  return (
    <div className="flex flex-col">
      <Header 
        title="Queue Management" 
        subtitle="Manage patient queue and tokens"
      />
      
      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-sm text-muted-foreground">Waiting:</span>
              <span className="font-semibold text-foreground">{waitingTokens.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm text-muted-foreground">Completed:</span>
              <span className="font-semibold text-foreground">{completedTokens.length}</span>
            </div>
          </div>
          <NewPatientDialog />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Current Token Section */}
          <div className="space-y-4">
            <CurrentTokenCard token={currentToken} />
            
            {currentToken && (
              <div className="rounded-lg border border-border bg-card p-4">
                <h4 className="mb-3 text-sm font-medium text-muted-foreground">Quick Actions</h4>
                <TokenActions tokenId={currentToken.id} />
              </div>
            )}
          </div>
          
          {/* Waiting Queue */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Clock className="h-5 w-5 text-warning" />
                Waiting Queue
              </h3>
              
              {waitingTokens.length > 0 ? (
                <div className="space-y-2">
                  {waitingTokens.map((token, index) => (
                    <div
                      key={token.id}
                      className={cn(
                        'flex items-center justify-between rounded-lg border border-border p-4 transition-colors',
                        index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-card hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                          {token.tokenNumber}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{token.patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {token.doctor.name} - {token.service.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            Next
                          </span>
                        )}
                        <button
                          onClick={() => useQueueStore.getState().cancelToken(token.id)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  No patients waiting in queue
                </div>
              )}
            </div>
            
            {/* Completed Today */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <CheckCircle className="h-5 w-5 text-success" />
                Completed Today
              </h3>
              
              {completedTokens.length > 0 ? (
                <div className="space-y-2">
                  {completedTokens.slice(0, 5).map((token) => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20 text-sm font-bold text-success">
                          {token.tokenNumber}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{token.patient.name}</p>
                          <p className="text-xs text-muted-foreground">{token.doctor.name}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                        Completed
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  No completed tokens yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
