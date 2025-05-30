// src/app/api/remedies/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const include_count = searchParams.get('include_count') === 'true'
    
    const supabase = createSupabaseClient()

    if (include_count) {
      // Get categories with remedy count
      const { data: categories, error } = await supabase
        .from('remedy_categories')
        .select(`
          *,
          remedies!inner(count)
        `)
        .order('name')

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
      }

      // Calculate remedy counts for each category
      const categoriesWithCounts = await Promise.all(
        (categories || []).map(async (category: any) => {
          const { count } = await supabase
            .from('remedies')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('status', 'published')

          return {
            ...category,
            remedy_count: count || 0
          }
        })
      )

      return NextResponse.json({ categories: categoriesWithCounts })
    } else {
      // Get categories without count (faster)
      const { data: categories, error } = await supabase
        .from('remedy_categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
      }

      return NextResponse.json({ categories: categories || [] })
    }

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
    
    // Check authentication - only admins should create categories
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check here
    // For now, any authenticated user can create categories

    const body = await request.json()
    const { name, icon, description, color } = body

    if (!name || !icon) {
      return NextResponse.json(
        { error: 'Missing required fields: name, icon' },
        { status: 400 }
      )
    }

    const { data: category, error } = await supabase
      .from('remedy_categories')
      .insert({
        name,
        icon,
        description,
        color: color || '#10B981'
      })
      .select()
      .single()

    if (error) {
      console.error('Category creation error:', error)
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }

    return NextResponse.json({ category }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}