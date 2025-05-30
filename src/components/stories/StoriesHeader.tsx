'use client'

import { useState } from 'react'
import { Search, BookOpen, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/Providers'

interface StoriesHeaderProps {
  totalCount: number
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function StoriesHeader({ totalCount, searchQuery, onSearchChange }: StoriesHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="mb-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-accent font-bold text-gray-900 mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indonesia-red" />
          Semua Cerita
        </h1>
        <p className="text-gray-600">
          Jelajahi {totalCount.toLocaleString()} cerita sejarah dari seluruh nusantara
        </p>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className={`relative transition-all duration-200 ${
            searchFocused ? 'transform scale-[1.02]' : ''
          }`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`w-5 h-5 transition-colors ${
                searchFocused ? 'text-indonesia-red' : 'text-gray-400'
              }`} />
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Cari cerita, tokoh, atau kata kunci..."
              className={`w-full pl-10 pr-4 py-3 bg-white border-2 rounded-xl shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                searchFocused 
                  ? 'border-indonesia-red ring-4 ring-indonesia-red ring-opacity-10' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* Add Story Button */}
        {user && (
          <button
            onClick={() => router.push('/stories/new')}
            className="flex items-center gap-2 px-6 py-3 bg-indonesia-red text-white rounded-xl font-medium hover:bg-indonesia-deep-red transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Bagikan Cerita</span>
            <span className="sm:hidden">Bagikan</span>
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-indonesia-red">{totalCount}</div>
          <div className="text-sm text-gray-600">Total Cerita</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">234</div>
          <div className="text-sm text-gray-600">Terverifikasi</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">67</div>
          <div className="text-sm text-gray-600">Kontributor</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">15</div>
          <div className="text-sm text-gray-600">Kategori</div>
        </div>
      </div>
    </div>
  )
}