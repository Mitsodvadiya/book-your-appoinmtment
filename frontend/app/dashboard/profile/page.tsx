'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  Save,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { useProfile, useUpdateProfile } from '@/hooks/use-user'

export default function ProfilePage() {
  const { user: authUser } = useAuthStore()
  const { data: profile, isLoading: isLoadingProfile } = useProfile()
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  useEffect(() => {
    if (profile?.data) {
      setFormData({
        name: profile.data.name || '',
        phone: profile.data.phone || '',
      })
    }
  }, [profile])

  const hasChanges = profile?.data && (
    formData.name.trim() !== profile.data.name || 
    formData.phone.trim() !== profile.data.phone
  )

  const handleSave = () => {
    if (!hasChanges) return;

    updateProfile(formData, {
      onSuccess: () => {
        toast({
          title: "Profile updated",
          description: "Your personal information has been saved successfully.",
        })
      },
      onError: (err: any) => {
        toast({
          title: "Update failed",
          description: err.response?.data?.message || "Something went wrong while saving your profile.",
          variant: "destructive"
        })
      }
    })
  }

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col h-full">
        <Header title="My Profile" subtitle="Manage your personal information" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="My Profile"
        subtitle="Manage your personal information"
      />

      <div className="flex-1 space-y-6 p-6 max-w-4xl max-h-screen overflow-y-auto">
        
        {/* Profile Card */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-4 border-b border-border p-6 bg-muted/30">
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-md">
              {formData.name.charAt(0).toUpperCase() || authUser?.name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {formData.name || authUser?.name || 'User'}
              </h2>
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="uppercase tracking-wide text-xs">{(profile?.data?.role || authUser?.role || 'User').replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Details
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" /> 
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-11 bg-input/50"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" /> 
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="h-11 bg-input/50"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <hr className="border-border my-8" />

            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              Account Credentials
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" /> 
                  Email Address
                </Label>
                <div className="h-11 w-full rounded-md border border-input bg-muted/60 px-3 py-2.5 text-sm cursor-not-allowed text-muted-foreground flex items-center shadow-sm">
                  {profile?.data?.email || authUser?.email || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground/80 mt-1">Email cannot be changed.</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> 
                  Account Role
                </Label>
                <div className="h-11 w-full rounded-md border border-input bg-muted/60 px-3 py-2.5 text-sm cursor-not-allowed text-muted-foreground flex items-center shadow-sm capitalize">
                  {(profile?.data?.role || authUser?.role || 'User').replace('_', ' ').toLowerCase()}
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="border-t border-border bg-muted/30 p-6 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving || !hasChanges} size="lg" className="min-w-[140px]">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
