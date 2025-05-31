// src/components/stories/SwipeableStoryViewer.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  X, 
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  MapPin,
  User,
  ChevronUp,
  ChevronDown,
  Eye,
  Clock,
  Users
} from 'lucide-react'
import type { StoryWithDetails } from '@/types/database'

interface SwipeableStoryViewerProps {
  stories: StoryWithDetails[]
  initialIndex?: number
  onClose: () => void
  onStorySelect: (story: StoryWithDetails) => void
}

export function SwipeableStoryViewer({ 
  stories, 
  initialIndex = 0, 
  onClose, 
  onStorySelect 
}: SwipeableStoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [imageError, setImageError] = useState<Record<number, boolean>>({})
  
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const currentStory = stories[currentIndex]

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentIndex < stories.length - 1) {
      goToNext()
    }
    if (isRightSwipe && currentIndex > 0) {
      goToPrevious()
    }
  }

  const goToNext = useCallback(() => {
    if (currentIndex < stories.length - 1 && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentIndex(prev => prev + 1)
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }, [currentIndex, stories.length, isTransitioning])

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentIndex(prev => prev - 1)
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }, [currentIndex, isTransitioning])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        goToNext()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious, onClose])

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: id })
    } catch {
      return 'Baru saja'
    }
  }

  const getTrustLevelConfig = (level: number) => {
    const configs = {
      0: { color: 'bg-red-500', text: 'Baru' },
      1: { color: 'bg-yellow-500', text: 'Menarik' },
      2: { color: 'bg-green-500', text: 'Terverifikasi' },
      3: { color: 'bg-blue-500', text: 'Bersumber' },
      4: { color: 'bg-purple-500', text: 'Terpercaya' }
    }
    return configs[level as keyof typeof configs] || configs[0]
  }

  const handleReadMore = () => {
    onStorySelect(currentStory)
    onClose()
  }

  const handleImageError = (index: number) => {
    setImageError(prev => ({ ...prev, [index]: true }))
  }

  if (!currentStory) return null

  const primaryImage = currentStory.images?.find(img => img.is_primary) || currentStory.images?.[0]
  const trustConfig = getTrustLevelConfig(currentStory.trust_level || 0)
  const readingTime = Math.ceil(currentStory.content.length / 200)

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Story counter */}
            <div className="text-white text-sm font-medium">
              {currentIndex + 1} / {stories.length}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Image */}
        {primaryImage && !imageError[currentIndex] && (
          <div className="absolute inset-0">
            <Image
              src={primaryImage.image_url}
              alt={currentStory.title}
              fill
              className="object-cover"
              onError={() => handleImageError(currentIndex)}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <div className="space-y-4">
            {/* Category & Trust Level */}
            <div className="flex items-center gap-2">
              <span className="bg-indonesia-red px-3 py-1 rounded-full text-xs font-medium">
                {currentStory.category?.icon} {currentStory.category?.name || 'Umum'}
              </span>
              <div className={`${trustConfig.color} px-2 py-1 rounded-full text-xs font-medium text-white`}>
                {trustConfig.text}
              </div>
            </div>

            {/* Location */}
            {currentStory.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{currentStory.location.name}</span>
              </div>
            )}

            {/* Title */}
            <h2 className="text-xl font-bold leading-tight">
              {currentStory.title}
            </h2>

            {/* Summary */}
            <p className="text-sm text-gray-200 line-clamp-3">
              {currentStory.summary || currentStory.content.substring(0, 200) + '...'}
            </p>

            {/* Time Period */}
            {currentStory.time_period && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock className="w-4 h-4" />
                <span>{currentStory.time_period}</span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{readingTime} menit</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{currentStory.view_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{currentStory.verification_count || 0}</span>
              </div>
            </div>

            {/* Author */}
            {currentStory.author && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indonesia-gold rounded-full flex items-center justify-center">
                  {currentStory.author.avatar_url ? (
                    <Image
                      src={currentStory.author.avatar_url}
                      alt={currentStory.author.full_name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {currentStory.author.full_name || currentStory.author.username}
                  </p>
                  <p className="text-xs text-gray-300">
                    {formatTimeAgo(currentStory.created_at || '')}
                  </p>
                </div>
              </div>
            )}

            {/* Read More Button */}
            <button
              onClick={handleReadMore}
              className="w-full bg-indonesia-red text-white py-3 px-4 rounded-lg font-medium hover:bg-indonesia-deep-red transition-colors"
            >
              Baca Selengkapnya
            </button>
          </div>
        </div>
      </div>

      {/* Side Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-4">
        <button className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
          <Heart className="w-6 h-6" />
        </button>
        <button className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
          <MessageCircle className="w-6 h-6" />
        </button>
        <button className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation Arrows (Desktop) */}
      <div className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === stories.length - 1}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
        <div 
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / stories.length) * 100}%` }}
        />
      </div>

      {/* Mobile Swipe Hint */}
      <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="text-white text-xs text-center bg-black/50 px-3 py-1 rounded-full">
          Geser ke atas/bawah untuk navigasi
        </div>
      </div>
    </div>
  )
}