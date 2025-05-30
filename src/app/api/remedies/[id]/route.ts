// src/app/api/remedies/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createSupabaseClient()

    // Get the main remedy data
    const { data: remedy, error: remedyError } = await supabase
      .from('remedies')
      .select(`
        *,
        category:remedy_categories(id, name, icon, color, description),
        location:locations(id, name, type),
        author:profiles(id, full_name, username, avatar_url, bio)
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (remedyError || !remedy) {
      return NextResponse.json({ error: 'Remedy not found' }, { status: 404 })
    }

    // Get ingredients
    const { data: ingredients } = await supabase
      .from('remedy_ingredients')
      .select('*')
      .eq('remedy_id', id)
      .order('order_index')

    // Get steps
    const { data: steps } = await supabase
      .from('remedy_steps')
      .select('*')
      .eq('remedy_id', id)
      .order('step_number')

    // Get benefits
    const { data: benefits } = await supabase
      .from('remedy_benefits')
      .select('*')
      .eq('remedy_id', id)
      .order('order_index')

    // Get images
    const { data: images } = await supabase
      .from('remedy_images')
      .select('*')
      .eq('remedy_id', id)
      .order('order_index')

    // Get verified testimonials
    const { data: testimonials } = await supabase
      .from('remedy_testimonials')
      .select(`
        *,
        user:profiles(full_name, username, avatar_url)
      `)
      .eq('remedy_id', id)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })

    // Get verified verifications
    const { data: verifications } = await supabase
      .from('remedy_verifications')
      .select(`
        *,
        user:profiles(full_name, username, avatar_url)
      `)
      .eq('remedy_id', id)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })

    // Calculate verification summary
    const verificationSummary = {
      family_tradition_count: verifications?.filter(v => v.verification_type === 'family_tradition').length || 0,
      local_knowledge_count: verifications?.filter(v => v.verification_type === 'local_knowledge').length || 0,
      tried_personally_count: verifications?.filter(v => v.verification_type === 'tried_personally').length || 0,
      total_count: verifications?.length || 0
    }

    // Calculate average rating
    const avgRating = (testimonials || []).length > 0
      ? testimonials?.reduce((sum, t) => sum + (t.rating || 0), 0) / (testimonials || []).length
      : 0

    // Get primary image
    const primaryImage = images?.find(img => img.is_primary) || images?.[0]

    // Get main ingredients (marked as main)
    const mainIngredients = ingredients?.filter(ing => ing.is_main_ingredient) || []

    // Increment view count (fire and forget)
    supabase
      .from('remedies')
      .update({ view_count: (remedy.view_count || 0) + 1 })
      .eq('id', id)
      .then()

    const enhancedRemedy = {
      ...remedy,
      ingredients: ingredients || [],
      steps: steps || [],
      benefits: benefits || [],
      images: images || [],
      testimonials: testimonials || [],
      verifications: verifications || [],
      verification_summary: verificationSummary,
      primary_image: primaryImage?.image_url || null,
      main_ingredients: mainIngredients,
      avg_rating: Number(avgRating.toFixed(1)),
      testimonial_count: testimonials?.length || 0
    }

    return NextResponse.json({ remedy: enhancedRemedy })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createSupabaseClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user owns the remedy
    const { data: remedy, error: remedyError } = await supabase
      .from('remedies')
      .select('author_id')
      .eq('id', id)
      .single()

    if (remedyError || !remedy) {
      return NextResponse.json({ error: 'Remedy not found' }, { status: 404 })
    }

    if (remedy.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Update the remedy
    const { data: updatedRemedy, error: updateError } = await supabase
      .from('remedies')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update remedy' }, { status: 500 })
    }

    return NextResponse.json({ remedy: updatedRemedy })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createSupabaseClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user owns the remedy
    const { data: remedy, error: remedyError } = await supabase
      .from('remedies')
      .select('author_id')
      .eq('id', id)
      .single()

    if (remedyError || !remedy) {
      return NextResponse.json({ error: 'Remedy not found' }, { status: 404 })
    }

    if (remedy.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete by updating status
    const { error: deleteError } = await supabase
      .from('remedies')
      .update({ status: 'archived' })
      .eq('id', id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete remedy' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Remedy deleted successfully' })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}