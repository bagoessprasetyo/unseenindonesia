'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { EnhancedInteractiveMap } from '@/components/map/InteractiveMap'
import { CategoryFilter } from '@/components/filters/CategoryFilter'
import { StoriesSheet } from '@/components/stories/StoriesSheet'
import { useAuth } from '@/components/providers/Providers'
import { createSupabaseClient } from '@/lib/supabase'
import type { StoryWithDetails, Category } from '@/types/database'
import { Loader2, MapPin, TrendingUp, Users, Eye } from 'lucide-react'

export default function HomePage() {
  const [stories, setStories] = useState<StoryWithDetails[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-2.5489, 118.0149]) // Indonesia center
  const [mapZoom, setMapZoom] = useState(5)
  const [searchQuery, setSearchQuery] = useState('')
  const [showStoriesSheet, setShowStoriesSheet] = useState(false)
  
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

  // Filter stories based on search query AND selected category
  const filteredStories = stories.filter(story => {
    // Search filter
    const matchesSearch = !searchQuery || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.location?.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Category filter
    const matchesCategory = !selectedCategory || story.category_id === selectedCategory
    
    return matchesSearch && matchesCategory
  })

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
      <div className="h-screen flex flex-col relative">
        {/* Control Panel */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          <StoriesSheet
            stories={stories}
            categories={categories}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onStorySelect={handleStorySelect}
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
            isOpen={showStoriesSheet}
            onOpenChange={setShowStoriesSheet}
          />
        </div>

        {/* Map Section */}
        <div className="flex-1 relative">
          <EnhancedInteractiveMap
            center={mapCenter}
            zoom={mapZoom}
            stories={filteredStories}
            onStoryClick={handleStorySelect}
            onMapClick={handleMapClick}
          />
        </div>

        {/* Bottom Stats Panel */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
            <div className="p-4">
              {/* Main Stats */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indonesia-red" />
                  <span className="font-semibold text-gray-900">
                    {filteredStories.length} 
                    {filteredStories.length !== stories.length && (
                      <span className="text-gray-500"> dari {stories.length}</span>
                    )} 
                    cerita
                  </span>
                  {selectedCategory && (
                    <span className="text-indonesia-red text-sm">
                      (filtered)
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => setShowStoriesSheet(true)}
                  className="text-sm text-indonesia-red hover:text-indonesia-deep-red font-medium"
                >
                  Lihat Semua →
                </button>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {filteredStories.filter(s => (s as any).latitude && (s as any).longitude).length} dengan koordinat
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {filteredStories.reduce((acc, story) => acc + (story.view_count || 0), 0).toLocaleString()} views
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {filteredStories.reduce((acc, story) => acc + (story.verification_count || 0), 0)} verifikasi
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {categories.length} kategori
                  </span>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory || searchQuery) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">Filter aktif:</span>
                    {selectedCategory && (
                      <span className="inline-flex items-center px-2 py-1 bg-indonesia-red bg-opacity-10 text-indonesia-red rounded-full">
                        {categories.find(cat => cat.id === selectedCategory)?.name}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        "{searchQuery}"
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Add Story FAB - Mobile Only */}
        {user && (
          <div className="md:hidden fixed bottom-20 right-4 z-40">
            <button
              onClick={() => router.push('/stories/new')}
              className="w-14 h-14 bg-indonesia-red text-white rounded-full shadow-lg hover:bg-indonesia-deep-red transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
            >
              <MapPin className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}