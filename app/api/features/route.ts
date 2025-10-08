import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/features - Get all feature flags
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('feature_name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching feature flags:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
