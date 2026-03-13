'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  Users,
  UserPlus,
  ListOrdered,
  Stethoscope,
  Settings,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lightbulb
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/auth-store'

interface GuideStep {
  id: number
  title: string
  description: string
  icon: React.ElementType
  targetPath: string
  tip: string
}

const guideSteps: GuideStep[] = [
  {
    id: 0,
    title: 'Welcome to ClinicQueue',
    description: 'Let\'s take a quick tour of your new clinic management dashboard. This guide will help you get started with the key features.',
    icon: Lightbulb,
    targetPath: '/dashboard',
    tip: 'You can restart this guide anytime from the Settings page.'
  },
  {
    id: 1,
    title: 'Dashboard Overview',
    description: 'This is your main dashboard where you can see real-time statistics about your clinic - current token, waiting patients, and today\'s summary.',
    icon: ListOrdered,
    targetPath: '/dashboard',
    tip: 'Click on the current token card to see full patient details.'
  },
  {
    id: 2,
    title: 'Queue Management',
    description: 'The Queue page is where you manage patient flow. Register new patients, generate tokens, and control the queue with actions like Next, Complete, or Skip.',
    icon: ListOrdered,
    targetPath: '/dashboard/queue',
    tip: 'Use the "New Patient" button to quickly register walk-in patients.'
  },
  {
    id: 3,
    title: 'Patient Records',
    description: 'Access complete patient records, search for existing patients, and view their visit history. All patient data is securely stored.',
    icon: Users,
    targetPath: '/dashboard/patients',
    tip: 'Click on any patient row to see their complete details and token history.'
  },
  {
    id: 4,
    title: 'Staff Management',
    description: 'Manage your doctors and staff here. Toggle doctor availability to control which doctors appear in the queue assignment.',
    icon: UserPlus,
    targetPath: '/dashboard/staff',
    tip: 'Mark doctors as unavailable during breaks to prevent new token assignments.'
  },
  {
    id: 5,
    title: 'Settings',
    description: 'Customize your clinic settings, update working hours, configure notifications, and adjust queue behavior to match your workflow.',
    icon: Settings,
    targetPath: '/dashboard/settings',
    tip: 'Review your clinic settings to ensure everything is correctly configured.'
  }
]

export function FirstTimeGuide() {
  const pathname = usePathname()
  const { showGuide, guideStep, setShowGuide, nextGuideStep, resetGuide } = useAuthStore()
  const [isVisible, setIsVisible] = useState(false)
  const [currentGuideStep, setCurrentGuideStep] = useState(guideStep)

  useEffect(() => {
    // Only show on dashboard pages
    if (showGuide && pathname?.startsWith('/dashboard')) {
      setIsVisible(true)
      setCurrentGuideStep(guideStep)
    } else {
      setIsVisible(false)
    }
  }, [showGuide, pathname, guideStep])

  const currentStep = guideSteps[currentGuideStep] || guideSteps[0]
  const isLastStep = currentGuideStep === guideSteps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      nextGuideStep()
      setCurrentGuideStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentGuideStep > 0) {
      setCurrentGuideStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    resetGuide()
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setShowGuide(false)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />

      {/* Guide Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Stethoscope className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Getting Started Guide</span>
            </div>
            <button
              onClick={handleDismiss}
              className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-4 pt-4">
            <div className="flex gap-1">
              {guideSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= currentGuideStep ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Step {currentGuideStep + 1} of {guideSteps.length}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <currentStep.icon className="h-7 w-7 text-primary" />
            </div>
            
            <h3 className="mt-4 text-xl font-semibold text-foreground">
              {currentStep.title}
            </h3>
            
            <p className="mt-2 text-muted-foreground">
              {currentStep.description}
            </p>

            {/* Tip */}
            <div className="mt-4 flex items-start gap-3 rounded-lg bg-primary/5 border border-primary/10 p-4">
              <Lightbulb className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm text-foreground">
                <span className="font-medium">Tip: </span>
                {currentStep.tip}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border p-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentGuideStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleDismiss}>
                Skip Tour
              </Button>
              <Button onClick={handleNext} className="gap-2">
                {isLastStep ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
