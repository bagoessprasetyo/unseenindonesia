// src/app/api/remedies/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category_id = searchParams.get('category_id')
    const region = searchParams.get('region')
    const difficulty = searchParams.get('difficulty')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Use the search function we created
    let searchQuery = supabase
      .rpc('search_remedies', { search_query: query.trim() })
      .limit(limit)

    // Apply additional filters if provided
    // Note: We'll need to create a more advanced search function that accepts filters
    // For now, let's do a simpler approach with manual filtering

    let baseQuery = supabase
      .from('remedies')
      .select(`
        id,
        title,
        subtitle,
        region,
        difficulty,
        trust_level,
        verification_count,
        created_at,
        category:remedy_categories(id, name, icon, color)
      `)
      .eq('status', 'published')

    // Apply text search
    baseQuery = baseQuery.or(`title.ilike.%${query}%,subtitle.ilike.%${query}%,description.ilike.%${query}%,region.ilike.%${query}%`)

    // Apply filters
    if (category_id) {
      baseQuery = baseQuery.eq('category_id', category_id)
    }
    
    if (region) {
      baseQuery = baseQuery.eq('region', region)
    }
    
    if (difficulty) {
      baseQuery = baseQuery.eq('difficulty', difficulty)
    }

    // Order by relevance and trust level
    baseQuery = baseQuery.order('trust_level', { ascending: false })
    baseQuery = baseQuery.order('verification_count', { ascending: false })
    baseQuery = baseQuery.limit(limit)

    const { data: remedies, error } = await baseQuery

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // Enhance results with additional data
    const enhancedResults = await Promise.all(
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
          .select('name')
          .eq('remedy_id', remedy.id)
          .eq('is_main_ingredient', true)
          .order('order_index')
          .limit(3)

        // Calculate relevance score
        let relevanceScore = 0
        const queryLower = query.toLowerCase()
        const titleLower = remedy.title.toLowerCase()
        const subtitleLower = (remedy.subtitle || '').toLowerCase()
        const regionLower = (remedy.region || '').toLowerCase()

        if (titleLower.includes(queryLower)) relevanceScore += 3
        if (subtitleLower.includes(queryLower)) relevanceScore += 2
        if (regionLower.includes(queryLower)) relevanceScore += 1
        if (remedy.category?.name.toLowerCase().includes(queryLower)) relevanceScore += 2

        return {
          ...remedy,
          primary_image: primaryImage?.image_url || null,
          main_ingredients: (mainIngredients || []).map(ing => ing.name),
          relevance_score: relevanceScore,
          // Add snippet for highlighting
          snippet: remedy.subtitle || remedy.title
        }
      })
    )

    // Sort by relevance score then trust level
    enhancedResults.sort((a, b) => {
      if (a.relevance_score !== b.relevance_score) {
        return b.relevance_score - a.relevance_score
      }
      return (b.trust_level || 0) - (a.trust_level || 0)
    })

    return NextResponse.json({
      results: enhancedResults,
      query: query,
      total_results: enhancedResults.length,
      filters_applied: {
        category_id,
        region,
        difficulty
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Advanced search with filters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      query,
      categories,
      regions,
      difficulties,
      ingredients,
      benefits,
      trust_level_min,
      preparation_time_max,
      sort_by = 'relevance'
    } = body

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Build complex query
    let searchQuery = supabase
      .from('remedies')
      .select(`
        *,
        category:remedy_categories(id, name, icon, color),
        location:locations(id, name, type),
        author:profiles(id, full_name, username, avatar_url)
      `)
      .eq('status', 'published')

    // Text search
    searchQuery = searchQuery.or(`title.ilike.%${query}%,subtitle.ilike.%${query}%,description.ilike.%${query}%`)

    // Apply array filters
    if (categories && categories.length > 0) {
      searchQuery = searchQuery.in('category_id', categories)
    }

    if (regions && regions.length > 0) {
      searchQuery = searchQuery.in('region', regions)
    }

    if (difficulties && difficulties.length > 0) {
      searchQuery = searchQuery.in('difficulty', difficulties)
    }

    if (trust_level_min) {
      searchQuery = searchQuery.gte('trust_level', trust_level_min)
    }

    if (preparation_time_max) {
      searchQuery = searchQuery.lte('preparation_time', preparation_time_max)
    }

    // Apply sorting
    switch (sort_by) {
      case 'newest':
        searchQuery = searchQuery.order('created_at', { ascending: false })
        break
      case 'trust_level':
        searchQuery = searchQuery.order('trust_level', { ascending: false })
        break
      case 'verification_count':
        searchQuery = searchQuery.order('verification_count', { ascending: false })
        break
      case 'alphabetical':
        searchQuery = searchQuery.order('title', { ascending: true })
        break
      default: // relevance
        searchQuery = searchQuery.order('trust_level', { ascending: false })
        searchQuery = searchQuery.order('verification_count', { ascending: false })
    }

    const { data: results, error } = await searchQuery

    if (error) {
      console.error('Advanced search error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // Filter by ingredients if specified
    let filteredResults = results || []
    
    if (ingredients && ingredients.length > 0) {
      const remedyIds: any[] = []
      
      for (const result of filteredResults) {
        const { data: remedyIngredients } = await supabase
          .from('remedy_ingredients')
          .select('name')
          .eq('remedy_id', result.id)
        
        const hasIngredient = ingredients.some((ingredient: string) =>
          remedyIngredients?.some(ri => 
            ri.name.toLowerCase().includes(ingredient.toLowerCase())
          )
        )
        
        if (hasIngredient) {
          remedyIds.push(result.id)
        }
      }
      
      filteredResults = filteredResults.filter(result => 
        remedyIds.includes(result.id)
      )
    }

    // Filter by benefits if specified
    if (benefits && benefits.length > 0) {
      const remedyIds: any[] = []
      
      for (const result of filteredResults) {
        const { data: remedyBenefits } = await supabase
          .from('remedy_benefits')
          .select('benefit')
          .eq('remedy_id', result.id)
        
        const hasBenefit = benefits.some((benefit: string) =>
          remedyBenefits?.some(rb => 
            rb.benefit.toLowerCase().includes(benefit.toLowerCase())
          )
        )
        
        if (hasBenefit) {
          remedyIds.push(result.id)
        }
      }
      
      filteredResults = filteredResults.filter(result => 
        remedyIds.includes(result.id)
      )
    }

    return NextResponse.json({
      results: filteredResults,
      query,
      total_results: filteredResults.length,
      filters_applied: {
        categories,
        regions,
        difficulties,
        ingredients,
        benefits,
        trust_level_min,
        preparation_time_max
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}