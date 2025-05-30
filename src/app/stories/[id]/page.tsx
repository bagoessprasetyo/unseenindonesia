'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { StoryContent } from '@/components/stories/StoryContent'
import { StoryMeta } from '@/components/stories/StoryMeta'
import { VerificationPanel } from '@/components/stories/VerificationPanel'
import { RelatedStories } from '@/components/stories/RelatedStories'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/components/providers/Providers'
import type { StoryWithDetails } from '@/types/database'
import { Loader2, ArrowLeft, Share2 } from 'lucide-react'

export default function StoryDetailPage() {
  const [story, setStory] = useState<StoryWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const storyId = params.id as string

  useEffect(() => {
    loadStory()
    incrementViewCount()
  }, [storyId])

  const loadStory = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          category:categories(*),
          location:locations(*),
          author:profiles(*),
          images:story_images(*),
          sources:story_sources(*),
          verifications:verifications(
            *,
            user:profiles(*)
          )
        `)
        .eq('id', storyId)
        .eq('status', 'published')
        .single()

      if (error) throw error
      setStory(data)
    } catch (err) {
      setError('Story not found')
      console.error('Error loading story:', err)
    } finally {
      setLoading(false)
    }
  }

  const incrementViewCount = async () => {
    await supabase.rpc('increment_view_count', {
      story_id: storyId
    })
  }

  const handleShare = async () => {
    if (navigator.share && story) {
      try {
        await navigator.share({
          title: story.title,
          text: story.summary || story.content.substring(0, 100) + '...',
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      // TODO: Show toast notification
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-indonesia-red" />
        </div>
      </MainLayout>
    )
  }

  if (error || !story) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Story Not Found</h1>
            <p className="text-gray-600 mb-4">The story you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-indonesia-red text-white px-4 py-2 rounded-lg hover:bg-indonesia-deep-red"
            >
              Back to Home
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 text-indonesia-red border border-indonesia-red rounded-lg hover:bg-red-50"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <StoryMeta story={story} />
            <StoryContent story={story} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <VerificationPanel 
              story={story} 
              user={user}
              onVerificationAdded={loadStory}
            />
            <RelatedStories 
              currentStoryId={story.id}
              categoryId={story.category_id}
              locationId={story.location_id}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}