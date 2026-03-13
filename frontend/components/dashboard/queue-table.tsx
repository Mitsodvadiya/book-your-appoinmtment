'use client'

import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useQueueStore } from '@/lib/queue-store'
import type { Token, TokenStatus } from '@/lib/types'

interface QueueTableProps {
  tokens: Token[]
  limit?: number
  showNextButton?: boolean
}

const statusStyles: Record<TokenStatus, string> = {
  WAITING: 'bg-info/10 text-info border-info/20',
  CURRENT: 'bg-primary/10 text-primary border-primary/20',
  COMPLETED: 'bg-success/10 text-success border-success/20',
  CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20',
  SKIPPED: 'bg-warning/10 text-warning border-warning/20',
}

export function QueueTable({ tokens, limit, showNextButton = true }: QueueTableProps) {
  const displayTokens = limit ? tokens.slice(0, limit) : tokens
  const callNextToken = useQueueStore((state) => state.callNextToken)
  const getCurrentToken = useQueueStore((state) => state.getCurrentToken)
  
  const currentToken = getCurrentToken()
  const waitingTokens = tokens.filter(t => t.status === 'WAITING')
  const hasWaiting = waitingTokens.length > 0

  return (
    <div className="rounded-lg border border-border bg-card">
      {showNextButton && hasWaiting && (
        <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-6 py-3">
          <span className="text-sm text-muted-foreground">
            {currentToken ? `Current: Token #${currentToken.tokenNumber}` : 'No current patient'}
          </span>
          <Button onClick={callNextToken} size="sm" className="gap-2">
            <ChevronRight className="h-4 w-4" />
            {currentToken ? 'Next Patient' : 'Call First Patient'}
          </Button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Token
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Patient
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Doctor
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Service
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayTokens.map((token) => (
              <tr key={token.id} className="hover:bg-muted/50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                    {token.tokenNumber}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <p className="font-medium text-card-foreground">{token.patient.name}</p>
                    <p className="text-sm text-muted-foreground">{token.patient.phone}</p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-card-foreground">
                  {token.doctor.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-card-foreground">
                  {token.service.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                      statusStyles[token.status]
                    )}
                  >
                    {token.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {displayTokens.length === 0 && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          No tokens in queue
        </div>
      )}
    </div>
  )
}
