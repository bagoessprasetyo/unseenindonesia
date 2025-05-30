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
import { Loader2, MapPin, TrendingUp, Search, ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function HomePage() {
  const [stories, setStories] = useState<StoryWithDetails[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-2.5489, 118.0149]) // Indonesia center
  const [mapZoom, setMapZoom] = useState(5)
  const [showSidebar, setShowSidebar] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadInitialData()
  }, [])

  // Resize map when sidebar toggles
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
      }, 300) // Match CSS transition duration
      return () => clearTimeout(timer)
    }
  }, [showSidebar])

  const loadInitialData = async () => {
    try {
      
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      // Load featured stories with coordinates extracted via SQL
      const { data: storiesData } = await supabase
        .rpc('get_stories_with_coordinates_simple')
        // .limit(20)

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
      <div className="h-screen flex">
        {/* Map Section */}
        <div className={`flex-1 relative transition-all duration-300 ${showSidebar ? '' : 'w-full'}`}>
          <EnhancedInteractiveMap
            center={mapCenter}
            zoom={mapZoom}
            stories={filteredStories}
            onStoryClick={handleStorySelect}
            onMapClick={handleMapClick}
          />
          
          {/* Category Filter Button */}
          <div className="absolute top-4 left-4 z-20">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Sidebar Toggle Button */}
          <div className="absolute top-4 right-12 z-20">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            >
              {showSidebar ? (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-sm font-medium">Sembunyikan</span>
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Tampilkan Cerita</span>
                </>
              )}
            </button>
          </div>

          {/* Story Count Badge */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 z-10">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-indonesia-red" />
              <span className="font-medium">
                {filteredStories.length} 
                {filteredStories.length !== stories.length && (
                  <span className="text-gray-500"> dari {stories.length}</span>
                )} 
                cerita
                {selectedCategory && (
                  <span className="text-indonesia-red ml-1">
                    (filtered)
                  </span>
                )}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {filteredStories.filter(s => (s as any).latitude && (s as any).longitude).length} dengan koordinat
            </div>
          </div>
        </div>

        {/* Sidebar - Story List */}
        {showSidebar && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col transition-all duration-300">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-accent font-bold text-gray-900 mb-2">
                Cerita Terbaru
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Temukan sejarah tersembunyi dari seluruh nusantara
                {selectedCategory && (
                  <span className="block text-indonesia-red font-medium mt-1">
                    Filter: {categories.find(cat => cat.id === selectedCategory)?.name}
                  </span>
                )}
              </p>
              
              {/* Search Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indonesia-red focus:border-indonesia-red text-sm"
                  placeholder="Cari cerita..."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 space-y-4">
                {filteredStories.length > 0 ? (
                  filteredStories.map((story) => (
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
                      {searchQuery || selectedCategory 
                        ? 'Tidak ada cerita yang cocok dengan filter' 
                        : 'Belum ada cerita tersedia'
                      }
                    </p>
                    {(searchQuery || selectedCategory) && (
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedCategory(null)
                        }}
                        className="mt-2 text-sm text-indonesia-red hover:text-indonesia-deep-red"
                      >
                        Hapus semua filter
                      </button>
                    )}
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
        )}
      </div>
    </MainLayout>
  )
}