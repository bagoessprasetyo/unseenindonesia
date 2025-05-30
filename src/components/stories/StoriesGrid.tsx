'use client'

import { Loader2, ChevronDown } from 'lucide-react'
import { StoryCard } from '@/components/stories/StoryCard'
import type { StoryWithDetails } from '@/types/database'

interface StoriesGridProps {
  stories: StoryWithDetails[]
  onStoryClick: (story: StoryWithDetails) => void
  loading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
}

export function StoriesGrid({ 
  stories, 
  onStoryClick, 
  loading = false, 
  hasMore = false, 
  onLoadMore 
}: StoriesGridProps) {
  return (
    <div className="space-y-8">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
            <span className="font-medium">
              {loading ? 'Memuat cerita...' : 'Muat Lebih Banyak'}
            </span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && stories.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
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