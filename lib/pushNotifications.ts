import apn from '@parse/node-apn'
import { supabaseAdmin } from './supabase'
import fs from 'fs'
import path from 'path'

// APNs Configuration
const apnConfig = {
  token: {
    key: process.env.APNS_KEY_PATH 
      ? fs.readFileSync(path.resolve(process.env.APNS_KEY_PATH), 'utf8')
      : '',
    keyId: process.env.APNS_KEY_ID || '',
    teamId: process.env.APNS_TEAM_ID || '',
  },
  production: process.env.APNS_PRODUCTION === 'true',
}

let apnProvider: apn.Provider | null = null

// Initialize APN Provider
function getApnProvider() {
  if (!apnProvider) {
    try {
      apnProvider = new apn.Provider(apnConfig)
      console.log('✅ [Push] APNs provider initialized', {
        production: apnConfig.production,
        keyId: apnConfig.token.keyId,
        teamId: apnConfig.token.teamId
      })
    } catch (error) {
      console.error('❌ [Push] Failed to initialize APNs provider:', error)
      throw error
    }
  }
  return apnProvider
}

// Notification Types
export type NotificationType = 
  | 'badge_earned' 
  | 'night_driving' 
  | 'drive_reminder' 
  | 'announcement' 
  | 'custom'

export interface PushNotificationPayload {
  title: string
  body: string
  data?: Record<string, any>
  badge?: number
  sound?: string
  category?: string
}

export interface SendNotificationOptions {
  userId?: string
  userIds?: string[]
  deviceToken?: string
  deviceTokens?: string[]
  type: NotificationType
  payload: PushNotificationPayload
}

/**
 * Send push notification to specific users or device tokens
 */
