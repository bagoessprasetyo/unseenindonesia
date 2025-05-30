'use client'

import { useState } from 'react'
import { ChevronDown, ArrowUpDown } from 'lucide-react'

type SortOption = 'newest' | 'oldest' | 'most_viewed' | 'most_verified' | 'alphabetical'

interface SortDropdownProps {
  value: SortOption
  onChange: (option: SortOption) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const options = [
    { value: 'newest' as const, label: 'Terbaru', description: 'Cerita terbaru duluan' },
    { value: 'oldest' as const, label: 'Terlama', description: 'Cerita terlama duluan' },
    { value: 'most_viewed' as const, label: 'Paling Dilihat', description: 'Berdasarkan views' },
    { value: 'most_verified' as const, label: 'Paling Terverifikasi', description: 'Berdasarkan verifikasi' },
    { value: 'alphabetical' as const, label: 'A-Z', description: 'Berdasarkan abjad' }
  ]

  const currentOption = options.find(opt => opt.value === value)

  const handleOptionSelect = (option: SortOption) => {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm"
      >
        <ArrowUpDown className="w-4 h-4 text-gray-400" />
        <span className="text-gray-700">
          {currentOption?.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                  value === option.value 
                    ? 'bg-indonesia-red bg-opacity-10 text-indonesia-red' 
                    : 'text-gray-900'
                }`}
              >
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}