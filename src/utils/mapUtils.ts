import type { StoryWithDetails } from '@/types/database'

export const INDONESIA_BOUNDS = {
  north: 6.0,
  south: -11.0,
  east: 141.0,
  west: 95.0
}

export const INDONESIA_CENTER: [number, number] = [-2.5489, 118.0149]

export const MAP_STYLES = {
  STREETS: 'mapbox://styles/mapbox/streets-v12',
  SATELLITE: 'mapbox://styles/mapbox/satellite-v9',
  OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',
  LIGHT: 'mapbox://styles/mapbox/light-v11'
}

export function getStoryCoordinates(story: StoryWithDetails): [number, number] | null {
  if (!story.coordinates) return null
  
  const coords = story.coordinates as any
  if (!coords.coordinates || coords.coordinates.length < 2) return null
  
  return [coords.coordinates[1], coords.coordinates[0]] // [lat, lng]
}

export function calculateMapBounds(stories: StoryWithDetails[]): [[number, number], [number, number]] | null {
  const coordinates = stories
    .map(getStoryCoordinates)
    .filter(Boolean) as [number, number][]
    
  if (coordinates.length === 0) return null
  
  const lats = coordinates.map(coord => coord[0])
  const lngs = coordinates.map(coord => coord[1])
  
  return [
    [Math.min(...lats), Math.min(...lngs)], // SW
    [Math.max(...lats), Math.max(...lngs)]  // NE
  ]
}

export function getTrustLevelColor(level: number): string {
  const colors = {
    0: '#EF4444', // red-500
    1: '#F59E0B', // yellow-500
    2: '#10B981', // green-500
    3: '#3B82F6', // blue-500
    4: '#8B5CF6'  // purple-500
  }
  return colors[level as keyof typeof colors] || '#6B7280'
}

export function getTrustLevelLabel(level: number): string {
  const labels = {
    0: 'Baru',
    1: 'Menarik',
    2: 'Terverifikasi',
    3: 'Bersumber',
    4: 'Terpercaya'
  }
  return labels[level as keyof typeof labels] || 'Unknown'
}

export function groupStoriesByProximity(
  stories: StoryWithDetails[], 
  threshold: number = 0.01
): StoryWithDetails[][] {
  const groups: StoryWithDetails[][] = []
  const processed = new Set<string>()
  
  stories.forEach(story => {
    if (processed.has(story.id)) return
    
    const coords = getStoryCoordinates(story)
    if (!coords) return
    
    const group = [story]
    processed.add(story.id)
    
    stories.forEach(otherStory => {
      if (processed.has(otherStory.id)) return
      
      const otherCoords = getStoryCoordinates(otherStory)
      if (!otherCoords) return
      
      const distance = calculateDistance(coords, otherCoords)
      if (distance < threshold) {
        group.push(otherStory)
        processed.add(otherStory.id)
      }
    })
    
    groups.push(group)
  })
  
  return groups
}

function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const [lat1, lng1] = coord1
  const [lat2, lng2] = coord2
  
  const R = 6371 // Earth's radius in km
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}