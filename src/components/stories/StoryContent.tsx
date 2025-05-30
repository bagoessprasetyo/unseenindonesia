'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ExternalLink, BookOpen } from 'lucide-react'
import type { StoryWithDetails } from '@/types/database'

interface StoryContentProps {
  story: StoryWithDetails
}

export function StoryContent({ story }: StoryContentProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  const images = story.images || []
  const sources = story.sources || []
  const hasMultipleImages = images.length > 1

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="text-gray-700 leading-relaxed mb-4">
        {paragraph}
      </p>
    ))
  }

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Image Gallery */}
      {images.length > 0 && !imageError && (
        <div className="relative">
          <div className="aspect-video relative bg-gray-100">
            <Image
              src={images[currentImageIndex].image_url}
              alt={images[currentImageIndex].caption || story.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
            
            {/* Image Navigation */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Image Caption */}
          {images[currentImageIndex].caption && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-600 italic">
                {images[currentImageIndex].caption}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Historical Figures */}
        {story.historical_figures && story.historical_figures.length > 0 && (
          <div className="mb-6 p-4 bg-indonesia-red bg-opacity-5 rounded-lg border border-indonesia-red border-opacity-20">
            <h3 className="text-sm font-semibold text-indonesia-red mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Tokoh Sejarah
            </h3>
            <div className="flex flex-wrap gap-2">
              {story.historical_figures.map((figure, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 bg-indonesia-red bg-opacity-10 text-indonesia-red text-sm rounded-full"
                >
                  {figure}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Story Content */}
        <div className="prose prose-lg max-w-none">
          {formatContent(story.content)}
        </div>

        {/* Sources Section */}
        {sources.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Sumber & Referensi
            </h3>
            <div className="space-y-3">
              {sources.map((source, index) => (
                <div
                  key={source.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {source.source_type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                      </div>
                      
                      {source.source_title && (
                        <h4 className="font-medium text-gray-900 mb-1">
                          {source.source_title}
                        </h4>
                      )}
                      
                      {source.source_author && (
                        <p className="text-sm text-gray-600 mb-1">
                          Oleh: {source.source_author}
                        </p>
                      )}
                      
                      {source.source_description && (
                        <p className="text-sm text-gray-600">
                          {source.source_description}
                        </p>
                      )}
                    </div>
                    
                    {source.source_url && (
                      <a
                        href={source.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 text-indonesia-red hover:text-indonesia-deep-red"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Section */}
        {story.metadata && Object.keys(story.metadata).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <details className="group">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                Informasi Tambahan
              </summary>
              <div className="mt-2 text-sm text-gray-600">
                <pre className="whitespace-pre-wrap font-sans">
                  {JSON.stringify(story.metadata, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}
      </div>
    </article>
  )
}