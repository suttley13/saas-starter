"use client"

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function ForceSignOut() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleForceSignOut = async () => {
    try {
      setLoading(true)
      
      // Sign out current session
      await signOut({ redirect: false })
      
      // Clear all browser storage to ensure clean state
      localStorage.clear()
      sessionStorage.clear()
      
      // Delete all cookies by setting them to expire in the past
      document.cookie.split(";").forEach(cookie => {
        const [name] = cookie.trim().split("=")
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
      })
      
      // Redirect to sign-in
      router.push('/sign-in')
      router.refresh()
    } catch (error) {
      console.error('Error during sign out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="destructive"
      onClick={handleForceSignOut}
      disabled={loading}
    >
      {loading ? 'Signing out...' : 'Force Sign Out (All Devices)'}
    </Button>
  )
} 