import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Client component helper
export const createSupabaseClient = () => {
  return createClientComponentClient<Database>()
}

// Auth utilities
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Auth providers for social login
export const signInWithProvider = async (provider: 'google' | 'facebook') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })
  return { data, error }
}

// Email auth
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })
  return { data, error }
}

// Database helpers
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
  return { data, error }
}

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  return data.publicUrl
}

// Real-time subscriptions
export const subscribeToStories = (callback: (payload: any) => void) => {
  return supabase
    .channel('stories')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'stories'
    }, callback)
    .subscribe()
}

export const subscribeToVerifications = (storyId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`verifications:${storyId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'verifications',
      filter: `story_id=eq.${storyId}`
    }, callback)
    .subscribe()
}