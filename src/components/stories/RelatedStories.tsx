'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Compass, MapPin, Clock } from 'lucide-react'
import { StoryCard } from '@/components/stories/StoryCard'
import { createSupabaseClient } from '@/lib/supabase'
import type { StoryWithDetails } from '@/types/database'

interface RelatedStoriesProps {
  currentStoryId: string
  categoryId?: string | null
  locationId?: string | null
}

export function RelatedStories({ currentStoryId, categoryId, locationId }: RelatedStoriesProps) {
  const [relatedStories, setRelatedStories] = useState<StoryWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'category' | 'location' | 'recent'>('category')
  
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadRelatedStories()
  }, [currentStoryId, categoryId, locationId, activeTab])

  const loadRelatedStories = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('stories')
        .select(`
          *,
          category:categories(*),
          location:locations(*),
          author:profiles(*),
          images:story_images(*)
        `)
        .eq('status', 'published')
        .neq('id', currentStoryId)
        .limit(6)

      // Apply filters based on active tab
      switch (activeTab) {
        case 'category':
          if (categoryId) {
            query = query.eq('category_id', categoryId)
          }
          break
        case 'location':
          if (locationId) {
            query = query.eq('location_id', locationId)
          }
          break
        case 'recent':
          query = query.order('created_at', { ascending: false })
          break
      }

      // Secondary ordering
      if (activeTab !== 'recent') {
        query = query.order('view_count', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      setRelatedStories(data || [])
    } catch (error) {
      console.error('Error loading related stories:', error)
      setRelatedStories([])
    } finally {
      setLoading(false)
    }
  }

  const handleStoryClick = (story: StoryWithDetails) => {
    router.push(`/stories/${story.id}`)
  }

  const tabs = [
    {
      key: 'category' as const,
      label: 'Kategori Serupa',
      icon: Compass,
      disabled: !categoryId
    },
    {
      key: 'location' as const,
      label: 'Lokasi Sama',
      icon: MapPin,
      disabled: !locationId
    },
    {
      key: 'recent' as const,
      label: 'Terbaru',
      icon: Clock,
      disabled: false
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Cerita Terkait
      </h3>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => !tab.disabled && setActiveTab(tab.key)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indonesia-red text-indonesia-red'
                  : tab.disabled
                  ? 'border-transparent text-gray-400 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : relatedStories.length > 0 ? (
        <div className="space-y-4">
          {relatedStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onClick={() => handleStoryClick(story)}
              compact={true}
              showAuthor={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            {tabs.find(tab => tab.key === activeTab)?.icon && (
              React.createElement(tabs.find(tab => tab.key === activeTab)!.icon, {
                className: "w-6 h-6 text-gray-400"
              })
            )}
          </div>
          <p className="text-gray-500 text-sm">
            {activeTab === 'category' && 'Belum ada cerita lain dalam kategori ini'}
            {activeTab === 'location' && 'Belum ada cerita lain dari lokasi ini'}
            {activeTab === 'recent' && 'Belum ada cerita terbaru'}
          </p>
        </div>
      )}

      {/* View More Link */}
      {relatedStories.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              if (activeTab === 'category' && categoryId) {
                router.push(`/explore?category=${categoryId}`)
              } else if (activeTab === 'location' && locationId) {
                router.push(`/explore?location=${locationId}`)
              } else {
                router.push('/explore')
              }
            }}
            className="w-full text-center text-sm text-indonesia-red hover:text-indonesia-deep-red font-medium py-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            Lihat Semua Cerita
          </button>
        </div>
      )}
    </div>
  )
}

// React import for createElement
import React from 'react'