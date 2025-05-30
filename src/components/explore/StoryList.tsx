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
  BookOpen,
  Loader2,
  ChevronDown
} from 'lucide-react'
import type { StoryWithDetails } from '@/types/database'

interface StoryListItemProps {
  story: StoryWithDetails
  onStoryClick: (story: StoryWithDetails) => void
}

function StoryListItem({ story, onStoryClick }: StoryListItemProps) {
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

  const trustConfig = getTrustLevelConfig(story.trust_level || 0)
  const TrustIcon = trustConfig.icon
  const primaryImage = story.images?.find(img => img.is_primary) || story.images?.[0]
  const readingTime = Math.ceil(story.content.length / 200)

  return (
    <div
      onClick={() => onStoryClick(story)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1"
    >
      <div className="flex gap-6">
        {/* Image */}
        {primaryImage && !imageError && (
          <div className="flex-shrink-0 w-32 h-24 relative rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={primaryImage.image_url}
              alt={story.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="bg-indonesia-red bg-opacity-10 text-indonesia-red px-2 py-1 rounded-full text-xs font-medium">
                {story.category?.icon} {story.category?.name || 'Umum'}
              </span>
              
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trustConfig.color}`}>
                <TrustIcon className="w-3 h-3" />
                {trustConfig.text}
              </div>
            </div>

            {story.location && (
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin className="w-3 h-3" />
                <span>{story.location.name}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {story.title}
          </h3>

          {/* Summary */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {story.summary || story.content.substring(0, 200) + '...'}
          </p>

          {/* Time period */}
          {story.time_period && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
              <Clock className="w-3 h-3" />
              <span>{story.time_period}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
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

              {/* Author */}
              {story.author && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{story.author.full_name || story.author.username}</span>
                </div>
              )}
            </div>

            {/* Time ago */}
            <span className="text-xs text-gray-400">
              {formatTimeAgo(story.created_at || '')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StoryListProps {
  stories: StoryWithDetails[]
  onStoryClick: (story: StoryWithDetails) => void
  loading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
}

export function StoryList({ 
  stories, 
  onStoryClick, 
  loading = false, 
  hasMore = false, 
  onLoadMore 
}: StoryListProps) {
  return (
    <div className="space-y-6">
      {/* List */}
      <div className="space-y-4">
        {stories.map((story) => (
          <StoryListItem
            key={story.id}
            story={story}
            onStoryClick={onStoryClick}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>
              {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
            </span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && stories.length === 0 && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-32 h-24 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}