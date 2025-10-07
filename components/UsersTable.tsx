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

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      
      // Fetch from API route
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // For each user, get their trip count and badge count
      const usersWithStats = await Promise.all(
        (data.users || []).map(async (user: any) => {
          const { count: tripCount } = await supabase
            .from('trips')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          const { count: badgeCount } = await supabase
            .from('user_badges')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          return {
            id: user.id,
            user_id: user.id,
            email: user.email,
            email_confirmed: user.email_confirmed,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            username: user.username,
            total_distance_m: user.total_distance_m || 0,
            total_trips: user.total_trips || 0,
            tripCount: tripCount || 0,
            badgeCount: badgeCount || 0,
          }
        })
      )

      setUsers(usersWithStats)
      console.log('✅ Loaded', usersWithStats.length, 'users')
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function awardBadge() {
    if (!selectedUser || !selectedBadge) return
    
    setAwarding(true)
    try {
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: selectedUser.id,
          badge_name: selectedBadge
        })
      
      if (error) throw error
      
      alert(`✅ Badge "${selectedBadge}" awarded to ${selectedUser.email}!`)
      setShowBadgeModal(false)
      setSelectedBadge('')
      await fetchUsers() // Refresh
    } catch (error: any) {
      console.error('Error awarding badge:', error)
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
          <p className="text-gray-600 mt-1">{users.length} total users</p>
        </div>
        <button
          onClick={() => fetchUsers()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Refresh
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
