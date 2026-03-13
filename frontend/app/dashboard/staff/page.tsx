'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { useQueueStore } from '@/lib/queue-store'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { staff } from '@/lib/mock-data'
import {
  User,
  Mail,
  Phone,
  Shield,
  UserCog,
  Stethoscope,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StaffPage() {
  const doctors = useQueueStore((state) => state.doctors)
  const [localDoctors, setLocalDoctors] = useState(doctors)

  const toggleDoctorAvailability = (doctorId: string) => {
    setLocalDoctors((prev) =>
      prev.map((d) =>
        d.id === doctorId ? { ...d, available: !d.available } : d
      )
    )
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Staff Management"
        subtitle="Manage doctors and clinic staff"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Doctors Section */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Doctors</h3>
            </div>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-2">
            {localDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className={cn(
                  'rounded-lg border p-4 transition-colors',
                  doctor.available
                    ? 'border-success/20 bg-success/5'
                    : 'border-border bg-muted/30'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full',
                        doctor.available
                          ? 'bg-success/20 text-success'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {doctor.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {doctor.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-xs font-medium',
                        doctor.available ? 'text-success' : 'text-muted-foreground'
                      )}
                    >
                      {doctor.available ? 'Available' : 'Unavailable'}
                    </span>
                    <Switch
                      checked={doctor.available}
                      onCheckedChange={() => toggleDoctorAvailability(doctor.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Section */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Staff</h3>
            </div>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map((member) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-foreground">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                          member.role === 'Admin'
                            ? 'bg-primary/10 text-primary'
                            : member.role === 'Receptionist'
                            ? 'bg-info/10 text-info'
                            : 'bg-warning/10 text-warning'
                        )}
                      >
                        <Shield className="h-3 w-3" />
                        {member.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {member.email}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {member.phone}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                          member.active
                            ? 'bg-success/10 text-success'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {member.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
