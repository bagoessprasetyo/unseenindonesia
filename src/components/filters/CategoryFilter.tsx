'use client'

import { useState } from 'react'
import { Check, X, Filter } from 'lucide-react'
import type { Category } from '@/types/database'
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
import { ScrollArea } from '../ui/scroll-area'

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
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)
  const filterCount = selectedCategory ? 1 : 0

  const handleCategorySelect = (categoryId: string | null) => {
    onCategoryChange(categoryId)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-white shadow-lg border-gray-200 hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter Kategori</span>
          {filterCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-indonesia-red text-white">
              {filterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indonesia-red" />
            Filter Kategori Cerita
          </SheetTitle>
          <SheetDescription>
            Pilih kategori untuk memfilter cerita yang ditampilkan di peta
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-6">
          {/* All Categories Option */}
          <button
            onClick={() => handleCategorySelect(null)}
            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
              selectedCategory === null
                ? 'bg-indonesia-red text-white border-indonesia-red'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🗺️</span>
              <div className="text-left">
                <div className="font-medium">Semua Kategori</div>
                <div className="text-sm opacity-75">
                  Tampilkan semua cerita
                </div>
              </div>
            </div>
            {selectedCategory === null && (
              <Check className="w-5 h-5" />
            )}
          </button>

          {/* Category List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Pilih Kategori:</h4>
            <ScrollArea className="h-96 rounded-md border">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
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
            </ScrollArea>
          </div>
        </div>

        <SheetFooter className="flex-col space-y-2">
          {/* Current Selection */}
          {selectedCategoryData && (
            <div className="w-full p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Filter aktif:</div>
              <div className="flex items-center gap-2">
                <span>{selectedCategoryData.icon}</span>
                <span className="font-medium">{selectedCategoryData.name}</span>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2 w-full">
            {selectedCategory && (
              <Button
                variant="outline"
                onClick={() => handleCategorySelect(null)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Hapus Filter
              </Button>
            )}
            <SheetClose asChild>
              <Button className="flex-1 bg-indonesia-red hover:bg-indonesia-deep-red">
                Tutup
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}