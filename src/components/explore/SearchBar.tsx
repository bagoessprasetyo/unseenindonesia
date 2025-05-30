'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, Clock, TrendingUp } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock recent searches and trending topics
  const recentSearches = [
    'Majapahit',
    'Candi Borobudur',
    'Kerajaan Srivijaya',
    'Pangeran Diponegoro'
  ]

  const trendingTopics = [
    'Sejarah Jakarta',
    'Kerajaan Mataram',
    'Wali Songo',
    'Perang Puputan',
    'Candi Prambanan'
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setShowSuggestions(newValue.length === 0 && isFocused)
  }

  const handleFocus = () => {
    setIsFocused(true)
    setShowSuggestions(value.length === 0)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const clearSearch = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative" ref={inputRef}>
      <div className={`relative transition-all duration-200 ${
        isFocused ? 'transform scale-[1.02]' : ''
      }`}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`w-5 h-5 transition-colors ${
            isFocused ? 'text-indonesia-red' : 'text-gray-400'
          }`} />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full pl-12 pr-12 py-4 bg-white border-2 rounded-xl shadow-sm transition-all duration-200 text-gray-900 placeholder-gray-500 ${
            isFocused 
              ? 'border-indonesia-red ring-4 ring-indonesia-red ring-opacity-10' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        />
        
        {value && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
          <div className="p-4 space-y-4">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  <Clock className="w-3 h-3" />
                  Pencarian Terakhir
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Topics */}
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                <TrendingUp className="w-3 h-3" />
                Trending
              </div>
              <div className="space-y-1">
                {trendingTopics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(topic)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center justify-between"
                  >
                    <span>{topic}</span>
                    <TrendingUp className="w-3 h-3 text-indonesia-red" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}