'use client'

import { Loader2, ChevronDown } from 'lucide-react'
import { StoryCard } from '@/components/stories/StoryCard'
import type { StoryWithDetails } from '@/types/database'

interface StoryGridProps {
  stories: StoryWithDetails[]
  onStoryClick: (story: StoryWithDetails) => void
  loading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
}

export function StoryGrid({ 
  stories, 
  onStoryClick, 
  loading = false, 
  hasMore = false, 
  onLoadMore 
}: StoryGridProps) {
  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            onClick={() => onStoryClick(story)}
            compact={false}
            showAuthor={true}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}