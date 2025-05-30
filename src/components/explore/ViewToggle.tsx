'use client'

import { Grid3x3, List, Map as MapIcon } from 'lucide-react'

type ViewMode = 'grid' | 'list' | 'map'

interface ViewToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const options = [
    { mode: 'grid' as const, icon: Grid3x3, label: 'Grid' },
    { mode: 'list' as const, icon: List, label: 'List' },
    { mode: 'map' as const, icon: MapIcon, label: 'Map' }
  ]

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      {options.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            value === mode
              ? 'bg-white text-indonesia-red shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title={label}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}