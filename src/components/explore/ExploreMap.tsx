'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { getStoryCoordinates, getTrustLevelColor, INDONESIA_CENTER, INDONESIA_BOUNDS } from '@/utils/mapUtils'
import type { StoryWithDetails } from '@/types/database'

// Set Mapbox access token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

if (typeof window !== 'undefined' && MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN
  mapboxgl.prewarm()
  // Disable telemetry to prevent ad blocker errors
  ;(mapboxgl as any).clearPrewarmedResources()
}

interface ExploreMapProps {
  stories: StoryWithDetails[]
  onStoryClick: (story: StoryWithDetails) => void
}

interface StoryPopupData {
  story: StoryWithDetails
  coordinates: [number, number]
}

export function ExploreMap({ stories, onStoryClick }: ExploreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedStory, setSelectedStory] = useState<StoryPopupData | null>(null)
  const [tokenError, setTokenError] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Check if Mapbox token is available
    if (!MAPBOX_TOKEN) {
      setTokenError(true)
      return
    }

    // Block all Mapbox telemetry methods
    if (typeof window !== 'undefined') {
      const noop = () => Promise.resolve()
      
      // Override multiple request methods
      const originalFetch = window.fetch
      const originalXHR = window.XMLHttpRequest
      
      window.fetch = function(url, ...args) {
        if (typeof url === 'string' && url.includes('mapbox.com/events')) {
          return Promise.resolve(new Response('', { status: 204 }))
        }
        return originalFetch(url, ...args)
      }
      
      // Block navigator.sendBeacon
      if (navigator.sendBeacon) {
        const originalBeacon = navigator.sendBeacon
        navigator.sendBeacon = function(url, data) {
          if (typeof url === 'string' && url.includes('mapbox.com')) {
            return true
          }
          return originalBeacon.call(this, url, data)
        }
      }
    }

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [INDONESIA_CENTER[1], INDONESIA_CENTER[0]],
      zoom: 5,
      collectResourceTiming: false,
      maxBounds: [
        [INDONESIA_BOUNDS.west, INDONESIA_BOUNDS.south],
        [INDONESIA_BOUNDS.east, INDONESIA_BOUNDS.north]
      ]
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Wait for map to load
    map.current.on('load', () => {
      setMapLoaded(true)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.story-marker')
    existingMarkers.forEach(marker => marker.remove())

    // Add story markers
    stories.forEach(story => {
      const coordinates = getStoryCoordinates(story)
      if (!coordinates) return

      const [lat, lng] = coordinates
      const trustColor = getTrustLevelColor(story.trust_level || 0)

      // Create marker element
      const markerEl = document.createElement('div')
      markerEl.className = 'story-marker'
      markerEl.innerHTML = `
        <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-110" 
             style="background-color: ${trustColor}">
          <div class="w-full h-full rounded-full flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      `

      // Add click handler
      markerEl.addEventListener('click', (e) => {
        e.stopPropagation()
        setSelectedStory({ story, coordinates })
      })

      // Add marker to map
      new mapboxgl.Marker(markerEl)
        .setLngLat([lng, lat])
        .addTo(map.current!)
    })
  }, [stories, mapLoaded])

  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut()
    }
  }

  const handleResetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: [INDONESIA_CENTER[1], INDONESIA_CENTER[0]],
        zoom: 5,
        duration: 1000
      })
    }
  }

  const handleStorySelect = (story: StoryWithDetails) => {
    setSelectedStory(null)
    onStoryClick(story)
  }

  return (
    <div className="relative h-96 lg:h-[600px] rounded-lg overflow-hidden border border-gray-200">
      {/* Token Error Fallback */}
      {tokenError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mapbox Token Required
            </h3>
            <p className="text-gray-600 mb-4 max-w-md">
              To display the map, you need to set up a Mapbox access token.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>1. Get token at: <span className="font-mono">mapbox.com</span></p>
              <p>2. Add to <span className="font-mono">.env.local</span>:</p>
              <p className="font-mono bg-gray-100 px-2 py-1 rounded">
                NEXT_PUBLIC_MAPBOX_TOKEN=your_token
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Map Container */}
          <div ref={mapContainer} className="w-full h-full" />

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={handleResetView}
              className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Story Count */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 z-10">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-indonesia-red" />
              <span className="font-medium">{stories.length} cerita</span>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Tingkat Kepercayaan</h4>
            <div className="space-y-1">
              {[
                { level: 0, label: 'Baru', color: '#EF4444' },
                { level: 1, label: 'Menarik', color: '#F59E0B' },
                { level: 2, label: 'Terverifikasi', color: '#10B981' },
                { level: 3, label: 'Bersumber', color: '#3B82F6' },
                { level: 4, label: 'Terpercaya', color: '#8B5CF6' }
              ].map(({ level, label, color }) => (
                <div key={level} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Story Popup */}
          {selectedStory && (
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm z-20">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {selectedStory.story.title}
                </h3>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-indonesia-red bg-opacity-10 text-indonesia-red px-2 py-1 rounded-full">
                    {selectedStory.story.category?.icon} {selectedStory.story.category?.name}
                  </span>
                </div>
                
                {selectedStory.story.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedStory.story.location.name}</span>
                  </div>
                )}
                
                <p className="text-xs text-gray-600 line-clamp-3">
                  {selectedStory.story.summary || selectedStory.story.content.substring(0, 100) + '...'}
                </p>
              </div>
              
              <button
                onClick={() => handleStorySelect(selectedStory.story)}
                className="w-full bg-indonesia-red text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-indonesia-deep-red transition-colors"
              >
                Baca Cerita
              </button>
            </div>
          )}

          {/* Click outside to close popup */}
          {selectedStory && (
            <div 
              className="absolute inset-0 z-15"
              onClick={() => setSelectedStory(null)}
            />
          )}
        </>
      )}
    </div>
  )
}