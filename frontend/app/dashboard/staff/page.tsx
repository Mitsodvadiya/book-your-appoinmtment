'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Mail,
  Phone,
  Shield,
  UserCog,
  Stethoscope,
  Plus,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/auth-store'
import { useClinicStaff, useAddStaff, useUpdateStaffStatus } from '@/hooks/use-staff'
import { useToast } from '@/hooks/use-toast'

export default function StaffPage() {
  const { clinic, user } = useAuthStore()
  const { toast } = useToast()
  
  // Real Data Hooks
  const { data: members = [], isLoading: isFetching } = useClinicStaff(clinic?.id || '')
  const { mutate: addStaff, isPending: isAdding } = useAddStaff(clinic?.id || '')
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateStaffStatus(clinic?.id || '')

  // Modals
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)

  // Forms
  const [doctorForm, setDoctorForm] = useState({ name: '', email: '', phone: '', specialization: '', duration: 15, maxTokens: 40 })
  const [staffForm, setStaffForm] = useState({ name: '', email: '', phone: '', role: 'STAFF' })

  // Data Selectors
  const doctors = members.filter(m => m.role === 'DOCTOR')
  const generalStaff = members.filter(m => m.role !== 'DOCTOR')

  const toggleStatus = (userId: string, currentStatus: boolean) => {
    updateStatus({ userId, isActive: !currentStatus }, {
      onSuccess: () => {
        toast({ title: "Status Updated", description: "The member's active status has been changed." })
      },
      onError: (err: any) => {
        toast({ title: "Update Failed", description: err.response?.data?.message || "Failed to update status", variant: "destructive" })
      }
    })
  }

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctorForm.name || !doctorForm.email || !doctorForm.phone || !doctorForm.specialization) {
      toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    addStaff({
      name: doctorForm.name,
      email: doctorForm.email,
      phone: doctorForm.phone,
      role: 'DOCTOR',
      specialization: doctorForm.specialization,
      consultationDuration: Number(doctorForm.duration),
      maxTokensPerDay: Number(doctorForm.maxTokens)
    }, {
      onSuccess: () => {
        setIsDoctorModalOpen(false)
        setDoctorForm({ name: '', email: '', phone: '', specialization: '', duration: 15, maxTokens: 40 })
        toast({ title: "Doctor Added", description: `${doctorForm.name} was successfully invited.` })
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.response?.data?.message || "Failed to add doctor", variant: "destructive" })
      }
    })
  }

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!staffForm.name || !staffForm.email || !staffForm.phone) {
      toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    addStaff({
      name: staffForm.name,
      email: staffForm.email,
      phone: staffForm.phone,
      role: staffForm.role,
    }, {
      onSuccess: () => {
        setIsStaffModalOpen(false)
        setStaffForm({ name: '', email: '', phone: '', role: 'STAFF' })
        toast({ title: "Staff Added", description: `${staffForm.name} was successfully invited.` })
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.response?.data?.message || "Failed to add staff member", variant: "destructive" })
      }
    })
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Staff Management"
        subtitle="Manage doctors and clinic staff"
      />

      <div className="flex-1 space-y-6 p-6 max-h-screen overflow-y-auto">
        
        {isFetching ? (
           <div className="flex h-40 items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
        ) : (
          <>
            {/* Doctors Section */}
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Active Doctors ({doctors.length})</h3>
                </div>
                <Button size="sm" onClick={() => setIsDoctorModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Doctor
                </Button>
              </div>

              {doctors.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border-b border-border/50 bg-background/50">
                   No doctors have been invited to this clinic yet.
                </div>
              ) : (
                <div className="grid gap-4 p-4 md:grid-cols-2">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={cn(
                        'rounded-lg border p-4 transition-colors',
                        doctor.isActive
                          ? 'border-success/20 bg-success/5'
                          : 'border-border bg-muted/30'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-12 w-12 items-center justify-center rounded-full',
                              doctor.isActive
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
                              {doctor.doctorProfile?.specialization || 'General'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-xs font-medium',
                              doctor.isActive ? 'text-success' : 'text-muted-foreground'
                            )}
                          >
                            {doctor.isActive ? 'Active' : 'Disabled'}
                          </span>
                          {doctor.userId !== user?.id && (
                            <Switch
                              checked={doctor.isActive}
                              onCheckedChange={() => toggleStatus(doctor.userId, doctor.isActive)}
                              disabled={isUpdatingStatus}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Staff Section */}
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Support Staff ({generalStaff.length})</h3>
                </div>
                <Button size="sm" onClick={() => setIsStaffModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Staff
                </Button>
              </div>

              {generalStaff.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground bg-background/50">
                   No support staff members have been invited.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/10">
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
                      {generalStaff.map((member) => (
                        <tr
                          key={member.id}
                          className="transition-colors hover:bg-muted/30"
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
                                member.role === 'CLINIC_ADMIN'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-info/10 text-info'
                              )}
                            >
                              <Shield className="h-3 w-3" />
                              {member.role.replace('_', ' ')}
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
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                                  member.isActive
                                    ? 'bg-success/10 text-success'
                                    : 'bg-muted text-muted-foreground'
                                )}
                              >
                                {member.isActive ? 'Active' : 'Disabled'}
                              </span>
                              {member.userId !== user?.id && member.role !== 'CLINIC_ADMIN' && (
                                <Switch
                                  checked={member.isActive}
                                  onCheckedChange={() => toggleStatus(member.userId, member.isActive)}
                                  disabled={isUpdatingStatus}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Doctor Dialog */}
      <Dialog open={isDoctorModalOpen} onOpenChange={setIsDoctorModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Doctor</DialogTitle>
            <DialogDescription>
              Add a new physician to this clinic. They will receive an email instruction.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDoctor} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="doc-name">Full Name</Label>
              <Input id="doc-name" value={doctorForm.name} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} placeholder="Dr. Jane Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-email">Email</Label>
              <Input id="doc-email" type="email" value={doctorForm.email} onChange={e => setDoctorForm({...doctorForm, email: e.target.value})} placeholder="doctor@clinic.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-phone">Phone</Label>
              <Input id="doc-phone" type="tel" value={doctorForm.phone} onChange={e => setDoctorForm({...doctorForm, phone: e.target.value})} placeholder="+1234567890" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-spec">Specialization</Label>
              <Input id="doc-spec" value={doctorForm.specialization} onChange={e => setDoctorForm({...doctorForm, specialization: e.target.value})} placeholder="Cardiologist" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doc-dur">Consult Mins</Label>
                <Input id="doc-dur" type="number" min="5" value={doctorForm.duration} onChange={e => setDoctorForm({...doctorForm, duration: e.target.valueAsNumber})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-tokens">Max Tokens/Day</Label>
                <Input id="doc-tokens" type="number" min="1" value={doctorForm.maxTokens} onChange={e => setDoctorForm({...doctorForm, maxTokens: e.target.valueAsNumber})} required />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDoctorModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null} 
                Send Invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Staff</DialogTitle>
            <DialogDescription>
              Add a new support staff member or administrative assistant.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStaff} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Assigned Role</Label>
              <Select value={staffForm.role} onValueChange={v => setStaffForm({...staffForm, role: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF">Standard Staff (Reception)</SelectItem>
                  <SelectItem value="CLINIC_ADMIN">Clinic Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-name">Full Name</Label>
              <Input id="staff-name" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} placeholder="John Smith" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-email">Email</Label>
              <Input id="staff-email" type="email" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} placeholder="john@clinic.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-phone">Phone</Label>
              <Input id="staff-phone" type="tel" value={staffForm.phone} onChange={e => setStaffForm({...staffForm, phone: e.target.value})} placeholder="+1234567890" required />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsStaffModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isAdding}>
                 {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null} 
                 Send Invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
