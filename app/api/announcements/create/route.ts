import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, message, icon, priority, createdBy, sendPush } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: 'title and message are required' },
        { status: 400 }
      )
    }

    console.log('📢 [API /announcements/create] Creating announcement:', title)

    // Save announcement to database
    const { data: announcement, error: dbError } = await supabaseAdmin
      .from('announcements')
      .insert({
        title,
        message,
        icon: icon || '📢',
        priority: priority || 'normal',
        created_by: createdBy,
        is_active: true,
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ [API /announcements/create] Database error:', dbError)
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      )
    }

    console.log('✅ [API /announcements/create] Announcement saved to database')

    // Send push notification to all users if requested via Railway server
    let pushResult = null
    if (sendPush !== false) {
      console.log('📨 [API /announcements/create] Broadcasting push notification via Railway...')
      
      try {
        const railwayResponse = await fetch(
          'https://speedx-push-server-production.up.railway.app/api/push/send',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              target: 'all',
              type: 'announcement',
              title: `${icon || '📢'} ${title}`,
              body: message,
              data: {
                type: 'announcement',
                announcementId: announcement.id,
              },
            }),
          }
        )

        if (railwayResponse.ok) {
          pushResult = await railwayResponse.json()
          console.log('✅ [API /announcements/create] Push notification sent:', pushResult)
        } else {
          const error = await railwayResponse.text()
          console.error('❌ [API /announcements/create] Railway push failed:', error)
        }
      } catch (error) {
        console.error('❌ [API /announcements/create] Error sending push:', error)
      }
    }

    return NextResponse.json({
      success: true,
      announcement,
      push: pushResult && 'sent' in pushResult ? {
        sent: pushResult.sent,
        failed: pushResult.failed,
      } : null,
    })
  } catch (error: any) {
    console.error('❌ [API /announcements/create] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
