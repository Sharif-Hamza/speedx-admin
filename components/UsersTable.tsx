'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  user_id: string
  email?: string
  email_confirmed?: boolean
  created_at: string
  last_sign_in_at?: string
  username?: string
  total_distance_m?: number
  total_trips?: number
  tripCount?: number
  badgeCount?: number
}

const AVAILABLE_BADGES = [
  // Blitz Badges
  'blitz_rookie',
  'blitz_master',
  'blitz_legend',
  'perfect_blitz',
  // Speed Badges
  'speed_demon',
  'velocity_master',
  'hypersonic',
  // Distance Badges
  'road_warrior',
  'distance_king',
  'globe_trotter',
  // Special Badges
  'night_rider',
  'ceo_verified',
  'insanity',
  'marathoner'
]

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState('')
  const [awarding, setAwarding] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchUsers()
    
    console.log('🔌 [UsersTable] Setting up real-time subscriptions...')
    
    // Subscription 1: Badge changes
    const badgeSubscription = supabase
      .channel('user_badges_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'user_badges'
        },
        (payload) => {
          console.log('🔔 [Real-time] Badge change detected:', payload)
          fetchUsers()
        }
      )
      .subscribe()

    // Subscription 2: New user signups (monitors user_profiles table)
    const userSubscription = supabase
      .channel('user_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to new users and profile updates
          schema: 'public',
          table: 'user_profiles'
        },
        (payload) => {
          console.log('🔔 [Real-time] New user/profile change detected:', payload)
          fetchUsers()
        }
      )
      .subscribe()

    // Auto-refresh every 30 seconds as fallback
    const refreshInterval = setInterval(() => {
      console.log('⏰ [Auto-refresh] Fetching latest user data...')
      fetchUsers()
    }, 30000) // 30 seconds

    // Refresh when tab becomes visible (fixes stale data when switching tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ [Visibility] Tab became visible, refreshing...')
        fetchUsers()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup subscriptions and listeners on unmount
    return () => {
      console.log('📡 [Real-time] Cleaning up subscriptions...')
      badgeSubscription.unsubscribe()
      userSubscription.unsubscribe()
      clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  async function fetchUsers() {
    try {
      // Show spinner only on initial load, use refresh indicator for updates
      if (users.length === 0) {
        setLoading(true)
      } else {
        setIsRefreshing(true)
      }
      
      console.log('🔄 [UsersTable] Fetching users from API...')
      
      // Add cache-busting timestamp to force absolutely fresh data
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/users?t=${timestamp}`, {
        cache: 'no-store',  // Disable Next.js cache
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      const data = await response.json()
      
      if (data.error) {
        console.error('❌ [UsersTable] API error:', data.error)
        throw new Error(data.error)
      }

      // API now provides all data including counts
      const usersWithStats = (data.users || []).map((user: any) => ({
        id: user.id,
        user_id: user.id,
        email: user.email,
        email_confirmed: user.email_confirmed,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        username: user.username,
        total_distance_m: user.total_distance_m || 0,
        total_trips: user.total_trips || 0,
        tripCount: user.tripCount || 0,
        badgeCount: user.badgeCount || 0,
      }))

      setUsers(usersWithStats)
      setLastUpdated(new Date())
      console.log(`✅ [UsersTable] Loaded ${usersWithStats.length} users`)
      console.log('📊 [UsersTable] First user sample:', usersWithStats[0])
    } catch (error) {
      console.error('❌ [UsersTable] Error fetching users:', error)
      alert('❌ Failed to load users. Please check the console for details.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  async function awardBadge() {
    if (!selectedUser || !selectedBadge) return
    
    setAwarding(true)
    
    // Optimistic UI update - increment badge count immediately
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === selectedUser.id 
          ? { ...u, badgeCount: (u.badgeCount || 0) + 1 }
          : u
      )
    )
    
    try {
      console.log(`🏆 [Badge] Awarding "${selectedBadge}" to ${selectedUser.email}...`)
      
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: selectedUser.id,
          badge_name: selectedBadge
        })
      
      if (error) throw error
      
      console.log(`✅ [Badge] Successfully awarded "${selectedBadge}"!`)
      
      // Show success message
      alert(`✅ Badge "${selectedBadge}" awarded to ${selectedUser.email}!`)
      
      // Close modal
      setShowBadgeModal(false)
      setSelectedBadge('')
      
      // Force refresh to ensure data is in sync
      console.log('🔄 [Badge] Refreshing user list...')
      await fetchUsers()
      
    } catch (error: any) {
      console.error('❌ [Badge] Error awarding badge:', error)
      
      // Revert optimistic update on error
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === selectedUser.id 
            ? { ...u, badgeCount: Math.max(0, (u.badgeCount || 0) - 1) }
            : u
        )
      )
      
      alert(`❌ Failed to award badge: ${error.message}`)
    } finally {
      setAwarding(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.user_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-600">{users.length} total users</p>
            {isRefreshing && (
              <span className="flex items-center text-sm text-blue-600">
                <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            )}
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <button
          onClick={() => fetchUsers()}
          disabled={isRefreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by email or ID..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trips
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Badges
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.email || 'No email'}
                        </div>
                        <div className="text-xs text-gray-500">{user.user_id.slice(0, 8)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.tripCount} trips
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        🏆 {user.badgeCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedUser(user)
                          setShowBadgeModal(true)
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        🏆 Award Badge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && !showBadgeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">User Details</h2>
            <div className="space-y-3 text-gray-900">
              <p><strong>Email:</strong> {selectedUser.email} {selectedUser.email_confirmed && <span className="text-green-600">✓</span>}</p>
              <p><strong>Username:</strong> {selectedUser.username || 'Not set'}</p>
              <p><strong>User ID:</strong> {selectedUser.user_id}</p>
              <p><strong>Trips:</strong> {selectedUser.tripCount}</p>
              <p><strong>Badges:</strong> {selectedUser.badgeCount}</p>
              <p><strong>Total Distance:</strong> {((selectedUser.total_distance_m || 0) * 0.000621371).toFixed(2)} mi</p>
              <p><strong>Last Sign In:</strong> {selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : 'Never'}</p>
              <p><strong>Joined:</strong> {new Date(selectedUser.created_at).toLocaleString()}</p>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-6 w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Award Badge Modal */}
      {showBadgeModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowBadgeModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">🏆 Award Badge</h2>
            <p className="mb-4 text-gray-600">Award badge to {selectedUser.email}</p>
            
            <select
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-gray-900 bg-white"
            >
              <option value="">Select a badge...</option>
              {AVAILABLE_BADGES.map(badge => (
                <option key={badge} value={badge}>{badge}</option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={awardBadge}
                disabled={!selectedBadge || awarding}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {awarding ? 'Awarding...' : 'Award Badge'}
              </button>
              <button
                onClick={() => {
                  setShowBadgeModal(false)
                  setSelectedBadge('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
