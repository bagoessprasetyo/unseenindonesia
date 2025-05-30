'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { StoryCard } from '@/components/stories/StoryCard'
import { CategoryFilter } from '@/components/filters/CategoryFilter'
import { LocationFilter } from '@/components/explore/LocationFilter'
import { TimePeriodFilter } from '@/components/explore/TimePeriodFilter'
import { SearchBar } from '@/components/explore/SearchBar'
import { ViewToggle } from '@/components/explore/ViewToggle'
import { SortDropdown } from '@/components/explore/SortDropdown'
import { StoryGrid } from '@/components/explore/StoryGrid'
import { StoryList } from '@/components/explore/StoryList'
import { ExploreMap } from '@/components/explore/ExploreMap'
import { createSupabaseClient } from '@/lib/supabase'
import type { StoryWithDetails, Category, Location } from '@/types/database'
import { 
  Loader2, 
  Search, 
  Filter, 
  Map as MapIcon,
  Grid3x3,
  List,
  SlidersHorizontal,
  X
} from 'lucide-react'

type ViewMode = 'grid' | 'list' | 'map'
type SortOption = 'newest' | 'oldest' | 'most_viewed' | 'most_verified' | 'alphabetical'

function ExplorePageContent() {
  const [stories, setStories] = useState<StoryWithDetails[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 20

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Initialize filters from URL params
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const period = searchParams.get('period')
    const search = searchParams.get('search')
    const view = searchParams.get('view') as ViewMode
    const sort = searchParams.get('sort') as SortOption

    if (category) setSelectedCategory(category)
    if (location) setSelectedLocation(location)
    if (period) setSelectedTimePeriod(period)
    if (search) setSearchQuery(search)
    if (view && ['grid', 'list', 'map'].includes(view)) setViewMode(view)
    if (sort && ['newest', 'oldest', 'most_viewed', 'most_verified', 'alphabetical'].includes(sort)) {
      setSortBy(sort)
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    loadStories()
    updateURL()
  }, [searchQuery, selectedCategory, selectedLocation, selectedTimePeriod, sortBy, currentPage])

  const loadInitialData = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      // Load locations
      const { data: locationsData } = await supabase
        .from('locations')
        .select('*')
        .order('name')
        .limit(100)

      setCategories(categoriesData || [])
      setLocations(locationsData || [])
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const loadStories = async () => {
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
        `, { count: 'exact' })
        .eq('status', 'published')
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)

      // Apply filters
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`)
      }
      
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }
      
      if (selectedLocation) {
        query = query.eq('location_id', selectedLocation)
      }
      
      if (selectedTimePeriod) {
        query = query.eq('time_period', selectedTimePeriod)
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'most_viewed':
          query = query.order('view_count', { ascending: false })
          break
        case 'most_verified':
          query = query.order('verification_count', { ascending: false })
          break
        case 'alphabetical':
          query = query.order('title', { ascending: true })
          break
      }

      const { data, error, count } = await query

      if (error) throw error

      setStories(data || [])
      setTotalCount(count || 0)
      setHasMore((currentPage * ITEMS_PER_PAGE) < (count || 0))
    } catch (error) {
      console.error('Error loading stories:', error)
      setStories([])
    } finally {
      setLoading(false)
    }
  }

  const updateURL = () => {
    const params = new URLSearchParams()
    
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedLocation) params.set('location', selectedLocation)
    if (selectedTimePeriod) params.set('period', selectedTimePeriod)
    if (viewMode !== 'grid') params.set('view', viewMode)
    if (sortBy !== 'newest') params.set('sort', sortBy)

    const newURL = `/explore${params.toString() ? `?${params.toString()}` : ''}`
    window.history.replaceState({}, '', newURL)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    setSelectedLocation(null)
    setSelectedTimePeriod(null)
    setSortBy('newest')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedLocation || selectedTimePeriod

  const handleStoryClick = (story: StoryWithDetails) => {
    router.push(`/stories/${story.id}`)
  }

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-accent font-bold text-gray-900 mb-2">
            Jelajahi Cerita
          </h1>
          <p className="text-gray-600">
            Temukan sejarah tersembunyi Indonesia dari berbagai kategori dan lokasi
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari cerita, tokoh, atau lokasi..."
          />

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-indonesia-red text-white border-indonesia-red' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-indonesia-gold rounded-full"></span>
                )}
              </button>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear filters
                </button>
              )}

              {/* Results Count */}
              <span className="text-sm text-gray-500">
                {totalCount} cerita ditemukan
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <SortDropdown value={sortBy} onChange={setSortBy} />

              {/* View Toggle */}
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
              
              <LocationFilter
                locations={locations}
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
              />
              
              <TimePeriodFilter
                selectedPeriod={selectedTimePeriod}
                onPeriodChange={setSelectedTimePeriod}
              />
            </div>
          </div>
        )}

        {/* Content */}
        {loading && currentPage === 1 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indonesia-red" />
          </div>
        ) : (
          <>
            {/* View Content */}
            {viewMode === 'grid' && (
              <StoryGrid
                stories={stories}
                onStoryClick={handleStoryClick}
                loading={loading && currentPage > 1}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
              />
            )}
            
            {viewMode === 'list' && (
              <StoryList
                stories={stories}
                onStoryClick={handleStoryClick}
                loading={loading && currentPage > 1}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
              />
            )}
            
            {viewMode === 'map' && (
              <ExploreMap
                stories={stories}
                onStoryClick={handleStoryClick}
              />
            )}

            {/* Empty State */}
            {!loading && stories.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada cerita ditemukan
                </h3>
                <p className="text-gray-500 mb-4">
                  Coba ubah filter pencarian atau kata kunci Anda
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-indonesia-red hover:text-indonesia-deep-red font-medium"
                  >
                    Hapus semua filter
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-indonesia-red" />
        </div>
      </MainLayout>
    }>
      <ExplorePageContent />
    </Suspense>
  )
}