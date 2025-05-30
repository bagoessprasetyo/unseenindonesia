'use client'

import type { StoryWithDetails } from '@/types/database'

interface StoryMarkerProps {
  story: StoryWithDetails
  onClick: () => void
}

export function StoryMarker({ story, onClick }: StoryMarkerProps): HTMLElement {
  const getTrustLevelColor = (level: number) => {
    const colors = {
      0: '#EF4444', // red-500
      1: '#F59E0B', // yellow-500
      2: '#10B981', // green-500
      3: '#3B82F6', // blue-500
      4: '#8B5CF6'  // purple-500
    }
    return colors[level as keyof typeof colors] || '#6B7280'
  }

  const getTrustLevelSize = (level: number) => {
    const sizes = {
      0: 20,
      1: 22,
      2: 24,
      3: 26,
      4: 28
    }
    return sizes[level as keyof typeof sizes] || 20
  }

  const markerEl = document.createElement('div')
  markerEl.className = 'story-marker cursor-pointer'
  const size = getTrustLevelSize(story.trust_level || 0)
  const color = getTrustLevelColor(story.trust_level || 0)
  const categoryIcon = story.category?.icon || '📍'

  markerEl.style.width = `${size}px`
  markerEl.style.height = `${size}px`
  markerEl.style.transformOrigin = 'center center'
  markerEl.style.position = 'absolute'
  markerEl.style.top = '0'
  markerEl.style.left = '0'
  
//   const size = getTrustLevelSize(story.trust_level || 0)
//   const color = getTrustLevelColor(story.trust_level || 0)
//   const categoryIcon = story.category?.icon || '📍'

  markerEl.innerHTML = `
    <div class="relative transition-transform duration-200 hover:scale-110" style="transform-origin: center center;">
      <!-- Main marker circle -->
      <div 
        class="rounded-full border-2 border-white shadow-lg flex items-center justify-center"
        style="
          width: ${size}px; 
          height: ${size}px; 
          background-color: ${color};
        "
      >
        <span style="font-size: ${size * 0.5}px; line-height: 1;">
          ${categoryIcon}
        </span>
      </div>
      
      <!-- Verification count badge -->
      ${(story.verification_count || 0) > 0 ? `
        <div 
          class="absolute -top-1 -right-1 bg-white text-xs font-bold rounded-full border border-gray-300 flex items-center justify-center"
          style="
            min-width: 16px; 
            height: 16px; 
            font-size: 10px;
            color: ${color};
          "
        >
          ${story.verification_count}
        </div>
      ` : ''}
      
      <!-- Pulse animation for high verification -->
      ${(story.verification_count || 0) >= 5 ? `
        <div 
          class="absolute inset-0 rounded-full animate-ping"
          style="background-color: ${color}; opacity: 0.4;"
        ></div>
      ` : ''}
    </div>
  `

  // Add click handler
  markerEl.addEventListener('click', (e) => {
    e.stopPropagation()
    onClick()
  })

  // Add hover effects with proper positioning
  // Using CSS hover instead of JS to prevent positioning issues

  // Add double-click for zoom
  markerEl.addEventListener('dblclick', (e) => {
    e.stopPropagation()
    // Trigger zoom to story location
    const event = new CustomEvent('zoomToStory', { 
      detail: { story } 
    })
    window.dispatchEvent(event)
  })

  // Add right-click context menu
  markerEl.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Show context menu
    const contextMenu = document.createElement('div')
    contextMenu.className = 'fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50'
    contextMenu.style.left = `${e.clientX}px`
    contextMenu.style.top = `${e.clientY}px`
    
    contextMenu.innerHTML = `
      <button class="w-full px-4 py-2 text-sm hover:bg-gray-50 text-left">View Story</button>
      <button class="w-full px-4 py-2 text-sm hover:bg-gray-50 text-left">Share Location</button>
      <button class="w-full px-4 py-2 text-sm hover:bg-gray-50 text-left">Get Directions</button>
    `
    
    document.body.appendChild(contextMenu)
    
    // Remove context menu on click outside
    const removeMenu = () => {
      document.body.removeChild(contextMenu)
      document.removeEventListener('click', removeMenu)
    }
    
    setTimeout(() => document.addEventListener('click', removeMenu), 0)
  })

  return markerEl
}