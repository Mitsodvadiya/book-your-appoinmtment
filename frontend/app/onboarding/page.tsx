'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Stethoscope,
  Building2,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/lib/auth-store'
import { useCreateClinic, useSaveWorkingHours, useAddDoctor } from '@/hooks/use-onboarding'
import { useToast } from '@/hooks/use-toast'
import type { Clinic } from '@/lib/types'

const steps = [
  { id: 1, title: 'Clinic Info', icon: Building2 },
  { id: 2, title: 'Working Hours', icon: Clock },
  { id: 3, title: 'Team Setup', icon: Users },
  { id: 4, title: 'Complete', icon: CheckCircle2 },
]

const specializations = [
  'General Practice',
  'Dental',
  'Pediatrics',
  'Dermatology',
  'Cardiology',
  'Orthopedics',
  'Ophthalmology',
  'ENT',
  'Gynecology',
  'Neurology',
  'Psychiatry',
  'Other'
]

const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, setClinic } = useAuthStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Store the created clinic locally (NOT in Zustand) so RouteGuard doesn't redirect mid-flow
  const [createdClinic, setCreatedClinic] = useState<any>(null)
  
  // Clinic Info
  const [clinicName, setClinicName] = useState('')
  const [clinicEmail, setClinicEmail] = useState('')
  const [clinicPhone, setClinicPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  
  // Working Hours
  const [openTime, setOpenTime] = useState('09:00')
  const [closeTime, setCloseTime] = useState('18:00')
  const [workingDays, setWorkingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
  
  // Team Setup
  const [doctorCount, setDoctorCount] = useState('1')
  const [staffCount, setStaffCount] = useState('1')

  // Hooks
  const createClinic = useCreateClinic()
  const saveWorkingHours = useSaveWorkingHours()
  const addDoctor = useAddDoctor()

  const toggleDay = (day: string) => {
    setWorkingDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      setIsSubmitting(true)
      createClinic.mutate({
        name: clinicName,
        email: clinicEmail || user?.email,
        phone: clinicPhone,
        address,
        city,
        state,
        country: 'India',
      }, {
        onSuccess: (data) => {
          // Save to local state ONLY — NOT Zustand — to prevent RouteGuard redirect
          setCreatedClinic(data.data)
          setIsSubmitting(false)
          setCurrentStep(2)
        },
        onError: (err: any) => {
          setIsSubmitting(false)
          toast({
            title: 'Error',
            description: err.response?.data?.message || 'Failed to create clinic',
            variant: 'destructive',
          })
        }
      })
    } else if (currentStep === 2) {
      if (!createdClinic) return
      setIsSubmitting(true)
      
      const dayMap: Record<string, number> = {
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7
      }
      
      const schedules = [1, 2, 3, 4, 5, 6, 7].map(day => {
        const isActive = workingDays.map(d => dayMap[d]).includes(day);
        return {
           dayOfWeek: day,
           startTime: openTime,
           endTime: closeTime,
           isActive: isActive
        };
      });

      saveWorkingHours.mutate({
        clinicId: createdClinic.id,
        schedules
      }, {
        onSuccess: () => {
          setIsSubmitting(false)
          setCurrentStep(3)
        },
        onError: (err: any) => {
          setIsSubmitting(false)
          toast({
            title: 'Error',
            description: err.response?.data?.message || 'Failed to save working hours',
            variant: 'destructive',
          })
        }
      })
    } else if (currentStep === 3) {
      // Team setup is informational - just proceed to final step
      setCurrentStep(4)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = async () => {
    // Now save to Zustand so RouteGuard allows dashboard access
    if (createdClinic) {
      setClinic(createdClinic)
    }
    router.push('/dashboard')
  }

  const isStep1Valid = clinicName
  const isStep2Valid = openTime && closeTime && workingDays.length > 0

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r lg:border-border lg:bg-card/50">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">ClinicQueue</span>
        </div>
        
        <div className="flex-1 px-6 py-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Setup Progress
          </h2>
          
          <nav className="mt-6 space-y-2">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep
              const isComplete = step.id < currentStep
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : isComplete
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isComplete
                        ? 'bg-primary/20 text-primary'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Step {step.id} of {steps.length}
                    </p>
                  </div>
                </div>
              )
            })}
          </nav>
        </div>
        
        <div className="border-t border-border p-6">
          <p className="text-sm text-muted-foreground">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@clinicqueue.com" className="text-primary hover:underline">
              support@clinicqueue.com
            </a>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">ClinicQueue</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
        </div>

        {/* Progress Bar (Mobile) */}
        <div className="lg:hidden h-1 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            {/* Step 1: Clinic Info */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    Tell us about your clinic
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    {"This information helps us personalize your experience."}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="clinicName">Clinic Name *</Label>
                      <Input
                        id="clinicName"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="City Medical Center"
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="clinicEmail">Email</Label>
                      <Input
                        id="clinicEmail"
                        type="email"
                        value={clinicEmail}
                        onChange={(e) => setClinicEmail(e.target.value)}
                        placeholder="contact@clinic.com"
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="clinicPhone">Phone</Label>
                      <Input
                        id="clinicPhone"
                        type="tel"
                        value={clinicPhone}
                        onChange={(e) => setClinicPhone(e.target.value)}
                        placeholder="+1 234 567 8900"
                        className="mt-2"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Medical Plaza"
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New York"
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="NY"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Working Hours */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    Set your working hours
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Configure when your clinic is open to patients.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="openTime">Opening Time</Label>
                      <Input
                        id="openTime"
                        type="time"
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="closeTime">Closing Time</Label>
                      <Input
                        id="closeTime"
                        type="time"
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Working Days</Label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {weekDays.map((day) => {
                        const isSelected = workingDays.includes(day)
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        )
                      })}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selected: {workingDays.length} days
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Team Setup */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    Set up your team
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    {"Tell us about your clinic's team size. You can add more later."}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="doctorCount">Number of Doctors</Label>
                      <Select value={doctorCount} onValueChange={setDoctorCount}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, '6+'].map((num) => (
                            <SelectItem key={num} value={String(num)}>
                              {num} {num === 1 ? 'doctor' : 'doctors'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="staffCount">Number of Staff</Label>
                      <Select value={staffCount} onValueChange={setStaffCount}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, '6+'].map((num) => (
                            <SelectItem key={num} value={String(num)}>
                              {num} staff {num === 1 ? 'member' : 'members'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card/50 p-6">
                    <h3 className="font-semibold text-foreground">What you can do after setup:</h3>
                    <ul className="mt-4 space-y-3">
                      {[
                        'Add individual doctors with their specializations',
                        'Create staff accounts for receptionists and nurses',
                        'Configure services and consultation types',
                        'Set up notifications and alerts'
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && (
              <div className="space-y-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    {"You're all set!"}
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Your clinic is ready to start managing patients.
                  </p>
                </div>

                <div className="mx-auto max-w-sm rounded-xl border border-border bg-card p-6 text-left">
                  <h3 className="font-semibold text-foreground">Clinic Summary</h3>
                  <dl className="mt-4 space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Name</dt>
                      <dd className="text-sm font-medium text-foreground">{clinicName || 'Not set'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Hours</dt>
                      <dd className="text-sm font-medium text-foreground">{openTime} - {closeTime}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Working Days</dt>
                      <dd className="text-sm font-medium text-foreground">{workingDays.length} days</dd>
                    </div>
                  </dl>
                </div>

                <Button
                  size="lg"
                  className="gap-2"
                  onClick={handleComplete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        {currentStep < 4 && (
          <div className="border-t border-border bg-card/50 px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-2xl items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={
                  isSubmitting ||
                  (currentStep === 1 && !isStep1Valid) ||
                  (currentStep === 2 && !isStep2Valid)
                }
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {currentStep === 3 ? 'Review' : 'Continue'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
