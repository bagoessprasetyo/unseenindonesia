'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, MapPin, BookOpen, Clock } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import type { Story, Location, Category } from '@/types/database'

interface SearchResult {
  type: 'story' | 'location' | 'category'
  id: string
  title: string
  description?: string
  location?: string
  category?: string
}

interface SearchComponentProps {
  className?: string
  placeholder?: string
  isMobile?: boolean
}

export function SearchComponent({ 
  className = "", 
  placeholder = "Cari cerita, lokasi, atau periode...",
  isMobile = false 
}: SearchComponentProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recent_searches')
    if (recent) {
      setRecentSearches(JSON.parse(recent))
    }
  }, [])

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      // Search stories
      const { data: stories } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          summary,
          location:locations(name),
          category:categories(name)
        `)
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`)
        .eq('status', 'published')
        .limit(5)

      // Search locations
      const { data: locations } = await supabase
        .from('locations')
        .select('id, name, type')
        .ilike('name', `%${searchQuery}%`)
        .limit(3)

      // Search categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, description')
        .ilike('name', `%${searchQuery}%`)
        .limit(2)

      const searchResults: SearchResult[] = []

      // Add story results
      stories?.forEach(story => {
        searchResults.push({
          type: 'story',
          id: story.id,
          title: story.title,
          description: story.summary,
          location: story.location?.[0]?.name ,
          category: story.category?.[0]?.name
        })
      })

      // Add location results
      locations?.forEach(location => {
        searchResults.push({
          type: 'location',
          id: location.id,
          title: location.name,
          description: `${location.type} di Indonesia`
        })
      })

      // Add category results
      categories?.forEach(category => {
        searchResults.push({
          type: 'category',
          id: category.id,
          title: category.name,
          description: category.description || 'Kategori cerita'
        })
      })

      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    if (value.trim()) {
      performSearch(value)
      setShowResults(true)
    } else {
      setResults([])
      setShowResults(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const newRecent = [result.title, ...recentSearches.filter(r => r !== result.title)].slice(0, 5)
    setRecentSearches(newRecent)
    localStorage.setItem('recent_searches', JSON.stringify(newRecent))

    // Navigate based on result type
    switch (result.type) {
      case 'story':
        router.push(`/stories/${result.id}`)
        break
      case 'location':
        router.push(`/explore?location=${result.id}`)
        break
      case 'category':
        router.push(`/explore?category=${result.id}`)
        break
    }

    setQuery('')
    setShowResults(false)
    inputRef.current?.blur()
  }

  const handleRecentClick = (recent: string) => {
    setQuery(recent)
    performSearch(recent)
    setShowResults(true)
    inputRef.current?.focus()
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query)}`)
      setShowResults(false)
      inputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setShowResults(false)
      inputRef.current?.blur()
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'story': return <BookOpen className="w-4 h-4 text-indonesia-red" />
      case 'location': return <MapPin className="w-4 h-4 text-green-600" />
      case 'category': return <Clock className="w-4 h-4 text-blue-600" />
      default: return <Search className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indonesia-red focus:border-indonesia-red"
          placeholder={placeholder}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indonesia-red"></div>
              Mencari...
            </div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-b-0"
                >
                  {getResultIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </p>
                    {result.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {result.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {result.location && (
                        <span className="text-xs text-gray-400">📍 {result.location}</span>
                      )}
                      {result.category && (
                        <span className="text-xs text-gray-400">🏷️ {result.category}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              
              {query.trim() && (
                <button
                  onClick={() => {
                    router.push(`/explore?q=${encodeURIComponent(query)}`)
                    setShowResults(false)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-t border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-indonesia-red" />
                    <span className="text-sm text-indonesia-red font-medium">
                      Lihat semua hasil untuk "{query}"
                    </span>
                  </div>
                </button>
              )}
            </div>
          ) : query ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              Tidak ada hasil untuk "{query}"
            </div>
          ) : recentSearches.length > 0 ? (
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Pencarian Terkini
              </div>
              {recentSearches.map((recent, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentClick(recent)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{recent}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}