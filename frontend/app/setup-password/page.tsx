'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Stethoscope, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useResetPassword } from '@/hooks/use-auth'

import { useToast } from '@/hooks/use-toast'

function SetupPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { mutate: resetPassword, isPending: isLoading } = useResetPassword()
  const { toast } = useToast()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!token) {
      setError('Invalid or missing setup token')
      return
    }
    
    // We re-use the secure reset auth tunnel but display it under an "Onboarding" UI context
    resetPassword({ token, newPassword: password }, {
      onSuccess: () => {
        setSuccess(true)
        toast({
          title: "Account Ready!",
          description: "Your permanent password has been successfully configured.",
        })
      },
      onError: (err: any) => {
        const errorMsg = err.response?.data?.message || 'Failed to setup account. The invite link might be expired or invalid.'
        setError(errorMsg)
        toast({
          title: "Setup Error",
          description: errorMsg,
          variant: "destructive"
        })
      }
    })
  }

  return (
    <div className="mt-10">
      {success ? (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-6 text-sm text-green-600 dark:text-green-400 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mb-4">
             <Sparkles className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="font-bold text-xl mb-2 text-foreground">Welcome Aboard!</h3>
          <p className="text-muted-foreground text-sm">Your new password is set up and your account is ready to use.</p>
          <div className="mt-8">
            <Link href="/login" className="flex items-center gap-2 w-full justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all">
              Sign In Now
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          
          <div>
            <Label htmlFor="password">Create Password</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                className="pr-10"
                autoComplete="new-password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative mt-2">
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type your password again"
                className="pr-10"
                autoComplete="new-password"
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full text-md py-6" disabled={isLoading || !token}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Configuring Account...
              </>
            ) : (
              'Save & Complete Setup'
            )}
          </Button>

          {!token && !success && (
            <p className="text-sm text-destructive text-center">
              Missing setup token. Please ensure you clicked the exact link provided in your email.
            </p>
          )}
        </form>
      )}
    </div>
  )
}

export default function SetupPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">ClinicQueue</span>
            </Link>
            <h2 className="mt-8 text-3xl font-extrabold text-foreground">
              Welcome to the team.
            </h2>
            <p className="mt-2 text-md text-muted-foreground">
              Set up your account credentials below to get started.
            </p>
          </div>

          <Suspense fallback={<div className="mt-10 py-6 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary"/></div>}>
            <SetupPasswordForm />
          </Suspense>
        </div>
      </div>

      {/* Right Panel - Decorative Setup Concept */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/5 to-background" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-center backdrop-blur-sm bg-background/20 p-12 rounded-3xl border border-primary/10 shadow-2xl">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 mb-8 border-4 border-primary/20">
              <Stethoscope className="h-12 w-12 text-primary drop-shadow-sm" />
            </div>
            <h3 className="mt-8 text-3xl font-bold text-foreground">
              Initialize Your Profile
            </h3>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              You've been invited to join a ClinicQueue workspace. Once you configure your password securely, you'll be granted immediate functional access to the clinic dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
