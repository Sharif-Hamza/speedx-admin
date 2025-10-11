import { NextResponse } from 'next/server'
import { sendPushNotification, sendNotificationToAllUsers } from '@/lib/pushNotifications'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📨 [API /push/send] Received body:', body)
    
    const { userId, userIds, target, type, title, body: messageBody, data, badge, sound } = body

    if (!title || !messageBody) {
      console.error('❌ [API /push/send] Missing required fields:', { title, messageBody, body })
      return NextResponse.json(
        { error: 'title and body are required', received: { title, messageBody, fullBody: body } },
        { status: 400 }
      )
    }

    console.log('📨 [API /push/send] Sending notification:', { type, target, userId, userIds, title, messageBody })

    const payload = {
      title,
      body: messageBody,
      data,
      badge,
      sound: sound || 'default',
    }

    let result

    if (target === 'all') {
      // Send to all users
      result = await sendNotificationToAllUsers(type || 'custom', payload)
    } else if (userId) {
      // Send to specific user
      result = await sendPushNotification({
        userId,
        type: type || 'custom',
        payload,
      })
    } else if (userIds && userIds.length > 0) {
      // Send to multiple users
      result = await sendPushNotification({
        userIds,
        type: type || 'custom',
        payload,
      })
    } else {
      return NextResponse.json(
        { error: 'Must specify userId, userIds, or target=all' },
        { status: 400 }
      )
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        sent: result.sent,
        failed: result.failed,
        message: `Notification sent to ${result.sent} device(s)`,
      })
    } else {
      return NextResponse.json(
        { error: result.message || 'Failed to send notification' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ [API /push/send] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
