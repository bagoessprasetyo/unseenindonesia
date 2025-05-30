'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User, Session } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'
import type { Profile } from '@/types/database'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a Providers component')
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        setLoading(false)
        return
      }

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setProfile(profileData)
      }

      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Fetch or create profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { data: newProfile } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                username: session.user.email?.split('@')[0] || '',
                full_name: session.user.user_metadata?.full_name || 
                          session.user.user_metadata?.name || '',
                avatar_url: session.user.user_metadata?.avatar_url || 
                           session.user.user_metadata?.picture || null,
                location: session.user.user_metadata?.location || null,
              })
              .select()
              .single()
            
            setProfile(newProfile)
          } else {
            setProfile(profileData)
          }
        } else {
          setProfile(null)
        }

        // Handle redirects
        if (event === 'SIGNED_IN' && pathname === '/auth') {
          router.push('/')
        } else if (event === 'SIGNED_OUT') {
          router.push('/auth')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router, pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signOut: handleSignOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}