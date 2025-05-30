'use client'

import { useState } from 'react'
import { Clock, ChevronDown } from 'lucide-react'

interface TimePeriodFilterProps {
  selectedPeriod: string | null
  onPeriodChange: (period: string | null) => void
}

const TIME_PERIODS = [
  { value: 'prehistoric', label: 'Prasejarah', description: 'Sebelum 400 M' },
  { value: 'ancient_kingdoms', label: 'Kerajaan Kuno', description: '400-1500 M' },
  { value: 'majapahit', label: 'Era Majapahit', description: '1293-1527 M' },
  { value: 'islamic_period', label: 'Periode Islam Awal', description: '1400-1600 M' },
  { value: 'colonial_early', label: 'Kolonial Awal', description: '1600-1800 M' },
  { value: 'colonial_late', label: 'Kolonial Akhir', description: '1800-1945 M' },
  { value: 'independence', label: 'Kemerdekaan', description: '1945-1960 M' },
  { value: 'modern', label: 'Modern', description: '1960-sekarang' },
]

export function TimePeriodFilter({ selectedPeriod, onPeriodChange }: TimePeriodFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedPeriodLabel = TIME_PERIODS.find(p => p.value === selectedPeriod)?.label

  const handlePeriodSelect = (period: string | null) => {
    onPeriodChange(period)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Periode Waktu
      </label>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-indonesia-red focus:border-transparent transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className={selectedPeriodLabel ? 'text-gray-900' : 'text-gray-500'}>
              {selectedPeriodLabel || 'Pilih periode'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-hidden">
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {/* All periods option */}
              <button
                onClick={() => handlePeriodSelect(null)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                  !selectedPeriod ? 'bg-indonesia-red bg-opacity-10 text-indonesia-red' : 'text-gray-900'
                }`}
              >
                <div>
                  <div className="font-medium">Semua Periode</div>
                  <div className="text-xs text-gray-500">Tampilkan semua era</div>
                </div>
              </button>

              {TIME_PERIODS.map((period) => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodSelect(period.value)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selectedPeriod === period.value 
                      ? 'bg-indonesia-red bg-opacity-10 text-indonesia-red' 
                      : 'text-gray-900'
                  }`}
                >
                  <div>
                    <div className="font-medium">{period.label}</div>
                    <div className="text-xs text-gray-500">{period.description}</div>
                  </div>
                </button>
              ))}
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