'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { StoryCard } from '@/components/stories/StoryCard'
import { StoriesHeader } from '@/components/stories/StoriesHeader'
import { StoriesFilters } from '@/components/stories/StoriesFilters'
import { StoriesGrid } from '@/components/stories/StoriesGrid'
import { StoriesList } from '@/components/stories/StoriesList'
import { createSupabaseClient } from '@/lib/supabase'
import type { StoryWithDetails, Category } from '@/types/database'
import { BookOpen, Loader2 } from 'lucide-react'

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'oldest' | 'most_viewed' | 'most_verified' | 'alphabetical'

function StoriesPageContent() {
  const [stories, setStories] = useState<StoryWithDetails[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 24

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Initialize from URL params
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const view = searchParams.get('view') as ViewMode
    const sort = searchParams.get('sort') as SortOption

    if (category) setSelectedCategory(category)
    if (search) setSearchQuery(search)
    if (view && ['grid', 'list'].includes(view)) setViewMode(view)
    if (sort) setSortBy(sort)

    loadInitialData()
  }, [])

  useEffect(() => {
    loadStories()
    updateURL()
  }, [searchQuery, selectedCategory, sortBy, currentPage])

  const loadInitialData = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      setCategories(categoriesData || [])
    } catch (error) {
      console.error('Error loading categories:', error)
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

      if (currentPage === 1) {
        setStories(data || [])
      } else {
        setStories(prev => [...prev, ...(data || [])])
      }
      
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
    if (viewMode !== 'grid') params.set('view', viewMode)
    if (sortBy !== 'newest') params.set('sort', sortBy)

    const newURL = `/stories${params.toString() ? `?${params.toString()}` : ''}`
    window.history.replaceState({}, '', newURL)
  }

  const handleStoryClick = (story: StoryWithDetails) => {
    router.push(`/stories/${story.id}`)
  }

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  const handleReset = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    setSortBy('newest')
    setCurrentPage(1)
  }

  if (loading && currentPage === 1) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-indonesia-red" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <StoriesHeader
          totalCount={totalCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <StoriesFilters
          categories={categories}
          selectedCategory={selectedCategory}
          sortBy={sortBy}
          viewMode={viewMode}
          onCategoryChange={setSelectedCategory}
          onSortChange={setSortBy}
          onViewModeChange={setViewMode}
          onReset={handleReset}
        />

        {viewMode === 'grid' ? (
          <StoriesGrid
            stories={stories}
            onStoryClick={handleStoryClick}
            loading={loading && currentPage > 1}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        ) : (
          <StoriesList
            stories={stories}
            onStoryClick={handleStoryClick}
            loading={loading && currentPage > 1}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        )}

        {/* Empty State */}
        {!loading && stories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada cerita ditemukan
            </h3>
            <p className="text-gray-500 mb-4">
              Coba ubah filter atau kata kunci pencarian
            </p>
            <button
              onClick={handleReset}
              className="text-indonesia-red hover:text-indonesia-deep-red font-medium"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default function StoriesPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-indonesia-red" />
        </div>
      </MainLayout>
    }>
      <StoriesPageContent />
    </Suspense>
  )
}