// src/app/api/remedies/[id]/verifications/route.ts
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
    const type = searchParams.get('type') // filter by verification type
    
    const supabase = createSupabaseClient()

    let query = supabase
      .from('remedy_verifications')
      .select(`
        *,
        user:profiles(full_name, username, avatar_url)
      `)
      .eq('remedy_id', id)

    if (verified_only) {
      query = query.eq('is_verified', true)
    }

    if (type) {
      query = query.eq('verification_type', type)
    }

    query = query.order('created_at', { ascending: false })

    const { data: verifications, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 })
    }

    // Group verifications by type for summary
    const summary = {
      family_tradition: verifications?.filter(v => v.verification_type === 'family_tradition').length || 0,
      local_knowledge: verifications?.filter(v => v.verification_type === 'local_knowledge').length || 0,
      tried_personally: verifications?.filter(v => v.verification_type === 'tried_personally').length || 0,
      cultural_authenticity: verifications?.filter(v => v.verification_type === 'cultural_authenticity').length || 0,
      ingredient_accuracy: verifications?.filter(v => v.verification_type === 'ingredient_accuracy').length || 0,
      safety_concern: verifications?.filter(v => v.verification_type === 'safety_concern').length || 0,
      medical_validation: verifications?.filter(v => v.verification_type === 'medical_validation').length || 0,
      total: verifications?.length || 0,
      positive: verifications?.filter(v => v.is_positive).length || 0,
      concerns: verifications?.filter(v => !v.is_positive).length || 0
    }

    return NextResponse.json({ 
      verifications: verifications || [],
      summary 
    })

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

    const body = await request.json()
    const {
      verification_type,
      evidence_text,
      evidence_url,
      confidence_level,
      is_positive,
      expertise_area,
      years_of_experience,
      location_context,
      additional_notes
    } = body

    // Validate required fields
    if (!verification_type || !evidence_text) {
      return NextResponse.json(
        { error: 'Missing required fields: verification_type, evidence_text' },
        { status: 400 }
      )
    }

    // Validate verification type
    const validTypes = [
      'family_tradition',
      'local_knowledge', 
      'tried_personally',
      'cultural_authenticity',
      'ingredient_accuracy',
      'safety_concern',
      'medical_validation'
    ]

    if (!validTypes.includes(verification_type)) {
      return NextResponse.json(
        { error: 'Invalid verification type' },
        { status: 400 }
      )
    }

    // Validate confidence level
    if (confidence_level && (confidence_level < 1 || confidence_level > 5)) {
      return NextResponse.json(
        { error: 'Confidence level must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user already has a verification of this type for this remedy
    const { data: existingVerification } = await supabase
      .from('remedy_verifications')
      .select('id')
      .eq('remedy_id', id)
      .eq('user_id', user.id)
      .eq('verification_type', verification_type)
      .single()

    if (existingVerification) {
      return NextResponse.json(
        { error: `You have already submitted a ${verification_type} verification for this remedy` },
        { status: 400 }
      )
    }

    // Create verification
    const { data: newVerification, error: insertError } = await supabase
      .from('remedy_verifications')
      .insert({
        remedy_id: id,
        user_id: user.id,
        verification_type,
        evidence_text,
        evidence_url,
        confidence_level,
        is_positive: is_positive !== false, // default to true (positive verification)
        expertise_area,
        years_of_experience,
        location_context,
        additional_notes,
        is_verified: false // requires admin approval
      })
      .select(`
        *,
        user:profiles(full_name, username, avatar_url)
      `)
      .single()

    if (insertError) {
      console.error('Verification creation error:', insertError)
      return NextResponse.json({ error: 'Failed to create verification' }, { status: 500 })
    }

    return NextResponse.json({ 
      verification: newVerification,
      message: 'Verification submitted successfully. It will be reviewed before being published.'
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update verification (only by the author)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const verification_id = searchParams.get('verification_id')
    
    if (!verification_id) {
      return NextResponse.json(
        { error: 'Missing verification_id parameter' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user owns the verification
    const { data: verification, error: verificationError } = await supabase
      .from('remedy_verifications')
      .select('user_id')
      .eq('id', verification_id)
      .eq('remedy_id', id)
      .single()

    if (verificationError || !verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
    }

    if (verification.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Update verification and reset verification status
    const { data: updatedVerification, error: updateError } = await supabase
      .from('remedy_verifications')
      .update({
        ...body,
        is_verified: false // reset verification after edit
      })
      .eq('id', verification_id)
      .select(`
        *,
        user:profiles(full_name, username, avatar_url)
      `)
      .single()

    if (updateError) {
      console.error('Verification update error:', updateError)
      return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 })
    }

    return NextResponse.json({ 
      verification: updatedVerification,
      message: 'Verification updated successfully. It will be reviewed again.'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}