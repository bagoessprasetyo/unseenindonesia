'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { MapControls } from './MapControls'
import { StoryMarker } from './StoryMarker'
import type { StoryWithDetails } from '@/types/database'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!

interface EnhancedInteractiveMapProps {
  center: [number, number]
  zoom: number
  stories: StoryWithDetails[]
  onStoryClick: (story: StoryWithDetails) => void
  onMapClick: (lng: number, lat: number) => void
  selectedTrustLevels?: number[]
  selectedCategories?: string[]
}

export function EnhancedInteractiveMap({
  center,
  zoom,
  stories,
  onStoryClick,
  onMapClick,
  selectedTrustLevels = [0, 1, 2, 3, 4],
  selectedCategories = []
}: EnhancedInteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12')
  const [showHeatmap, setShowHeatmap] = useState(false)

  // Filter stories based on selected criteria
  const filteredStories = stories.filter(story => {
    const trustLevelMatch = selectedTrustLevels.includes(story.trust_level || 0)
    const categoryMatch = selectedCategories.length === 0 || 
                         (story.category_id && selectedCategories.includes(story.category_id))
    return trustLevelMatch && categoryMatch
  })

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [center[1], center[0]],
      zoom: zoom,
      attributionControl: false,
    })

    // Add controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    )

    // Handle map clicks
    map.current.on('click', (e) => {
      onMapClick(e.lngLat.lng, e.lngLat.lat)
    })

    map.current.on('load', () => {
      setMapLoaded(true)
      setupHeatmapLayer()
    })

    // Listen for zoom to story events
    const handleZoomToStory = (event: any) => {
      const { story } = event.detail
      if (map.current && story) {
        // Extract coordinates from story
        const lat = (story as any).latitude
        const lng = (story as any).longitude
        
        if (lat && lng) {
          map.current.flyTo({
            center: [lng, lat],
            zoom: 15,
            duration: 2000
          })
        }
      }
    }

    window.addEventListener('zoomToStory', handleZoomToStory)

    return () => {
      window.removeEventListener('zoomToStory', handleZoomToStory)
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Setup heatmap layer
  const setupHeatmapLayer = () => {
    if (!map.current) return

    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: stories.map(story => {
        if (!story.coordinates) return null
        const coords = story.coordinates as any
        if (!coords.coordinates) return null

        return {
          type: 'Feature' as const,
          properties: {
            id: story.id,
            title: story.title,
            trust_level: story.trust_level || 0,
            verification_count: story.verification_count || 0
          },
          geometry: {
            type: 'Point' as const,
            coordinates: coords.coordinates
          }
        }
      }).filter(Boolean)
    }

    // map.current.addSource('stories-heatmap', {
    //   type: 'geojson',
    //   data: geojsonData
    // })

    // map.current.addLayer({
    //   id: 'stories-heatmap-layer',
    //   type: 'heatmap',
    //   source: 'stories-heatmap',
    //   maxzoom: 15,
    //   paint: {
    //     'heatmap-weight': [
    //       'interpolate',
    //       ['linear'],
    //       ['get', 'verification_count'],
    //       0, 0,
    //       10, 1
    //     ],
    //     'heatmap-intensity': [
    //       'interpolate',
    //       ['linear'],
    //       ['zoom'],
    //       0, 1,
    //       15, 3
    //     ],
    //     'heatmap-color': [
    //       'interpolate',
    //       ['linear'],
    //       ['heatmap-density'],
    //       0, 'rgba(255, 255, 255, 0)',
    //       0.2, 'rgb(255, 215, 0)',
    //       0.4, 'rgb(255, 165, 0)', 
    //       0.6, 'rgb(255, 69, 0)',
    //       0.8, 'rgb(255, 0, 0)',
    //       1, 'rgb(139, 0, 0)'
    //     ],
    //     'heatmap-radius': [
    //       'interpolate',
    //       ['linear'],
    //       ['zoom'],
    //       0, 2,
    //       15, 20
    //     ]
    //   },
    //   layout: {
    //     visibility: 'none'
    //   }
    // })
  }

  // Update map style
  useEffect(() => {
    if (!map.current || !mapLoaded) return
    map.current.setStyle(mapStyle)
  }, [mapStyle, mapLoaded])

  // Update map center and zoom
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    map.current.easeTo({
      center: [center[1], center[0]],
      zoom: zoom,
      duration: 1000
    })
  }, [center, zoom, mapLoaded])

  // Toggle heatmap
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const visibility = showHeatmap ? 'visible' : 'none'
    // map.current.setLayoutProperty('stories-heatmap-layer', 'visibility', visibility)
  }, [showHeatmap, mapLoaded])

  // Update story markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    console.log('Adding markers for stories:', filteredStories.length)

    // Add new markers
    filteredStories.forEach(story => {
      console.log('Processing story:', story.title)
      console.log('Story object:', story)
      
      // Check for new coordinate format from RPC
      const lat = (story as any).latitude
      const lng = (story as any).longitude
      
      console.log('Extracted lat/lng:', lat, lng)
      
      if (lat !== null && lng !== null && lat !== undefined && lng !== undefined) {
        console.log('Using extracted coordinates:', lng, lat)
        
        // Create custom marker
        const markerElement = StoryMarker({
          story,
          onClick: () => onStoryClick(story)
        })

        const marker = new mapboxgl.Marker({
          element: markerElement,
          anchor: 'center',
          offset: [0, 0]
        })
          .setLngLat([lng, lat])
          .addTo(map.current!)

        console.log('Added marker at:', lng, lat)
        
        // Add popup and event listeners...
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 15
        }).setHTML(`
          <div class="p-3 max-w-xs">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-lg">${story.category?.icon || '📍'}</span>
              <span class="text-xs px-2 py-1 bg-indonesia-red bg-opacity-10 text-indonesia-red rounded-full">
                ${story.category?.name || 'Umum'}
              </span>
            </div>
            <h3 class="font-semibold text-sm mb-1 line-clamp-2">${story.title}</h3>
            <p class="text-xs text-gray-600 mb-2 line-clamp-3">
              ${story.summary || story.content.substring(0, 100) + '...'}
            </p>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500">${story.location?.name || ''}</span>
              <div class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full ${getTrustLevelColor(story.trust_level || 0)}"></span>
                <span class="text-gray-500">${story.verification_count || 0} verifikasi</span>
              </div>
            </div>
          </div>
        `)

        markerElement.addEventListener('mouseenter', () => {
          popup.setLngLat([lng, lat]).addTo(map.current!)
        })

        markerElement.addEventListener('mouseleave', () => {
          popup.remove()
        })

        markersRef.current.push(marker)
        return
      }
      
      console.log('No extracted coordinates, trying fallback...')
      // Fallback to old coordinate parsing
      if (!story.coordinates) {
        console.log('No coordinates for story:', story.title)
        return
      }

      const coords = story.coordinates as any
      console.log('Coords object:', coords)
      
      if (!coords.coordinates) {
        console.log('No coordinates.coordinates for story:', story.title)
        return
      }

      const [lng2, lat2] = coords.coordinates
      console.log('Extracted coordinates:', lng2, lat2)

      // Create custom marker
      const markerElement = StoryMarker({
        story,
        onClick: () => onStoryClick(story)
      })

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center',
        offset: [0, 0]
      })
        .setLngLat([lng2, lat2])
        .addTo(map.current!)

      console.log('Added marker at:', lng2, lat2)

      // Create popup
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 15
      }).setHTML(`
        <div class="p-3 max-w-xs">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">${story.category?.icon || '📍'}</span>
            <span class="text-xs px-2 py-1 bg-indonesia-red bg-opacity-10 text-indonesia-red rounded-full">
              ${story.category?.name || 'Umum'}
            </span>
          </div>
          <h3 class="font-semibold text-sm mb-1 line-clamp-2">${story.title}</h3>
          <p class="text-xs text-gray-600 mb-2 line-clamp-3">
            ${story.summary || story.content.substring(0, 100) + '...'}
          </p>
          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-500">${story.location?.name || ''}</span>
            <div class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full ${getTrustLevelColor(story.trust_level || 0)}"></span>
              <span class="text-gray-500">${story.verification_count || 0} verifikasi</span>
            </div>
          </div>
        </div>
      `)

      markerElement.addEventListener('mouseenter', () => {
        popup.setLngLat([lng2, lat2]).addTo(map.current!)
      })

      markerElement.addEventListener('mouseleave', () => {
        popup.remove()
      })

      markersRef.current.push(marker)
    })

    console.log('Total markers added:', markersRef.current.length)
  }, [filteredStories, mapLoaded, onStoryClick])

  // Fit map to show all stories
  const fitToStories = () => {
    if (!map.current || filteredStories.length === 0) return

    const coordinates = filteredStories
      .map(story => {
        const lat = (story as any).latitude
        const lng = (story as any).longitude
        if (lat && lng) return [lng, lat]
        
        if (!story.coordinates) return null
        const coords = story.coordinates as any
        return coords.coordinates ? [coords.coordinates[0], coords.coordinates[1]] : null
      })
      .filter(Boolean) as [number, number][]

    if (coordinates.length === 0) return

    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord)
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    })
  }

  const getTrustLevelColor = (level: number) => {
    const colors = {
      0: 'bg-red-500',
      1: 'bg-yellow-500', 
      2: 'bg-green-500',
      3: 'bg-blue-500',
      4: 'bg-purple-500'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Controls */}
      <MapControls
        mapStyle={mapStyle}
        onMapStyleChange={setMapStyle}
        showHeatmap={showHeatmap}
        onToggleHeatmap={setShowHeatmap}
        onFitToStories={fitToStories}
        storyCount={filteredStories.length}
      />
      
      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indonesia-red mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Memuat peta...</p>
          </div>
        </div>
      )}
    </div>
  )
}