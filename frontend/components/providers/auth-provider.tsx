'use client'

import { useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/lib/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuthData, setInitialized, isInitialized } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Only run once
        if (isInitialized) return

        // Call refresh endpoint - browser will automatically send the HttpOnly cookie
        const response = await axios.post('http://localhost:5000/api/v1/auth/refresh', 
          {}, 
          { withCredentials: true }
        )

        const { user, accessToken, refreshToken } = response.data.data
        setAuthData(user, accessToken, refreshToken, user.clinic || null)
      } catch (error) {
        // Silent fail - user remains unauthenticated
        console.log('Session recovery failed or no session exists')
      } finally {
        setInitialized(true)
      }
    }

    initAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
