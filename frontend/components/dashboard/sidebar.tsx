'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ListOrdered,
  Users,
  UserCog,
  Settings,
  Stethoscope,
  Activity,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { useLogout } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Queue', href: '/dashboard/queue', icon: ListOrdered },
  { name: 'Patients', href: '/dashboard/patients', icon: Users },
  { name: 'Staff', href: '/dashboard/staff', icon: UserCog },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const doctorNav = [
  { name: 'Doctor View', href: '/doctor/dashboard', icon: Stethoscope },
]

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Activity className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold text-sidebar-foreground">ClinicQueue</span>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        <div className="mb-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Main
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
        
        <div>
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Doctor
          </p>
          {doctorNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
      
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col justify-center overflow-hidden">
                <p className="truncate text-sm font-medium leading-none text-foreground">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground uppercase tracking-wider font-bold">{(user as any)?.roleInClinic || user?.role}</p>
              </div>
            </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => logout()}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
