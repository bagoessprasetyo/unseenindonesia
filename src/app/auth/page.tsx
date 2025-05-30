'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { LoginForm } from '@/components/auth/LoginForm'
// import { SignupForm } from '@/components/auth/SignupForm'
import { MapPin, Users, BookOpen, Award } from 'lucide-react'
import { SignupForm } from '@/components/auth/SignupForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/')
        return
      }
      setIsLoading(false)
    }

    // Check URL params for mode
    const urlMode = searchParams.get('mode')
    if (urlMode === 'signup') {
      setMode('signup')
    }

    checkAuth()
  }, [router, searchParams, supabase])

  const switchToSignup = () => {
    setMode('signup')
    window.history.replaceState({}, '', '/auth?mode=signup')
  }

  const switchToLogin = () => {
    setMode('login')
    window.history.replaceState({}, '', '/auth')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indonesia-ocean-blue to-indonesia-forest-green flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indonesia-ocean-blue to-indonesia-forest-green">
      <div className="flex">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indonesia-gold rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-accent font-bold">
                UnseenIndonesia
              </h1>
            </div>
            
            <div className="mb-12">
              <h2 className="text-4xl font-accent font-bold mb-4 leading-tight">
                Temukan Sejarah
                <br />
                Tersembunyi Indonesia
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Jelajahi cerita-cerita yang belum pernah Anda dengar dari seluruh nusantara
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Eksplorasi Berbasis Lokasi</h3>
                  <p className="text-blue-100 text-sm">
                    Temukan cerita berdasarkan peta interaktif Indonesia
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Verifikasi Komunitas</h3>
                  <p className="text-blue-100 text-sm">
                    Cerita diverifikasi oleh masyarakat lokal dan ahli sejarah
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Cerita Autentik</h3>
                  <p className="text-blue-100 text-sm">
                    Dari kerajaan kuno hingga tradisi lokal yang hampir punah
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Kontribusi Bermakna</h3>
                  <p className="text-blue-100 text-sm">
                    Bagikan pengetahuan dan bangun kebanggaan nasional
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <p className="text-blue-100 text-sm">
              "Mengenal masa lalu adalah kunci memahami masa kini dan membangun masa depan"
            </p>
            <p className="text-white font-medium mt-2">
              — Filosofi UnseenIndonesia
            </p>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full lg:w-1/2 xl:w-3/5 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center gap-3 text-white mb-4">
                <div className="w-10 h-10 bg-indonesia-gold rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-accent font-bold">
                  UnseenIndonesia
                </h1>
              </div>
            </div>

            {/* Auth Form Container */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10">
              {mode === 'login' ? (
                <LoginForm onSwitchToSignup={switchToSignup} />
              ) : (
                <SignupForm onSwitchToLogin={switchToLogin} />
              )}
            </div>

            {/* Terms & Privacy - Mobile */}
            <div className="lg:hidden mt-6 text-center">
              <p className="text-xs text-blue-100">
                Dengan menggunakan layanan ini, Anda menyetujui{' '}
                <a href="/terms" className="text-white hover:underline">
                  Syarat & Ketentuan
                </a>{' '}
                dan{' '}
                <a href="/privacy" className="text-white hover:underline">
                  Kebijakan Privasi
                </a>{' '}
                kami.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}