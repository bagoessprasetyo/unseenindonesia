'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, User, MapPin, Loader2 } from 'lucide-react'
import { signUpWithEmail, signInWithProvider } from '@/lib/supabase'

const signupSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  location: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak sama",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

interface SignupFormProps {
  onSwitchToLogin?: () => void
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const { data: authData, error } = await signUpWithEmail(
        data.email, 
        data.password,
        {
          full_name: data.fullName,
          location: data.location,
        }
      )
      
      if (error) {
        if (error.message.includes('already registered')) {
          setError('email', { message: 'Email sudah terdaftar' })
        } else {
          setError('root', { message: 'Pendaftaran gagal, coba lagi' })
        }
        return
      }

      if (authData.user && !authData.user.email_confirmed_at) {
        setEmailSent(true)
      } else if (authData.user?.email_confirmed_at) {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setError('root', { message: 'Terjadi kesalahan, coba lagi' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider)
    try {
      const { error } = await signInWithProvider(provider)
      if (error) {
        setError('root', { message: `Daftar dengan ${provider} gagal` })
      }
    } catch (error) {
      setError('root', { message: 'Terjadi kesalahan, coba lagi' })
    } finally {
      setSocialLoading(null)
    }
  }

  if (emailSent) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-accent font-bold text-gray-900 mb-2">
            Periksa Email Anda
          </h1>
          <p className="text-gray-600">
            Kami telah mengirim link konfirmasi ke{' '}
            <span className="font-medium">{getValues('email')}</span>
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Klik link di email untuk mengaktifkan akun Anda. 
            Jika tidak menerima email, periksa folder spam.
          </p>
        </div>

        {onSwitchToLogin && (
          <button
            onClick={onSwitchToLogin}
            className="text-indonesia-red hover:text-indonesia-deep-red font-medium"
          >
            Kembali ke halaman masuk
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-accent font-bold text-gray-900 mb-2">
          Bergabung dengan UnseenIndonesia
        </h1>
        <p className="text-gray-600">
          Mulai berbagi dan menemukan sejarah tersembunyi Indonesia
        </p>
      </div>

      {/* Social Signup */}
      <div className="space-y-3 mb-6">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={socialLoading === 'google'}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {socialLoading === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Daftar dengan Google
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin('facebook')}
          disabled={socialLoading === 'facebook'}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {socialLoading === 'facebook' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
          Daftar dengan Facebook
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">atau</span>
        </div>
      </div>

      {/* Email Signup Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('fullName')}
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indonesia-red focus:border-transparent"
              placeholder="Nama lengkap"
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('email')}
              type="email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indonesia-red focus:border-transparent"
              placeholder="nama@email.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lokasi (Opsional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('location')}
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indonesia-red focus:border-transparent"
              placeholder="Kota, Provinsi"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indonesia-red focus:border-transparent"
              placeholder="Password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konfirmasi Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indonesia-red focus:border-transparent"
              placeholder="Konfirmasi password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indonesia-red text-white py-3 px-4 rounded-lg font-medium hover:bg-indonesia-deep-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Daftar Sekarang
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500 text-center">
        Dengan mendaftar, Anda menyetujui{' '}
        <a href="/terms" className="text-indonesia-red hover:underline">
          Syarat & Ketentuan
        </a>{' '}
        dan{' '}
        <a href="/privacy" className="text-indonesia-red hover:underline">
          Kebijakan Privasi
        </a>{' '}
        kami.
      </p>

      {onSwitchToLogin && (
        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-indonesia-red hover:text-indonesia-deep-red font-medium"
          >
            Masuk sekarang
          </button>
        </p>
      )}
    </div>
  )
}