import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH /api/features/[key] - Update a feature flag
export async function PATCH(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const body = await request.json()
    const { enabled, config } = body

    const updates: any = { updated_at: new Date().toISOString() }
    
    if (typeof enabled === 'boolean') {
      updates.enabled = enabled
    }
    
    if (config && typeof config === 'object') {
      updates.config = config
    }

    const { data, error } = await supabaseAdmin
      .from('feature_flags')
      .update(updates)
      .eq('feature_key', params.key)
      .select()
      .single()

    if (error) throw error

    console.log(`✅ Feature flag '${params.key}' updated:`, updates)

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error updating feature flag:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET /api/features/[key] - Get a specific feature flag
export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const { data, error} = await supabaseAdmin
      .from('feature_flags')
      .select('*')
      .eq('feature_key', params.key)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching feature flag:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
