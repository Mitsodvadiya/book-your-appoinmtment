'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Stethoscope, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForgotPassword } from '@/hooks/use-auth'

import { useToast } from '@/hooks/use-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { mutate: forgotPassword, isPending: isLoading } = useForgotPassword()
  const { toast } = useToast()
  
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    forgotPassword({ email }, {
      onSuccess: () => {
        setSuccess(true)
        toast({
          title: "Email Sent",
          description: "If an account exists, a reset link has been sent.",
        })
      },
      onError: (err: any) => {
        const errorMsg = err.response?.data?.message || 'Failed to send reset email. Please try again.'
        setError(errorMsg)
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        })
      }
    })
  }

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
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="mt-10">
            {success ? (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-600 dark:text-green-400">
                <h3 className="font-semibold text-base mb-1">Check your email</h3>
                <p>We've sent a password reset link to <strong>{email}</strong>.</p>
                <p className="mt-2">The link will expire in 1 minute.</p>
                <div className="mt-6">
                  <Link href="/login" className="flex items-center gap-2 w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                    Return to login
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
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@clinic.com"
                    className="mt-2"
                    autoComplete="email"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>

                <div className="mt-6 text-center">
                  <Link href="/login" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </div>
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
              Regain access to your clinic management dashboard quickly and securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
