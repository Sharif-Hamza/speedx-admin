export interface User {
  id: string
  user_id: string
  email?: string
  created_at: string
  last_sign_in?: string
}

export interface Trip {
  id: string
  user_id: string
  mode: 'normal' | 'blitz'
  distance_m: number
  duration_sec: number
  max_speed_mps: number
  avg_speed_mps: number
  started_at: string
  ended_at: string
  samples_count: number
}

export interface Badge {
  id: string
  badge_id: string
  name: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  progress: number
}

export interface Announcement {
  id: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  target: 'all' | 'specific'
  target_user_ids?: string[]
  image_url?: string
  action_url?: string
  active: boolean
  scheduled_for?: string
  expires_at?: string
  created_by: string
  created_at: string
}

export interface AppConfig {
  id: string
  key: string
  value: any
  description?: string
  updated_at: string
}

export interface DashboardStats {
  totalUsers: number
  totalTrips: number
  totalDistance: number
  activeToday: number
  blitzCompleted: number
  badgesEarned: number
}
