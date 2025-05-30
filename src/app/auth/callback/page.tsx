'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

function AuthCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Handle OAuth errors
        if (error) {
          setStatus('error')
          setMessage(errorDescription || 'Login gagal, coba lagi')
          setTimeout(() => router.push('/auth'), 3000)
          return
        }

        // Handle OAuth success
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            setStatus('error')
            setMessage('Proses login gagal, coba lagi')
            setTimeout(() => router.push('/auth'), 3000)
            return
          }

          if (data.user) {
            // Check if profile exists, create if not
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()

            if (profileError && profileError.code === 'PGRST116') {
              // Profile doesn't exist, create one
              const { error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  username: data.user.user_metadata?.preferred_username || 
                           data.user.email?.split('@')[0] || '',
                  full_name: data.user.user_metadata?.full_name || 
                            data.user.user_metadata?.name || '',
                  avatar_url: data.user.user_metadata?.avatar_url || 
                             data.user.user_metadata?.picture || null,
                })

              if (createError) {
                console.error('Error creating profile:', createError)
              }
            }

            setStatus('success')
            setMessage('Login berhasil! Mengalihkan...')
            setTimeout(() => router.push('/'), 1500)
            return
          }
        }

        // Handle email confirmation
        const type = searchParams.get('type')
        if (type === 'signup') {
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          if (userError || !user) {
            setStatus('error')
            setMessage('Konfirmasi email gagal')
            setTimeout(() => router.push('/auth'), 3000)
            return
          }

          // Create profile for email signup
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                username: user.email?.split('@')[0] || '',
                full_name: user.user_metadata?.full_name || '',
                location: user.user_metadata?.location || null,
              })

            if (createError) {
              console.error('Error creating profile:', createError)
            }
          }

          setStatus('success')
          setMessage('Email berhasil dikonfirmasi! Mengalihkan...')
          setTimeout(() => router.push('/'), 1500)
          return
        }

        // Default case - no specific action needed
        setStatus('success')
        setMessage('Mengalihkan...')
        setTimeout(() => router.push('/'), 1000)

      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('Terjadi kesalahan, coba lagi')
        setTimeout(() => router.push('/auth'), 3000)
      }
    }

    handleAuthCallback()
  }, [searchParams, router, supabase])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indonesia-ocean-blue to-indonesia-forest-green flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-indonesia-red mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Memproses...
            </h1>
            <p className="text-gray-600">
              Mohon tunggu sebentar
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Berhasil!
            </h1>
            <p className="text-gray-600">
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Terjadi Kesalahan
            </h1>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <button
              onClick={() => router.push('/auth')}
              className="bg-indonesia-red text-white px-6 py-2 rounded-lg hover:bg-indonesia-deep-red transition-colors"
            >
              Kembali ke Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indonesia-ocean-blue to-indonesia-forest-green flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indonesia-red mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Memproses...
          </h1>
          <p className="text-gray-600">
            Mohon tunggu sebentar
          </p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}