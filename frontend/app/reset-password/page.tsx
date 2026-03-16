'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Stethoscope, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useResetPassword } from '@/hooks/use-auth'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { mutate: resetPassword, isPending: isLoading } = useResetPassword()
  
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
      setError('Invalid or missing reset token')
      return
    }
    
    resetPassword({ token, newPassword: password }, {
      onSuccess: () => {
        setSuccess(true)
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Failed to reset password. The link might be expired or invalid.')
      }
    })
  }

  return (
    <div className="mt-10">
      {success ? (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-600 dark:text-green-400">
          <h3 className="font-semibold text-base mb-1">Password Reset Successfully</h3>
          <p>Your password has been changed.</p>
          <div className="mt-6">
            <Link href="/login" className="flex items-center gap-2 w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
              Sign in with new password
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
            <Label htmlFor="password">New Password</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
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
                placeholder="Confirm new password"
                className="pr-10"
                autoComplete="new-password"
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !token}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>

          {!token && !success && (
            <p className="text-sm text-destructive text-center">
              Missing reset token. Please check your email link.
            </p>
          )}
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ClinicQueue</span>
            </Link>
            <h2 className="mt-8 text-2xl font-bold text-foreground">
              Create new password
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your new password must be securely configured.
            </p>
          </div>

          <Suspense fallback={<div className="mt-10 py-6 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary"/></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur">
              <Stethoscope className="h-10 w-10 text-primary" />
            </div>
            <h3 className="mt-8 text-2xl font-bold text-foreground">
              Secure Your Account
            </h3>
            <p className="mt-4 text-muted-foreground">
              Reset your password and immediately regain access to your clinic operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
