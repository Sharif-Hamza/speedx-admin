import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch all authenticated users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // Fetch user profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    }

    // Combine auth users with their profiles
    const users = authData.users.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id)
      
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
      }
    })

    return NextResponse.json({ 
      users,
      total: users.length 
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
