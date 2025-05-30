'use client'

import { useState } from 'react'
import { ChevronDown, Filter, Grid3x3, List, ArrowUpDown, X } from 'lucide-react'
import type { Category } from '@/types/database'

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'oldest' | 'most_viewed' | 'most_verified' | 'alphabetical'

interface StoriesFiltersProps {
  categories: Category[]
  selectedCategory: string | null
  sortBy: SortOption
  viewMode: ViewMode
  onCategoryChange: (categoryId: string | null) => void
  onSortChange: (sort: SortOption) => void
  onViewModeChange: (mode: ViewMode) => void
  onReset: () => void
}

export function StoriesFilters({
  categories,
  selectedCategory,
  sortBy,
  viewMode,
  onCategoryChange,
  onSortChange,
  onViewModeChange,
  onReset
}: StoriesFiltersProps) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const sortOptions = [
    { value: 'newest' as const, label: 'Terbaru' },
    { value: 'oldest' as const, label: 'Terlama' },
    { value: 'most_viewed' as const, label: 'Paling Dilihat' },
    { value: 'most_verified' as const, label: 'Paling Terverifikasi' },
    { value: 'alphabetical' as const, label: 'A-Z' }
  ]

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name
  const selectedSortLabel = sortOptions.find(s => s.value === sortBy)?.label

  const hasActiveFilters = selectedCategory

  return (
    <div className="mb-6 space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm"
            >
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">
                {selectedCategoryName || 'Semua Kategori'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCategoryDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onCategoryChange(null)
                      setShowCategoryDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                      !selectedCategory ? 'bg-indonesia-red bg-opacity-10 text-indonesia-red' : 'text-gray-900'
                    }`}
                  >
                    Semua Kategori
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        onCategoryChange(category.id)
                        setShowCategoryDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-indonesia-red bg-opacity-10 text-indonesia-red' 
                          : 'text-gray-900'
                      }`}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Backdrop */}
            {showCategoryDropdown && (
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowCategoryDropdown(false)}
              />
            )}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm"
            >
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{selectedSortLabel}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showSortDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value)
                        setShowSortDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                        sortBy === option.value 
                          ? 'bg-indonesia-red bg-opacity-10 text-indonesia-red' 
                          : 'text-gray-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Backdrop */}
            {showSortDropdown && (
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowSortDropdown(false)}
              />
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-indonesia-red shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indonesia-red shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter aktif:</span>
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indonesia-red bg-opacity-10 text-indonesia-red text-sm rounded-full">
              {categories.find(c => c.id === selectedCategory)?.name}
              <button
                onClick={() => onCategoryChange(null)}
                className="hover:text-indonesia-deep-red"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}