'use client'

import { Button } from '@/components/ui/button'
import { useQueueStore } from '@/lib/queue-store'
import { CheckCircle, SkipForward, XCircle, ArrowRight } from 'lucide-react'

interface TokenActionsProps {
  tokenId: string
  showComplete?: boolean
  showSkip?: boolean
  showCancel?: boolean
  showNext?: boolean
}

export function TokenActions({
  tokenId,
  showComplete = true,
  showSkip = true,
  showCancel = true,
  showNext = true,
}: TokenActionsProps) {
  const completeToken = useQueueStore((state) => state.completeToken)
  const skipToken = useQueueStore((state) => state.skipToken)
  const cancelToken = useQueueStore((state) => state.cancelToken)
  const callNextToken = useQueueStore((state) => state.callNextToken)

  return (
    <div className="flex flex-wrap gap-2">
      {showComplete && (
        <Button
          onClick={() => completeToken(tokenId)}
          className="bg-success text-success-foreground hover:bg-success/90"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Complete
        </Button>
      )}
      
      {showNext && (
        <Button
          onClick={() => callNextToken()}
          variant="default"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Next Token
        </Button>
      )}
      
      {showSkip && (
        <Button
          onClick={() => skipToken(tokenId)}
          variant="outline"
          className="border-warning text-warning hover:bg-warning/10"
        >
          <SkipForward className="mr-2 h-4 w-4" />
          Skip
        </Button>
      )}
      
      {showCancel && (
        <Button
          onClick={() => cancelToken(tokenId)}
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      )}
    </div>
  )
}
