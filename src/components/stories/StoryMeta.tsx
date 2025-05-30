'use client'

import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  MapPin, 
  Clock, 
  User, 
  Eye, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Star,
  Users,
  BookOpen
} from 'lucide-react'
import type { StoryWithDetails } from '@/types/database'

interface StoryMetaProps {
  story: StoryWithDetails
}

export function StoryMeta({ story }: StoryMetaProps) {
  const getTrustLevelConfig = (level: number) => {
    switch (level) {
      case 0:
        return { 
          color: 'bg-red-100 text-red-700 border-red-200', 
          icon: AlertCircle, 
          text: 'Baru Dipublikasikan',
          description: 'Cerita baru yang belum diverifikasi'
        }
      case 1:
        return { 
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
          icon: Clock, 
          text: 'Menarik Perhatian',
          description: 'Mendapat reaksi dari komunitas'
        }
      case 2:
        return { 
          color: 'bg-green-100 text-green-700 border-green-200', 
          icon: CheckCircle, 
          text: 'Terverifikasi Lokal',
          description: 'Dikonfirmasi oleh masyarakat setempat'
        }
      case 3:
        return { 
          color: 'bg-blue-100 text-blue-700 border-blue-200', 
          icon: BookOpen, 
          text: 'Didukung Sumber',
          description: 'Memiliki referensi akademik atau dokumen'
        }
      case 4:
        return { 
          color: 'bg-purple-100 text-purple-700 border-purple-200', 
          icon: Star, 
          text: 'Sangat Terpercaya',
          description: 'Multipel verifikasi dan konsensus komunitas'
        }
      default:
        return { 
          color: 'bg-gray-100 text-gray-700 border-gray-200', 
          icon: AlertCircle, 
          text: 'Belum Diverifikasi',
          description: 'Status verifikasi tidak diketahui'
        }
    }
  }

  const trustConfig = getTrustLevelConfig(story.trust_level || 0)
  const TrustIcon = trustConfig.icon

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: id 
      })
    } catch {
      return 'Waktu tidak diketahui'
    }
  }

  const readingTime = Math.ceil(story.content.length / 200) // ~200 words per minute

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Title */}
      <h1 className="text-3xl font-accent font-bold text-gray-900 mb-4 leading-tight">
        {story.title}
      </h1>

      {/* Summary */}
      {story.summary && (
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          {story.summary}
        </p>
      )}

      {/* Meta Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{story.category?.icon}</span>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Kategori</p>
            <p className="text-sm font-medium text-gray-900">
              {story.category?.name || 'Umum'}
            </p>
          </div>
        </div>

        {/* Location */}
        {story.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Lokasi</p>
              <p className="text-sm font-medium text-gray-900">
                {story.location.name}
              </p>
            </div>
          </div>
        )}

        {/* Time Period */}
        {story.time_period && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Periode</p>
              <p className="text-sm font-medium text-gray-900">
                {story.time_period}
              </p>
            </div>
          </div>
        )}

        {/* Reading Time */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Baca</p>
            <p className="text-sm font-medium text-gray-900">
              {readingTime} menit
            </p>
          </div>
        </div>
      </div>

      {/* Trust Level Badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${trustConfig.color} mb-6`}>
        <TrustIcon className="w-4 h-4" />
        <div>
          <span className="font-medium text-sm">{trustConfig.text}</span>
          <p className="text-xs opacity-75">{trustConfig.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{story.view_count || 0} views</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{story.verification_count || 0} verifications</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>Dipublikasi {formatTimeAgo(story.created_at || '')}</span>
        </div>
      </div>

      {/* Author Info */}
      {story.author && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <div className="w-10 h-10 bg-indonesia-gold rounded-full flex items-center justify-center overflow-hidden">
            {story.author.avatar_url ? (
              <Image
                src={story.author.avatar_url}
                alt={story.author.full_name || 'User'}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {story.author.full_name || story.author.username}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {story.author.location && (
                <span>{story.author.location}</span>
              )}
              <span>{story.author.contribution_count || 0} contributions</span>
              <span>Trust score: {story.author.trust_score || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}