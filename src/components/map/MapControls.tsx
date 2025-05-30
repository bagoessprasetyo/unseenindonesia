'use client'

import { useState } from 'react'
import { 
  Map, 
  Satellite, 
  Mountain, 
  Activity, 
  Maximize2, 
  Settings,
  ChevronDown
} from 'lucide-react'

interface MapControlsProps {
  mapStyle: string
  onMapStyleChange: (style: string) => void
  showHeatmap: boolean
  onToggleHeatmap: (show: boolean) => void
  onFitToStories: () => void
  storyCount: number
}

export function MapControls({
  mapStyle,
  onMapStyleChange,
  showHeatmap,
  onToggleHeatmap,
  onFitToStories,
  storyCount
}: MapControlsProps) {
  const [showStyleMenu, setShowStyleMenu] = useState(false)

  const mapStyles = [
    {
      id: 'mapbox://styles/mapbox/streets-v12',
      name: 'Streets',
      icon: Map,
      description: 'Classic street map'
    },
    {
      id: 'mapbox://styles/mapbox/satellite-v9',
      name: 'Satellite',
      icon: Satellite,
      description: 'Satellite imagery'
    },
    {
      id: 'mapbox://styles/mapbox/outdoors-v12',
      name: 'Outdoors',
      icon: Mountain,
      description: 'Topographic features'
    },
    {
      id: 'mapbox://styles/mapbox/light-v11',
      name: 'Light',
      icon: Settings,
      description: 'Minimal light theme'
    }
  ]

  const currentStyle = mapStyles.find(style => style.id === mapStyle)

  return (
    <div className="absolute top-4 right-4 space-y-2 z-10">
      {/* Style Selector */}
      <div className="relative">
        <button
          onClick={() => setShowStyleMenu(!showStyleMenu)}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 hover:bg-gray-50 flex items-center gap-2 min-w-32"
        >
          {currentStyle && <currentStyle.icon className="w-4 h-4 text-gray-600" />}
          <span className="text-sm font-medium text-gray-700">
            {currentStyle?.name || 'Map Style'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {showStyleMenu && (
          <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48 z-20">
            {mapStyles.map((style) => {
              const StyleIcon = style.icon
              return (
                <button
                  key={style.id}
                  onClick={() => {
                    onMapStyleChange(style.id)
                    setShowStyleMenu(false)
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 ${
                    mapStyle === style.id ? 'bg-indonesia-red bg-opacity-5 text-indonesia-red' : ''
                  }`}
                >
                  <StyleIcon className="w-4 h-4" />
                  <div>
                    <div className="text-sm font-medium">{style.name}</div>
                    <div className="text-xs text-gray-500">{style.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Heatmap Toggle */}
      <button
        onClick={() => onToggleHeatmap(!showHeatmap)}
        className={`bg-white rounded-lg shadow-lg border border-gray-200 p-3 hover:bg-gray-50 flex items-center gap-2 ${
          showHeatmap ? 'bg-indonesia-red text-white' : ''
        }`}
        title="Toggle story density heatmap"
      >
        <Activity className="w-4 h-4" />
        <span className="text-sm font-medium">Heatmap</span>
      </button>

      {/* Fit to Stories */}
      <button
        onClick={onFitToStories}
        className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 hover:bg-gray-50 flex items-center gap-2"
        title="Fit map to show all stories"
      >
        <Maximize2 className="w-4 h-4" />
        <span className="text-sm font-medium">Fit All</span>
      </button>

      {/* Story Count */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="text-center">
          <div className="text-lg font-bold text-indonesia-red">{storyCount}</div>
          <div className="text-xs text-gray-500">Stories</div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showStyleMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowStyleMenu(false)}
        />
      )}
    </div>
  )
}