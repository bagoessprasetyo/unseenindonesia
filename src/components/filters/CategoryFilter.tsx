'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import type { Category } from '@/types/database'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange
}: CategoryFilterProps) {
  const [showAll, setShowAll] = useState(false)
  
  const displayCategories = showAll ? categories : categories.slice(0, 6)

  return (
    <div className="space-y-3">
      {/* All Categories Option */}
      <button
        onClick={() => onCategoryChange(null)}
        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
          selectedCategory === null
            ? 'bg-indonesia-red text-white border-indonesia-red'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🗺️</span>
          <span className="font-medium text-sm">Semua Kategori</span>
        </div>
        {selectedCategory === null && (
          <Check className="w-4 h-4" />
        )}
      </button>

      {/* Category List */}
      <div className="space-y-2">
        {displayCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
              selectedCategory === category.id
                ? 'bg-indonesia-red text-white border-indonesia-red'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{category.icon}</span>
              <div className="text-left">
                <div className="font-medium text-sm">{category.name}</div>
                {category.description && (
                  <div className="text-xs opacity-75 line-clamp-1">
                    {category.description}
                  </div>
                )}
              </div>
            </div>
            {selectedCategory === category.id && (
              <Check className="w-4 h-4" />
            )}
          </button>
        ))}
      </div>

      {/* Show More/Less Button */}
      {categories.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-center text-sm text-indonesia-red hover:text-indonesia-deep-red font-medium py-2"
        >
          {showAll ? 'Tampilkan Lebih Sedikit' : `Tampilkan ${categories.length - 6} Lainnya`}
        </button>
      )}

      {/* Clear Filter */}
      {selectedCategory && (
        <button
          onClick={() => onCategoryChange(null)}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" />
          Hapus Filter
        </button>
      )}
    </div>
  )
}