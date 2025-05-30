'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  CheckCircle, 
  Users, 
  BookOpen, 
  Camera, 
  HelpCircle,
  MapPin,
  User,
  Send,
  Loader2
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import type { StoryWithDetails, Verification } from '@/types/database'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const verificationSchema = z.object({
  verificationType: z.string().min(1, 'Pilih jenis verifikasi'),
  evidenceText: z.string().min(10, 'Minimal 10 karakter untuk penjelasan'),
  evidenceUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
})

type VerificationFormData = z.infer<typeof verificationSchema>

interface VerificationPanelProps {
  story: StoryWithDetails
  user: SupabaseUser | null
  onVerificationAdded: () => void
}

export function VerificationPanel({ story, user, onVerificationAdded }: VerificationPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  const supabase = createSupabaseClient()
  const verifications = story.verifications || []

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  })

  const verificationTypes = [
    {
      value: 'local_confirmation',
      label: 'Saya dari daerah ini',
      icon: MapPin,
      description: 'Konfirmasi sebagai penduduk lokal'
    },
    {
      value: 'source_verification',
      label: 'Saya punya sumber',
      icon: BookOpen,
      description: 'Memiliki referensi akademik atau dokumen'
    },
    {
      value: 'family_tradition',
      label: 'Tradisi keluarga',
      icon: Users,
      description: 'Cerita serupa dalam keluarga/komunitas'
    },
    {
      value: 'visual_evidence',
      label: 'Bukti visual',
      icon: Camera,
      description: 'Foto, artifact, atau bukti fisik'
    },
    {
      value: 'need_more_info',
      label: 'Butuh info lebih',
      icon: HelpCircle,
      description: 'Perlu klarifikasi atau informasi tambahan'
    }
  ]

  const getVerificationSummary = () => {
    const summary = verifications.reduce((acc, verification) => {
      acc[verification.verification_type] = (acc[verification.verification_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return summary
  }

  const onSubmit = async (data: VerificationFormData) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('verifications')
        .insert({
          story_id: story.id,
          user_id: user.id,
          verification_type: data.verificationType,
          evidence_text: data.evidenceText,
          evidence_url: data.evidenceUrl || null,
          is_verified: false
        })

      if (error) throw error

      // Update story verification count
      await supabase.rpc('increment_verification_count', {
        story_id: story.id
      })

      reset()
      setShowForm(false)
      onVerificationAdded()
    } catch (error) {
      setError('root', { message: 'Failed to submit verification' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const summary = getVerificationSummary()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        Verifikasi Komunitas
      </h3>

      {/* Verification Summary */}
      <div className="space-y-3 mb-6">
        {verificationTypes.map((type) => {
          const count = summary[type.value] || 0
          const Icon = type.icon
          
          return (
            <div key={type.value} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{type.label}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {count}
              </span>
            </div>
          )
        })}
      </div>

      {/* Add Verification Button */}
      {user ? (
        <div className="space-y-4">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-indonesia-red text-white py-2 px-4 rounded-lg font-medium hover:bg-indonesia-deep-red transition-colors"
            >
              Tambah Verifikasi
            </button>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Verification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Verifikasi
                </label>
                <select
                  {...register('verificationType')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indonesia-red focus:border-transparent"
                >
                  <option value="">Pilih jenis verifikasi</option>
                  {verificationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
                {errors.verificationType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.verificationType.message}
                  </p>
                )}
              </div>

              {/* Evidence Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penjelasan
                </label>
                <textarea
                  {...register('evidenceText')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indonesia-red focus:border-transparent"
                  placeholder="Jelaskan dasar verifikasi Anda..."
                />
                {errors.evidenceText && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.evidenceText.message}
                  </p>
                )}
              </div>

              {/* Evidence URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Bukti (Opsional)
                </label>
                <input
                  {...register('evidenceUrl')}
                  type="url"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indonesia-red focus:border-transparent"
                  placeholder="https://example.com/evidence"
                />
                {errors.evidenceUrl && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.evidenceUrl.message}
                  </p>
                )}
              </div>

              {errors.root && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.root.message}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indonesia-red text-white py-2 px-4 rounded-lg font-medium hover:bg-indonesia-deep-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Kirim
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    reset()
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-600 text-center py-4">
          <a href="/auth" className="text-indonesia-red hover:underline">
            Masuk
          </a>{' '}
          untuk menambah verifikasi
        </p>
      )}

      {/* Recent Verifications */}
      {verifications.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Verifikasi Terbaru
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
            {verifications.slice(0, 5).map((verification) => {
              const type = verificationTypes.find(t => t.value === verification.verification_type)
              const Icon = type?.icon || HelpCircle
              
              return (
                <div key={verification.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <Icon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {type?.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(verification.created_at || ''), { 
                          addSuffix: true, 
                          locale: id 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {verification.evidence_text}
                    </p>
                    {verification.evidence_url && (
                      <a
                        href={verification.evidence_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indonesia-red hover:underline"
                      >
                        Lihat bukti
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}