import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Disable caching for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('🔍 [API /users] Fetching users...')
    
    // Fetch all authenticated users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ [API /users] Error fetching auth users:', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    console.log(`✅ [API /users] Found ${authData.users.length} auth users`)

    // Fetch user profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')

    if (profilesError) {
      console.error('⚠️ [API /users] Error fetching profiles:', profilesError)
      // Continue anyway - we'll just have users without profile data
    } else {
      console.log(`✅ [API /users] Found ${profiles?.length || 0} user profiles`)
    }

    // Fetch trips count per user
    const { data: trips, error: tripsError } = await supabaseAdmin
      .from('trips')
      .select('user_id')

    if (tripsError) {
      console.error('⚠️ [API /users] Error fetching trips:', tripsError)
    }

    // Count trips per user
    const tripCounts: Record<string, number> = {}
    if (trips) {
      trips.forEach((trip: any) => {
        tripCounts[trip.user_id] = (tripCounts[trip.user_id] || 0) + 1
      })
    }

    // Fetch badges count per user
    const { data: badges, error: badgesError } = await supabaseAdmin
      .from('user_badges')
      .select('user_id')

    if (badgesError) {
      console.error('⚠️ [API /users] Error fetching badges:', badgesError)
    }

    // Count badges per user
    const badgeCounts: Record<string, number> = {}
    if (badges) {
      badges.forEach((badge: any) => {
        badgeCounts[badge.user_id] = (badgeCounts[badge.user_id] || 0) + 1
      })
    }

    // Combine all data
    const users = authData.users.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id || p.user_id === authUser.id)
      
      return {
        id: authUser.id,
        email: authUser.email,
        email_confirmed: authUser.email_confirmed_at !== null,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        // Profile data
        username: profile?.username || null,
        display_name: profile?.display_name || null,
        total_distance_m: profile?.total_distance_m || 0,
        total_trips: profile?.total_trips || 0,
        // Counts
        tripCount: tripCounts[authUser.id] || 0,
        badgeCount: badgeCounts[authUser.id] || 0,
      }
    })

    console.log(`✅ [API /users] Returning ${users.length} users with full data`)
    console.log('📊 [API /users] Sample:', users.slice(0, 2))

    const response = NextResponse.json({ 
      users,
      total: users.length 
    })
    
    // Set aggressive anti-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    return response
  } catch (error: any) {
    console.error('❌ [API /users] Fatal error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
