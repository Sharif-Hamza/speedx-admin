import { NextResponse } from 'next/server'
import { registerDeviceToken } from '@/lib/pushNotifications'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, deviceToken, deviceName, appVersion, deviceType } = body

    if (!userId || !deviceToken) {
      return NextResponse.json(
        { error: 'userId and deviceToken are required' },
        { status: 400 }
      )
    }

    console.log('📱 [API /push/register] Registering device token for user:', userId)

    const result = await registerDeviceToken(userId, deviceToken, {
      deviceName,
      appVersion,
      deviceType,
    })

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Device token registered successfully' 
      })
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ [API /push/register] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