export async function sendPushNotification(options: SendNotificationOptions) {
  const { userId, userIds, deviceToken, deviceTokens, type, payload } = options

  console.log('\ud83d\udce7 [Push] Sending notification:', { type, userId, userIds, deviceToken, deviceTokens })

  try {
    const provider = getApnProvider()
    
    // Get device tokens from database if userIds provided
    let tokens: string[] = []
    let tokenRecords: any[] = []

    if (userId) {
      const { data, error } = await supabaseAdmin
        .from('device_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
      
      if (error) throw error
      tokenRecords = data || []
      tokens = tokenRecords.map(t => t.device_token)
    } else if (userIds && userIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('device_tokens')
        .select('*')
        .in('user_id', userIds)
        .eq('is_active', true)
      
      if (error) throw error
      tokenRecords = data || []
      tokens = tokenRecords.map(t => t.device_token)
    } else if (deviceToken) {
      tokens = [deviceToken]
    } else if (deviceTokens && deviceTokens.length > 0) {
      tokens = deviceTokens
    }

    if (tokens.length === 0) {
      console.warn('\u26a0\ufe0f [Push] No device tokens found')
      return { success: false, message: 'No device tokens found' }
    }

    console.log(`\ud83d\udcf1 [Push] Found ${tokens.length} device token(s)`)

    // Create APNs notification
    const notification = new apn.Notification()
    notification.alert = {
      title: payload.title,
      body: payload.body,
    }
    notification.topic = process.env.APNS_BUNDLE_ID || ''
    notification.sound = payload.sound || 'default'
    if (payload.badge !== undefined) {
      notification.badge = payload.badge
    }
    // Note: category is not directly supported by node-apn types
    // It can be passed via payload.data if needed
    notification.contentAvailable = true
    notification.mutableContent = true
    
    // Add custom data
    if (payload.data) {
      notification.payload = payload.data
    }

    // Send to all tokens
    const results = await provider.send(notification, tokens)
    
    console.log('\u2705 [Push] Send results:', {
      sent: results.sent.length,
      failed: results.failed.length
    })

    // Log notifications to database
    for (const tokenRecord of tokenRecords) {
      const failed = results.failed.find(f => f.device === tokenRecord.device_token)
      
      await supabaseAdmin.from('notification_logs').insert({
        user_id: tokenRecord.user_id,
        device_token_id: tokenRecord.id,
        notification_type: type,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        status: failed ? 'failed' : 'sent',
        error_message: failed?.response?.reason || null,
      })
    }

    // Update last_used_at for successful sends
    if (results.sent.length > 0) {
      const sentTokens = results.sent.map(s => s.device)
      await supabaseAdmin
        .from('device_tokens')
        .update({ last_used_at: new Date().toISOString() })
        .in('device_token', sentTokens)
    }

    // Deactivate invalid tokens
    if (results.failed.length > 0) {
      const invalidTokens = results.failed
        .filter(f => f.response?.reason === 'BadDeviceToken' || f.response?.reason === 'Unregistered')
        .map(f => f.device)
      
      if (invalidTokens.length > 0) {
        console.log(`\ud83d\uddd1\ufe0f [Push] Deactivating ${invalidTokens.length} invalid token(s)`)
        await supabaseAdmin
          .from('device_tokens')
          .update({ is_active: false })
          .in('device_token', invalidTokens)
      }
    }

    return {
      success: results.sent.length > 0,
      sent: results.sent.length,
      failed: results.failed.length,
      results,
    }
  } catch (error: any) {
    console.error('\u274c [Push] Error sending notification:', error)
    return {
      success: false,
      message: error.message,
      error,
    }
  }
}

/**
 * Send notification to ALL users
 */
export async function sendNotificationToAllUsers(
  type: NotificationType,
  payload: PushNotificationPayload
) {
  console.log('\ud83d\udce2 [Push] Sending to ALL users...')
  
  try {
    // Get all active device tokens
    const { data: tokens, error } = await supabaseAdmin
      .from('device_tokens')
      .select('device_token, user_id, id')
      .eq('is_active', true)
    
    if (error) throw error
    
    if (!tokens || tokens.length === 0) {
      console.warn('\u26a0\ufe0f [Push] No active device tokens found')
      return { success: false, message: 'No active users found' }
    }

    console.log(`\ud83d\udcf1 [Push] Broadcasting to ${tokens.length} device(s)`)

    // Send notification
    const result = await sendPushNotification({
      deviceTokens: tokens.map(t => t.device_token),
      type,
      payload,
    })

    return result
  } catch (error: any) {
    console.error('\u274c [Push] Error broadcasting notification:', error)
    return {
      success: false,
      message: error.message,
      error,
    }
  }
}

/**
 * Register a new device token
 */
export async function registerDeviceToken(
  userId: string,
  deviceToken: string,
  deviceInfo?: {
    deviceName?: string
    appVersion?: string
    deviceType?: string
  }
) {
  console.log('\ud83d\udcf2 [Push] Registering device token:', { userId, deviceToken: `${deviceToken.substring(0, 20)}...` })
  
  try {
    // Check if token already exists
    const { data: existing } = await supabaseAdmin
      .from('device_tokens')
      .select('*')
      .eq('device_token', deviceToken)
      .single()
    
    if (existing) {
      // Update existing token
      const { error } = await supabaseAdmin
        .from('device_tokens')
        .update({
          user_id: userId,
          is_active: true,
          last_used_at: new Date().toISOString(),
          device_name: deviceInfo?.deviceName || existing.device_name,
          app_version: deviceInfo?.appVersion || existing.app_version,
          updated_at: new Date().toISOString(),
        })
        .eq('device_token', deviceToken)
      
      if (error) throw error
      console.log('\u2705 [Push] Device token updated')
    } else {
      // Insert new token
      const { error } = await supabaseAdmin
        .from('device_tokens')
        .insert({
          user_id: userId,
          device_token: deviceToken,
          device_type: deviceInfo?.deviceType || 'ios',
          device_name: deviceInfo?.deviceName,
          app_version: deviceInfo?.appVersion,
          is_active: true,
        })
      
      if (error) throw error
      console.log('\u2705 [Push] Device token registered')
    }

    // Create default notification preferences if they don't exist
    await supabaseAdmin
      .from('notification_preferences')
      .upsert(
        { user_id: userId },
        { onConflict: 'user_id', ignoreDuplicates: true }
      )

    return { success: true }
  } catch (error: any) {
    console.error('\u274c [Push] Error registering device token:', error)
    return {
      success: false,
      message: error.message,
      error,
    }
  }
}

/**
 * Unregister device token
 */
export async function unregisterDeviceToken(deviceToken: string) {
  console.log('\ud83d\uddd1\ufe0f [Push] Unregistering device token')
  
  try {
    const { error } = await supabaseAdmin
      .from('device_tokens')
      .update({ is_active: false })
      .eq('device_token', deviceToken)
    
    if (error) throw error
    
    console.log('\u2705 [Push] Device token unregistered')
    return { success: true }
  } catch (error: any) {
    console.error('\u274c [Push] Error unregistering device token:', error)
    return {
      success: false,
      message: error.message,
      error,
    }
  }
}

/**
 * Get user's notification preferences
 */
export async function getUserNotificationPreferences(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    
    return data
  } catch (error: any) {
    console.error('\u274c [Push] Error fetching preferences:', error)
    return null
  }
}

/**
 * Check if user should receive notification (based on preferences)
 */
export async function shouldSendNotification(userId: string, type: NotificationType): Promise<boolean> {
  const prefs = await getUserNotificationPreferences(userId)
  
  if (!prefs) return true // Default to enabled if no preferences found
  
  switch (type) {
    case 'badge_earned':
      return prefs.enable_badge_notifications
    case 'night_driving':
      return prefs.enable_night_driving_alerts
    case 'drive_reminder':
      return prefs.enable_drive_reminders
    case 'announcement':
      return prefs.enable_announcements
    case 'custom':
      return true // Always send custom notifications
    default:
      return true
  }
}

// Cleanup on shutdown
process.on('exit', () => {
  if (apnProvider) {
    apnProvider.shutdown()
  }
})
