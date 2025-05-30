'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  MapPin, 
  Clock, 
  User, 
  Eye, 
  CheckCircle,
  AlertCircle,
  Star,
  Users,
  BookOpen
} from 'lucide-react'
import type { StoryWithDetails } from '@/types/database'

interface StoryCardProps {
  story: StoryWithDetails
  onClick?: () => void
  compact?: boolean
  showAuthor?: boolean
}

export function StoryCard({ 
  story, 
  onClick, 
  compact = false, 
  showAuthor = true 
}: StoryCardProps) {
  const [imageError, setImageError] = useState(false)

  const getTrustLevelConfig = (level: number) => {
    switch (level) {
      case 0:
        return { 
          color: 'bg-red-100 text-red-700', 
          icon: AlertCircle, 
          text: 'Baru' 
        }
      case 1:
        return { 
          color: 'bg-yellow-100 text-yellow-700', 
          icon: Clock, 
          text: 'Menarik' 
        }
      case 2:
        return { 
          color: 'bg-green-100 text-green-700', 
          icon: CheckCircle, 
          text: 'Terverifikasi' 
        }
      case 3:
        return { 
          color: 'bg-blue-100 text-blue-700', 
          icon: BookOpen, 
          text: 'Bersumber' 
        }
      case 4:
        return { 
          color: 'bg-purple-100 text-purple-700', 
          icon: Star, 
          text: 'Terpercaya' 
        }
      default:
        return { 
          color: 'bg-gray-100 text-gray-700', 
          icon: AlertCircle, 
          text: 'Baru' 
        }
    }
  }

  const trustConfig = getTrustLevelConfig(story.trust_level || 0)
  const TrustIcon = trustConfig.icon

  const primaryImage = story.images?.find(img => img.is_primary) || story.images?.[0]
  const readingTime = Math.ceil(story.content.length / 200) // ~200 words per minute

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: id 
      })
    } catch {
      return 'Baru saja'
    }
  }

  return (
    <div 
      className={`story-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
        compact ? 'p-3' : 'p-4'
      }`}
      onClick={onClick}
    >
      {/* Image */}
      {primaryImage && !imageError && (
        <div className={`relative ${compact ? 'h-32' : 'h-48'} mb-3 rounded-lg overflow-hidden bg-gray-100`}>
          <Image
            src={primaryImage.image_url}
            alt={story.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
          
          {/* Trust badge overlay */}
          <div className="absolute top-2 right-2">
            <div className={`verification-badge ${trustConfig.color} flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full`}>
              <TrustIcon className="w-3 h-3" />
              {trustConfig.text}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-2">
        {/* Category & Location */}
        <div className="flex items-center justify-between text-xs">
          <span className="bg-indonesia-red bg-opacity-10 text-indonesia-red px-2 py-1 rounded-full font-medium">
            {story.category?.icon} {story.category?.name || 'Umum'}
          </span>
          
          {story.location && (
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-20">{story.location.name}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className={`font-semibold text-gray-900 line-clamp-2 ${
          compact ? 'text-sm' : 'text-base'
        }`}>
          {story.title}
        </h3>

        {/* Summary */}
        <p className={`text-gray-600 line-clamp-3 ${
          compact ? 'text-xs' : 'text-sm'
        }`}>
          {story.summary || story.content.substring(0, 150) + '...'}
        </p>

        {/* Time period */}
        {story.time_period && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{story.time_period}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {/* Reading time */}
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>{readingTime} menit</span>
            </div>
            
            {/* View count */}
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{story.view_count || 0}</span>
            </div>
            
            {/* Verification count */}
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{story.verification_count || 0}</span>
            </div>
          </div>

          {/* Time ago */}
          <span className="text-xs text-gray-400">
            {formatTimeAgo(story.created_at || '')}
          </span>
        </div>

        {/* Author */}
        {showAuthor && story.author && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <div className="w-6 h-6 bg-indonesia-gold rounded-full flex items-center justify-center">
              {story.author.avatar_url ? (
                <Image
                  src={story.author.avatar_url}
                  alt={story.author.full_name || 'User'}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <User className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="text-xs text-gray-600 truncate">
              {story.author.full_name || story.author.username}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}