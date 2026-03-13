import { Sidebar } from '@/components/dashboard/sidebar'
import { FirstTimeGuide } from '@/components/dashboard/first-time-guide'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <FirstTimeGuide />
    </div>
  )
}
