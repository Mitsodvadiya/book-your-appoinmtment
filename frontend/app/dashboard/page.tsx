'use client'

import { Header } from '@/components/dashboard/header'
import { StatCard } from '@/components/dashboard/stat-card'
import { CurrentTokenCard } from '@/components/dashboard/current-token-card'
import { QueueTable } from '@/components/dashboard/queue-table'
import { useQueueStore } from '@/lib/queue-store'
import {
  Hash,
  Users,
  CheckCircle,
  XCircle,
  Stethoscope,
  Clock,
} from 'lucide-react'

export default function DashboardPage() {
  const tokens = useQueueStore((state) => state.tokens)
  const getStats = useQueueStore((state) => state.getStats)
  
  const stats = getStats()
  const activeTokens = tokens.filter(t => ['WAITING', 'CURRENT'].includes(t.status))

  return (
    <div className="flex flex-col">
      <Header 
        title="Dashboard Overview" 
        subtitle="Real-time clinic status and queue management"
      />
      
      <div className="flex-1 space-y-6 p-6">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Current Token"
            value={stats.currentToken?.tokenNumber ?? '-'}
            subtitle={stats.currentToken?.patient.name}
            icon={Hash}
            variant="primary"
          />
          <StatCard
            title="Current Patient"
            value={stats.currentToken?.patient.name ?? '-'}
            subtitle={stats.currentToken?.doctor.name}
            icon={Users}
          />
          <StatCard
            title="Waiting Patients"
            value={stats.waitingCount}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Completed Today"
            value={stats.completedCount}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Cancelled"
            value={stats.cancelledCount}
            icon={XCircle}
            variant="destructive"
          />
          <StatCard
            title="Available Doctors"
            value={stats.availableDoctors}
            icon={Stethoscope}
          />
        </div>
        
        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Current Token Details */}
          <div className="lg:col-span-1">
            <CurrentTokenCard token={stats.currentToken} />
          </div>
          
          {/* Live Queue */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Live Queue</h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {activeTokens.length} active
              </span>
            </div>
            <QueueTable tokens={activeTokens} limit={10} />
          </div>
        </div>
      </div>
    </div>
  )
}
