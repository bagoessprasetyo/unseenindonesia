'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Search, 
  X, 
  MapPin, 
  TrendingUp, 
  Play,
  List,
  Filter
} from 'lucide-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StoryCard } from '@/components/stories/StoryCard'
import { SwipeableStoryViewer } from './SwipeableStoryViewer'
import type { StoryWithDetails, Category } from '@/types/database'

type ViewMode = 'list' | 'swipe'

interface StoriesSheetProps {
  stories: StoryWithDetails[]
  categories: Category[]
  selectedCategory: string | null
  searchQuery: string
  onStorySelect: (story: StoryWithDetails) => void
  onSearchChange: (query: string) => void
  onCategoryChange: (categoryId: string | null) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function StoriesSheet({
  stories,
  categories,
  selectedCategory,
  searchQuery,
  onStorySelect,
  onSearchChange,
  onCategoryChange,
  isOpen,
  onOpenChange
}: StoriesSheetProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showSwipeViewer, setShowSwipeViewer] = useState(false)
  const [swipeStartIndex, setSwipeStartIndex] = useState(0)
  
  const router = useRouter()

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

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)
  const filterCount = (selectedCategory ? 1 : 0) + (searchQuery ? 1 : 0)

  const handleStoryClick = (story: StoryWithDetails, index?: number) => {
    if (viewMode === 'swipe') {
      setSwipeStartIndex(index || 0)
      setShowSwipeViewer(true)
    } else {
      onStorySelect(story)
    }
  }

  const handleSwipeStart = (index: number = 0) => {
    setSwipeStartIndex(index)
    setShowSwipeViewer(true)
  }

  const clearAllFilters = () => {
    onSearchChange('')
    onCategoryChange(null)
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white shadow-lg border-gray-200 hover:bg-gray-50"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Cerita Terbaru</span>
            {filterCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-indonesia-red text-white">
                {filterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-full sm:w-96 md:w-[480px] flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indonesia-red" />
              Cerita Terbaru
            </SheetTitle>
            <SheetDescription>
              Temukan {filteredStories.length} cerita sejarah dari seluruh nusantara
              {selectedCategoryData && (
                <span className="block text-indonesia-red font-medium mt-1">
                  Filter: {selectedCategoryData.name}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 py-4">
            {/* Search Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indonesia-red focus:border-indonesia-red text-sm"
                placeholder="Cari cerita..."
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-indonesia-red shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-3 h-3" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('swipe')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'swipe'
                      ? 'bg-white text-indonesia-red shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  Swipe
                </button>
              </div>

              {/* Story Count */}
              <div className="text-xs text-gray-500">
                {filteredStories.length} 
                {filteredStories.length !== stories.length && (
                  <span> dari {stories.length}</span>
                )} 
                cerita
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory || searchQuery) && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Filter aktif:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-indonesia-red bg-opacity-10 text-indonesia-red rounded-full">
                    {selectedCategoryData?.name}
                    <button onClick={() => onCategoryChange(null)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    "{searchQuery}"
                    <button onClick={() => onSearchChange('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  Hapus semua
                </button>
              </div>
            )}

            {/* Stories Content */}
            <div className="flex-1">
              {filteredStories.length > 0 ? (
                <ScrollArea className="h-[600px]">
                  {viewMode === 'swipe' ? (
                    // Swipe Mode - Show cards with play button
                    <div className="grid grid-cols-1 gap-3">
                      {filteredStories.map((story, index) => (
                        <div key={story.id} className="relative">
                          <StoryCard
                            story={story}
                            onClick={() => handleStoryClick(story, index)}
                            compact
                          />
                          <button
                            onClick={() => handleSwipeStart(index)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg"
                          >
                            <div className="bg-white/90 rounded-full p-3">
                              <Play className="w-6 h-6 text-indonesia-red" />
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // List Mode
                    <div className="space-y-3">
                      {filteredStories.map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          onClick={() => handleStoryClick(story)}
                          compact
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">
                    {searchQuery || selectedCategory 
                      ? 'Tidak ada cerita yang cocok dengan filter' 
                      : 'Belum ada cerita tersedia'
                    }
                  </p>
                  {(searchQuery || selectedCategory) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-indonesia-red hover:text-indonesia-deep-red"
                    >
                      Hapus semua filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="border-t pt-4">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => router.push('/stories/new')}
                className="flex-1"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Bagikan Cerita
              </Button>
              <SheetClose asChild>
                <Button className="flex-1 bg-indonesia-red hover:bg-indonesia-deep-red">
                  Tutup
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Swipeable Story Viewer */}
      {showSwipeViewer && (
        <SwipeableStoryViewer
          stories={filteredStories}
          initialIndex={swipeStartIndex}
          onClose={() => setShowSwipeViewer(false)}
          onStorySelect={onStorySelect}
        />
      )}
    </>
  )
}