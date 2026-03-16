'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { useEffect, useState } from 'react';

export const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, clinic, isInitialized } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !isInitialized) return

    const publicPaths = ['/login', '/register', '/', '/forgot-password', '/reset-password']
    const onboardingPaths = ['/onboarding']
    
    const isPublicPath = publicPaths.includes(pathname)
    const isOnboardingPath = onboardingPaths.some(p => pathname.startsWith(p))

    if (!isAuthenticated) {
      if (!isPublicPath) {
        setIsRedirecting(true)
        router.push('/login')
      } else {
        setIsRedirecting(false)
      }
    } else {
      // Authenticated users
      if (isPublicPath) {
        setIsRedirecting(true)
        if (!clinic) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      } else if (!clinic && !isOnboardingPath) {
        setIsRedirecting(true)
        router.push('/onboarding')
      } else if (clinic && isOnboardingPath) {
        setIsRedirecting(true)
        router.push('/dashboard')
      } else {
        setIsRedirecting(false)
      }
    }
  }, [isAuthenticated, user, clinic, pathname, router, mounted, isInitialized])

  if (!mounted || !isInitialized || isRedirecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Securely loading your session...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
};
