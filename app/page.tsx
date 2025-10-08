'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { DashboardStats } from '@/lib/types'
import StatsCards from '@/components/StatsCards'
import UsersTable from '@/components/UsersTable'
import AnnouncementsPanel from '@/components/AnnouncementsPanel'
import FeatureManagementPanel from '@/components/FeatureManagementPanel'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Check if user is admin
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (error || !adminData) {
        await supabase.auth.signOut()
        router.push('/login')
        return
      }

      setIsAuthenticated(true)
      setAuthChecking(false)
      fetchDashboardStats()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  async function fetchDashboardStats() {
    try {
      // Fetch users from API route
      const usersResponse = await fetch('/api/users')
      const usersData = await usersResponse.json()
      const totalAuthUsers = usersData.total || 0

      // Fetch trips count and data
      const { data: trips, count: tripsCount, error: tripsError } = await supabase
        .from('trips')
        .select('distance_m, mode, started_at, user_id', { count: 'exact' })

      if (tripsError) {
        console.error('Error fetching trips:', tripsError)
      }

      // Fetch badges count
      const { count: badgesCount } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })

      // Calculate total distance (convert meters to miles)
      const totalDistanceMeters = trips?.reduce((sum, trip) => sum + (trip.distance_m || 0), 0) || 0
      const totalDistanceMiles = totalDistanceMeters * 0.000621371
      
      console.log('📏 Distance calculation:', {
        trips: trips?.length || 0,
        totalMeters: totalDistanceMeters,
        totalMiles: totalDistanceMiles.toFixed(2)
      })

      // Count Blitz completions
      const blitzCompleted = trips?.filter(t => t.mode === 'blitz').length || 0

      // Count active users today (users who made trips today)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data: todayTrips } = await supabase
        .from('trips')
        .select('user_id')
        .gte('started_at', today.toISOString())
      
      const uniqueActiveToday = new Set(todayTrips?.map(t => t.user_id)).size

      setStats({
        totalUsers: totalAuthUsers, // Total authenticated users
        totalTrips: tripsCount || 0,
        totalDistance: totalDistanceMiles, // in miles
        activeToday: uniqueActiveToday || 0,
        blitzCompleted: blitzCompleted,
        badgesEarned: badgesCount || 0,
      })
      
      console.log('📊 Dashboard Stats:', {
        authUsers: totalAuthUsers,
        trips: tripsCount,
        badges: badgesCount
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome to SpeedX Admin Dashboard</p>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <StatsCards stats={stats} />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                      <p className="text-gray-500">Real-time activity feed coming soon...</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                      <div className="space-y-2">
                        <button
                          onClick={() => setActiveTab('announcements')}
                          className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          📢 Post Announcement
                        </button>
                        <button
                          onClick={() => setActiveTab('users')}
                          className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          👥 Manage Users
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'users' && <UsersTable />}
          {activeTab === 'announcements' && <AnnouncementsPanel />}
          
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Feature Management</h1>
                <p className="text-gray-600 mt-1">Enable or disable app features in real-time</p>
              </div>
              <FeatureManagementPanel />
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">Advanced analytics and charts coming soon...</p>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">App configuration settings coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
