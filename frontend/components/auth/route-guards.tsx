'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { useEffect, useState } from 'react';

export const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, clinic } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const publicPaths = ['/login', '/register', '/'];
    const onboardingPaths = ['/onboarding'];
    
    const isPublicPath = publicPaths.includes(pathname);
    const isOnboardingPath = onboardingPaths.some(p => pathname.startsWith(p));

    if (!isAuthenticated) {
      if (!isPublicPath) {
        router.push('/login');
      }
    } else {
      // Authenticated users
      if (isPublicPath) {
        if (!clinic) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      } else if (!clinic && !isOnboardingPath) {
        router.push('/onboarding');
      } else if (clinic && isOnboardingPath) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, clinic, pathname, router, mounted]);

  if (!mounted) return null;

  return <>{children}</>;
};
