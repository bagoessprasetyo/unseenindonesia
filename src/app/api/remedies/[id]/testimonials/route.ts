// src/app/api/remedies/[id]/testimonials/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const verified_only = searchParams.get('verified_only') !== 'false' // default to true
    
    const supabase = createSupabaseClient()

    let query = supabase
      .from('remedy_testimonials')
      .select(`
        *,
        user:profiles(full_name, username, avatar_url)
      `)
      .eq('remedy_id', id)

    if (verified_only) {
      query = query.eq('is_verified', true)
    }

    query = query.order('created_at', { ascending: false })

    const { data: testimonials, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
    }

    return NextResponse.json({ testimonials: testimonials || [] })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    // Verify remedy exists
    const { data: remedy, error: remedyError } = await supabase
      .from('remedies')
      .select('id')
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (remedyError || !remedy) {
      return NextResponse.json({ error: 'Remedy not found' }, { status: 404 })
    }

    // Check if user already has a testimonial for this remedy
    const { data: existingTestimonial } = await supabase
      .from('remedy_testimonials')
      .select('id')
      .eq('remedy_id', id)
      .eq('user_id', user.id)
      .single()

    if (existingTestimonial) {
      return NextResponse.json(
        { error: 'You have already submitted a testimonial for this remedy' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      location,
      testimonial,
      rating,
      usage_duration,
      health_condition,
      results_experienced,
      would_recommend
    } = body

    // Validate required fields
    if (!testimonial || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: testimonial, rating' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Create testimonial
    const { data: newTestimonial, error: insertError } = await supabase
      .from('remedy_testimonials')
      .insert({
        remedy_id: id,
        user_id: user.id,
        name,
        location,
        testimonial,
        rating,
        usage_duration,
        health_condition,
        results_experienced,
        would_recommend: would_recommend !== false, // default to true
        is_verified: false // requires admin approval
      })
      .select(`
        *,
        user:profiles(full_name, username, avatar_url)
      `)
      .single()

    if (insertError) {
      console.error('Testimonial creation error:', insertError)
      return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
    }

    return NextResponse.json({ 
      testimonial: newTestimonial,
      message: 'Testimonial submitted successfully. It will be reviewed before being published.'
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update testimonial (only by the author)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const testimonial_id = searchParams.get('testimonial_id')
    
    if (!testimonial_id) {
      return NextResponse.json(
        { error: 'Missing testimonial_id parameter' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user owns the testimonial
    const { data: testimonial, error: testimonialError } = await supabase
      .from('remedy_testimonials')
      .select('user_id')
      .eq('id', testimonial_id)
      .eq('remedy_id', id)
      .single()

    if (testimonialError || !testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    if (testimonial.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Update testimonial and reset verification status
    const { data: updatedTestimonial, error: updateError } = await supabase
      .from('remedy_testimonials')
      .update({
        ...body,
        is_verified: false, // reset verification after edit
        updated_at: new Date().toISOString()
      })
      .eq('id', testimonial_id)
      .select(`
        *,
        user:profiles(full_name, username, avatar_url)
      `)
      .single()

    if (updateError) {
      console.error('Testimonial update error:', updateError)
      return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 })
    }

    return NextResponse.json({ 
      testimonial: updatedTestimonial,
      message: 'Testimonial updated successfully. It will be reviewed again.'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}