import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/features - Get all feature flags
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('feature_name', { ascending: true })

    if (error) throw error

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error: any) {
    console.error('Error fetching feature flags:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
