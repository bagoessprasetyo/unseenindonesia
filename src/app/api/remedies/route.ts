// src/app/api/remedies/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import type { RemedyWithDetails, RemedyFilters, RemedySortOption } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = createSupabaseClient()

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category_id = searchParams.get('category_id')
    const region = searchParams.get('region')
    const difficulty = searchParams.get('difficulty')
    const trust_level_min = searchParams.get('trust_level_min')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const sort: RemedySortOption = (searchParams.get('sort') as RemedySortOption) || 'newest'

    const offset = (page - 1) * limit

    // If search query is provided, use the search function
    if (search) {
      const { data: searchResults, error: searchError } = await supabase
        .rpc('search_remedies', { search_query: search })
        .range(offset, offset + limit - 1)

      if (searchError) {
        console.error('Search error:', searchError)
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
      }

      // Get total count for pagination
      const { count } = await supabase
        .rpc('search_remedies', { search_query: search })
        .select('*')

      return NextResponse.json({
        remedies: searchResults || [],
        total_count: count || 0,
        page,
        per_page: limit,
        has_next_page: (count || 0) > offset + limit,
        search_query: search
      })
    }

    // Build the main query
    let query = supabase
      .from('remedies')
      .select(`
        *,
        category:remedy_categories(id, name, icon, color),
        location:locations(id, name, type),
        author:profiles(id, full_name, username, avatar_url)
      `)
      .eq('status', 'published')

    // Apply filters
    if (category_id) {
      query = query.eq('category_id', category_id)
    }
    
    if (region) {
      query = query.eq('region', region)
    }
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }
    
    if (trust_level_min) {
      query = query.gte('trust_level', parseInt(trust_level_min))
    }
    
    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'trust_level':
        query = query.order('trust_level', { ascending: false })
        break
      case 'verification_count':
        query = query.order('verification_count', { ascending: false })
        break
      case 'popularity':
        query = query.order('view_count', { ascending: false })
        break
      case 'alphabetical':
        query = query.order('title', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: remedies, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch remedies' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('remedies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // Apply same filters for count
    if (category_id) countQuery = countQuery.eq('category_id', category_id)
    if (region) countQuery = countQuery.eq('region', region)
    if (difficulty) countQuery = countQuery.eq('difficulty', difficulty)
    if (trust_level_min) countQuery = countQuery.gte('trust_level', parseInt(trust_level_min))
    if (featured === 'true') countQuery = countQuery.eq('featured', true)

    const { count } = await countQuery

    // Enhance remedies with additional data
    const enhancedRemedies = await Promise.all(
      (remedies || []).map(async (remedy: any) => {
        // Get primary image
        const { data: primaryImage } = await supabase
          .from('remedy_images')
          .select('image_url')
          .eq('remedy_id', remedy.id)
          .eq('is_primary', true)
          .single()

        // Get main ingredients (first 3)
        const { data: mainIngredients } = await supabase
          .from('remedy_ingredients')
          .select('name, amount')
          .eq('remedy_id', remedy.id)
          .eq('is_main_ingredient', true)
          .order('order_index')
          .limit(3)

        // Get benefits (first 3)
        const { data: benefits } = await supabase
          .from('remedy_benefits')
          .select('benefit, category')
          .eq('remedy_id', remedy.id)
          .order('order_index')
          .limit(3)

        // Get average rating from testimonials
        const { data: testimonialStats } = await supabase
          .rpc('calculate_remedy_rating', { remedy_uuid: remedy.id })

        return {
          ...remedy,
          primary_image: primaryImage?.image_url || null,
          main_ingredients: mainIngredients || [],
          benefits: benefits || [],
          avg_rating: testimonialStats?.[0]?.avg_rating || 0,
          testimonial_count: testimonialStats?.[0]?.count || 0
        }
      })
    )

    return NextResponse.json({
      remedies: enhancedRemedies,
      total_count: count || 0,
      page,
      per_page: limit,
      has_next_page: (count || 0) > offset + limit
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      subtitle,
      description,
      summary,
      category_id,
      location_id,
      region,
      origin_story,
      preparation_time,
      cooking_time,
      servings,
      difficulty,
      safety_warnings,
      contraindications,
      ingredients,
      steps,
      benefits,
      images
    } = body

    // Validate required fields
    if (!title || !description || !category_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category_id' },
        { status: 400 }
      )
    }

    // Create the remedy
    const { data: remedy, error: remedyError } = await supabase
      .from('remedies')
      .insert({
        title,
        subtitle,
        description,
        summary,
        author_id: user.id,
        category_id,
        location_id,
        region,
        origin_story,
        preparation_time,
        cooking_time,
        servings,
        difficulty: difficulty || 'Sedang',
        safety_warnings,
        contraindications,
        status: 'published' // or 'draft' based on your needs
      })
      .select()
      .single()

    if (remedyError) {
      console.error('Remedy creation error:', remedyError)
      return NextResponse.json({ error: 'Failed to create remedy' }, { status: 500 })
    }

    // Insert ingredients
    if (ingredients && ingredients.length > 0) {
      const ingredientsToInsert = ingredients.map((ingredient: any, index: number) => ({
        ...ingredient,
        remedy_id: remedy.id,
        order_index: index + 1
      }))

      const { error: ingredientsError } = await supabase
        .from('remedy_ingredients')
        .insert(ingredientsToInsert)

      if (ingredientsError) {
        console.error('Ingredients creation error:', ingredientsError)
      }
    }

    // Insert steps
    if (steps && steps.length > 0) {
      const stepsToInsert = steps.map((step: any, index: number) => ({
        ...step,
        remedy_id: remedy.id,
        step_number: index + 1
      }))

      const { error: stepsError } = await supabase
        .from('remedy_steps')
        .insert(stepsToInsert)

      if (stepsError) {
        console.error('Steps creation error:', stepsError)
      }
    }

    // Insert benefits
    if (benefits && benefits.length > 0) {
      const benefitsToInsert = benefits.map((benefit: any, index: number) => ({
        ...benefit,
        remedy_id: remedy.id,
        order_index: index + 1
      }))

      const { error: benefitsError } = await supabase
        .from('remedy_benefits')
        .insert(benefitsToInsert)

      if (benefitsError) {
        console.error('Benefits creation error:', benefitsError)
      }
    }

    // Insert images
    if (images && images.length > 0) {
      const imagesToInsert = images.map((image: any, index: number) => ({
        ...image,
        remedy_id: remedy.id,
        order_index: index + 1
      }))

      const { error: imagesError } = await supabase
        .from('remedy_images')
        .insert(imagesToInsert)

      if (imagesError) {
        console.error('Images creation error:', imagesError)
      }
    }

    return NextResponse.json({ remedy }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}