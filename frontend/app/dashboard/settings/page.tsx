'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTheme } from 'next-themes'
import {
  Building2,
  Bell,
  Palette,
  Save,
  User,
  ShieldCheck,
  Phone,
  Mail,
  Loader2,
  Clock,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { useToast } from '@/hooks/use-toast'
import { useProfile, useUpdateProfile } from '@/hooks/use-user'
import { useUpdateClinic, useWorkingHours, useUpdateWorkingHours } from '@/hooks/use-clinics'

export default function SettingsPage() {
  const { user: authUser, clinic } = useAuthStore()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  // Profile Hooks
  const { data: profileSnapshot } = useProfile()
  const { mutate: updateProfile, isPending: isSavingProfile } = useUpdateProfile()

  // Clinic Hooks
  const { mutate: updateClinic, isPending: isSavingClinic } = useUpdateClinic()
  const { data: workingHoursResponse } = useWorkingHours(clinic?.id)
  const { mutate: updateWorkingHours, isPending: isSavingWorkingHours } = useUpdateWorkingHours()

  // State Management
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [clinicForm, setClinicForm] = useState({ name: '', address: '' })
  type DailySchedule = { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean };
  const [weekSchedule, setWeekSchedule] = useState<DailySchedule[]>([])
  const [preferences, setPreferences] = useState({
    compactView: false,
    soundNotifications: true,
  })

  // Synchronization
  useEffect(() => {
    if (profileSnapshot?.data) {
      setProfileForm({ name: profileSnapshot.data.name || '', phone: profileSnapshot.data.phone || '' })
    }
    if (clinic) {
      setClinicForm({
        name: clinic.name || '',
        address: clinic.address || ''
      })
    }
  }, [profileSnapshot, clinic])

  useEffect(() => {
     if (workingHoursResponse?.data) {
        // Map backend response or generate defaults
        const backendSchedules: DailySchedule[] = workingHoursResponse.data;
        const defaultWeek: DailySchedule[] = [1, 2, 3, 4, 5, 6, 7].map(day => {
          const existing = backendSchedules.find(s => s.dayOfWeek === day);
          return existing ? { 
            dayOfWeek: day, 
            startTime: existing.startTime, 
            endTime: existing.endTime, 
            isActive: existing.isActive 
          } : { 
            dayOfWeek: day, 
            startTime: '09:00', 
            endTime: '17:00', 
            isActive: false // Default to closed if not explicitly saved
          };
        });
        setWeekSchedule(defaultWeek);
     }
  }, [workingHoursResponse])

  // Change Detectors
  const hasProfileChanges = profileSnapshot?.data && (profileForm.name !== profileSnapshot.data.name || profileForm.phone !== profileSnapshot.data.phone)
  const hasClinicChanges = clinic && (clinicForm.name !== clinic.name || clinicForm.address !== clinic.address)
  const hasTimeChanges = (() => {
    if (!workingHoursResponse?.data) return false;
    const backend = workingHoursResponse.data as DailySchedule[];
    // If lengths differ or we have unsaved default data against empty backend arrays
    if (backend.length === 0 && weekSchedule.some(s => s.isActive)) return true;

    // Check specific changes
    for (const schedule of weekSchedule) {
      const original = backend.find((b: any) => b.dayOfWeek === schedule.dayOfWeek);
      if (!original && schedule.isActive) return true; // new active day
      if (original && (
          original.isActive !== schedule.isActive || 
          (schedule.isActive && (original.startTime !== schedule.startTime || original.endTime !== schedule.endTime))
      )) return true;
    }
    return false;
  })();

  // Handlers
  const handleSaveProfile = () => {
    updateProfile(profileForm, {
      onSuccess: () => toast({ title: "Profile saved", description: "Successfully updated personal details." }),
      onError: (err: any) => toast({ title: "Update failed", description: err.response?.data?.message || "Failed to update profile.", variant: "destructive" })
    })
  }

  const handleSaveClinic = () => {
    if (!clinic) return
    
    if (hasClinicChanges) {
      updateClinic({ clinicId: clinic.id, data: clinicForm }, {
        onSuccess: () => toast({ title: "Clinic settings updated", description: "Successfully updated clinic identifiers." }),
        onError: (err: any) => toast({ title: "Update failed", description: err.response?.data?.message || "Failed to update clinic.", variant: "destructive" })
      })
    }

    if (hasTimeChanges) {
       updateWorkingHours({ 
          clinicId: clinic.id, 
          schedules: weekSchedule
       }, {
         onSuccess: () => toast({ title: "Working hours updated", description: "Successfully updated clinic operational hours." }),
         onError: (err: any) => toast({ title: "Update failed", description: err.response?.data?.message || "Failed to update working hours.", variant: "destructive" })
       })
    }
  }

  const handleSavePreferences = () => {
    localStorage.setItem('ui_preferences', JSON.stringify(preferences))
    toast({ title: "Preferences saved", description: "Your UI choices have been cached directly to your browser." })
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Settings Console"
        subtitle="Manage your profile, generic configurations, and clinic parameters."
      />

      <div className="flex-1 p-6 max-w-7xl w-full mx-auto overflow-y-auto space-y-6">
        <div className="grid gap-6 lg:grid-cols-2 items-start w-full">

          {/* ------------- PROFILE SECTION ------------- */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-4 border-b border-border p-6 bg-muted/20">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-sm">
                {profileForm.name.charAt(0).toUpperCase() || authUser?.name.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {profileForm.name || authUser?.name || 'User'}
                </h2>
                <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span className="uppercase tracking-wide">{(profileSnapshot?.data?.role || authUser?.role || 'User').replace('_', ' ')}</span>
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input id="name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="h-11 shadow-sm" />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input id="phone" type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="h-11 shadow-sm" />
                </div>

                <div className="space-y-3">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address (Locked)
                  </Label>
                  <div className="h-11 w-full rounded-md border border-input bg-muted/30 px-3 cursor-not-allowed text-muted-foreground flex items-center">
                    {profileSnapshot?.data?.email || authUser?.email || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-muted/10 p-5 flex justify-end rounded-b-xl">
              <Button onClick={handleSaveProfile} disabled={!hasProfileChanges || isSavingProfile}>
                {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Profile
              </Button>
            </div>
          </div>

          {/* ------------- PREFERENCES SECTION ------------- */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b border-border p-5 bg-muted/20">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Local Interface Configurations</h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-background">
                <div>
                  <h4 className="font-semibold text-foreground">Dark Mode Native Theme</h4>
                  <p className="text-sm text-muted-foreground">Force high-contrast system coloring overrides.</p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-background">
                <div>
                  <h4 className="font-semibold text-foreground">Compact Listing View</h4>
                  <p className="text-sm text-muted-foreground">Minimizes table padding for massive data arrays.</p>
                </div>
                <Switch checked={preferences.compactView} onCheckedChange={(c) => setPreferences({ ...preferences, compactView: c })} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-background">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    Chime Sound Triggers
                  </h4>
                  <p className="text-sm text-muted-foreground">Activates local audio queue progression rings.</p>
                </div>
                <Switch checked={preferences.soundNotifications} onCheckedChange={(c) => setPreferences({ ...preferences, soundNotifications: c })} />
              </div>
            </div>

            <div className="border-t border-border bg-muted/10 p-5 flex justify-end rounded-b-xl">
              <Button onClick={handleSavePreferences}>
                <Save className="mr-2 h-4 w-4" />
                Cache Settings
              </Button>
            </div>
          </div>
        </div>

        {/* ------------- CLINIC SECTION ------------- */}
        {(authUser as any)?.roleInClinic === 'CLINIC_ADMIN' && (
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b border-border p-5 bg-muted/20">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Clinic Information</h3>
            </div>

            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label>Clinic Name</Label>
                  <Input value={clinicForm.name} onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })} className="h-11 shadow-sm" />
                </div>
                <div className="space-y-3">
                  <Label>Operating Address</Label>
                  <Input value={clinicForm.address} onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })} className="h-11 shadow-sm" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-bold border-b border-border pb-2 text-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  Seven-Day Operating Schedules
                </h4>
                <div className="space-y-3">
                  {weekSchedule.map((schedule, index) => {
                    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    return (
                      <div key={schedule.dayOfWeek} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border ${schedule.isActive ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/10'} transition-colors`}>
                        <div className="flex items-center gap-3 mb-3 sm:mb-0 w-32">
                          <Switch 
                            checked={schedule.isActive}
                            onCheckedChange={(checked) => {
                              const newSchedule = [...weekSchedule];
                              newSchedule[index].isActive = checked;
                              setWeekSchedule(newSchedule);
                            }}
                          />
                          <Label className="font-semibold">{days[schedule.dayOfWeek === 7 ? 0 : schedule.dayOfWeek]}</Label>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-1 sm:justify-end transition-opacity" style={{ opacity: schedule.isActive ? 1 : 0.5 }}>
                          <Input 
                            type="time" 
                            value={schedule.startTime} 
                            disabled={!schedule.isActive}
                            onChange={(e) => {
                              const newSchedule = [...weekSchedule];
                              newSchedule[index].startTime = e.target.value;
                              setWeekSchedule(newSchedule);
                            }} 
                            className="h-10 w-[130px] shadow-sm text-sm" 
                          />
                          <span className="text-muted-foreground text-sm font-medium">to</span>
                          <Input 
                            type="time" 
                            value={schedule.endTime} 
                            disabled={!schedule.isActive}
                            onChange={(e) => {
                              const newSchedule = [...weekSchedule];
                              newSchedule[index].endTime = e.target.value;
                              setWeekSchedule(newSchedule);
                            }} 
                            className="h-10 w-[130px] shadow-sm text-sm" 
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-muted/10 p-5 flex justify-end rounded-b-xl">
              <Button onClick={handleSaveClinic} disabled={(!hasClinicChanges && !hasTimeChanges) || isSavingClinic || isSavingWorkingHours}>
                {isSavingClinic || isSavingWorkingHours ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Patch Clinic Parameters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
