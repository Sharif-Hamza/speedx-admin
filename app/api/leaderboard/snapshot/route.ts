import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { weekStart, weekEnd } = body
    
    if (!weekStart || !weekEnd) {
      return NextResponse.json(
        { error: 'weekStart and weekEnd are required' },
        { status: 400 }
      )
    }
    
    console.log(`📸 [Snapshot API] Creating snapshots for week: ${weekStart} to ${weekEnd}`)
    
    // Snapshot max speed leaderboard
    const { data: maxSpeedResult, error: maxSpeedError } = await supabase.rpc(
      'save_weekly_snapshot',
      {
        p_week_start: weekStart,
        p_week_end: weekEnd,
        p_leaderboard_type: 'max_speed'
      }
    )
    
    if (maxSpeedError) {
      console.error('❌ [Snapshot API] Error creating max speed snapshot:', maxSpeedError)
      throw maxSpeedError
    }
    
    console.log(`✅ [Snapshot API] Max speed snapshot created: ${maxSpeedResult} entries`)
    
    // Snapshot distance leaderboard
    const { data: distanceResult, error: distanceError } = await supabase.rpc(
      'save_weekly_snapshot',
      {
        p_week_start: weekStart,
        p_week_end: weekEnd,
        p_leaderboard_type: 'distance'
      }
    )
    
    if (distanceError) {
      console.error('❌ [Snapshot API] Error creating distance snapshot:', distanceError)
      throw distanceError
    }
    
    console.log(`✅ [Snapshot API] Distance snapshot created: ${distanceResult} entries`)
    
    return NextResponse.json({
      success: true,
      maxSpeedSnapshots: maxSpeedResult,
      distanceSnapshots: distanceResult,
      message: `Snapshots created for week ${weekStart} to ${weekEnd}`
    })
    
  } catch (error: any) {
    console.error('❌ [Snapshot API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create snapshots' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if snapshot exists for a week
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const weekStart = searchParams.get('weekStart')
  
  if (!weekStart) {
    return NextResponse.json(
      { error: 'weekStart parameter is required' },
      { status: 400 }
    )
  }
  
  try {
    const { data, error } = await supabase
      .from('weekly_leaderboard_snapshots')
      .select('leaderboard_type, count')
      .eq('week_start', weekStart)
    
    if (error) throw error
    
    const maxSpeedCount = data?.filter(d => d.leaderboard_type === 'max_speed').length || 0
    const distanceCount = data?.filter(d => d.leaderboard_type === 'distance').length || 0
    
    return NextResponse.json({
      weekStart,
      exists: data && data.length > 0,
      maxSpeedSnapshots: maxSpeedCount,
      distanceSnapshots: distanceCount
    })
    
  } catch (error: any) {
    console.error('❌ [Snapshot API] Error checking snapshot:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check snapshot' },
      { status: 500 }
    )
  }
}
