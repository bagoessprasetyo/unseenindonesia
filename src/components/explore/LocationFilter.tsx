'use client'

import { useState } from 'react'
import { MapPin, ChevronDown, Search } from 'lucide-react'
import type { Location } from '@/types/database'

interface LocationFilterProps {
  locations: Location[]
  selectedLocation: string | null
  onLocationChange: (locationId: string | null) => void
}

export function LocationFilter({ locations, selectedLocation, onLocationChange }: LocationFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedLocationName = locations.find(l => l.id === selectedLocation)?.name

  const handleLocationSelect = (locationId: string | null) => {
    onLocationChange(locationId)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Lokasi
      </label>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-indonesia-red focus:border-transparent transition-colors"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className={selectedLocationName ? 'text-gray-900' : 'text-gray-500'}>
              {selectedLocationName || 'Pilih lokasi'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari lokasi..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indonesia-red focus:border-transparent"
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {/* All locations option */}
              <button
                onClick={() => handleLocationSelect(null)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                  !selectedLocation ? 'bg-indonesia-red bg-opacity-10 text-indonesia-red' : 'text-gray-900'
                }`}
              >
                Semua Lokasi
              </button>

              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedLocation === location.id 
                        ? 'bg-indonesia-red bg-opacity-10 text-indonesia-red' 
                        : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{location.name}</span>
                      <span className="text-xs text-gray-500 capitalize">
                        ({location.type})
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  Tidak ada lokasi ditemukan
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}