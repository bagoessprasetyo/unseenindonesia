'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { EnhancedInteractiveMap } from '@/components/map/InteractiveMap'
import { StoryCard } from '@/components/stories/StoryCard'
import { CategoryFilter } from '@/components/filters/CategoryFilter'
import { useAuth } from '@/components/providers/Providers'
import { createSupabaseClient } from '@/lib/supabase'
import type { StoryWithDetails, Category } from '@/types/database'
import { Loader2, MapPin, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const [stories, setStories] = useState<StoryWithDetails[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-2.5489, 118.0149]) // Indonesia center
  const [mapZoom, setMapZoom] = useState(5)
  
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      // Load featured stories with coordinates extracted via SQL
      const { data: storiesData } = await supabase
        .rpc('get_stories_with_coordinates_simple')
        .limit(20)

      setCategories(categoriesData || [])
      setStories(storiesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStorySelect = (story: StoryWithDetails) => {
    if (story.coordinates) {
      const coords = story.coordinates as any
      if (coords.coordinates) {
        setMapCenter([coords.coordinates[1], coords.coordinates[0]])
        setMapZoom(12)
      }
    }
    router.push(`/stories/${story.id}`)
  }

  const handleMapClick = (lng: number, lat: number) => {
    // TODO: Show stories near clicked location
    console.log('Map clicked:', { lng, lat })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indonesia-red" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="h-screen flex">
        {/* Map Section */}
        <div className="flex-1 relative">
          <EnhancedInteractiveMap
            center={mapCenter}
            zoom={mapZoom}
            stories={stories}
            onStoryClick={handleStorySelect}
            onMapClick={handleMapClick}
          />
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indonesia-red" />
              Filter Kategori
            </h3>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Story Count Badge */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 z-10">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-indonesia-red" />
              <span className="font-medium">{stories.length} cerita ditemukan</span>
            </div>
            {/* Debug info */}
            <div className="text-xs text-gray-500 mt-1">
              {stories.filter(s => (s as any).latitude && (s as any).longitude).length} dengan koordinat
            </div>
          </div>
        </div>

        {/* Sidebar - Story List */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-accent font-bold text-gray-900 mb-2">
              Cerita Terbaru
            </h2>
            <p className="text-sm text-gray-600">
              Temukan sejarah tersembunyi dari seluruh nusantara
            </p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-4">
              {stories.length > 0 ? (
                stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onClick={() => handleStorySelect(story)}
                    compact
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Belum ada cerita untuk kategori ini
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {user && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => router.push('/stories/new')}
                className="w-full bg-indonesia-red text-white py-3 px-4 rounded-lg font-medium hover:bg-indonesia-deep-red transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Bagikan Cerita Anda
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}