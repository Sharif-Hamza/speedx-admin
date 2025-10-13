'use client'

import { useEffect, useState } from 'react'
import { supabase, supabaseAdmin } from '@/lib/supabase'

interface WaitlistUser {
  id: string
  auth_user_id: string
  email: string
  full_name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_by?: string
  reviewed_at?: string
  rejection_reason?: string
}

export default function WaitlistManagement() {
  const [waitlistUsers, setWaitlistUsers] = useState<WaitlistUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [processing, setProcessing] = useState<string | null>(null)
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    fetchAdminEmail()
    fetchWaitlistUsers()
  }, [filter])

  async function fetchAdminEmail() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.email) {
      setAdminEmail(session.user.email)
    }
  }

  async function fetchWaitlistUsers() {
    setLoading(true)
    try {
      let query = supabaseAdmin
        .from('waitlist_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setWaitlistUsers(data || [])
    } catch (error) {
      console.error('Error fetching waitlist users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function approveUser(userId: string) {
    setProcessing(userId)
    try {
      const { error } = await supabaseAdmin.rpc('approve_waitlist_user', {
        waitlist_user_id: userId,
        admin_email: adminEmail
      })

      if (error) throw error

      alert('✅ User approved successfully!')
      fetchWaitlistUsers()
    } catch (error: any) {
      console.error('Error approving user:', error)
      alert('❌ Error approving user: ' + error.message)
    } finally {
      setProcessing(null)
    }
  }

  async function rejectUser(userId: string) {
    const reason = prompt('Enter rejection reason (optional):')
    
    setProcessing(userId)
    try {
      const { error } = await supabaseAdmin.rpc('reject_waitlist_user', {
        waitlist_user_id: userId,
        admin_email: adminEmail,
        reason: reason || null
      })

      if (error) throw error

      alert('✅ User rejected')
      fetchWaitlistUsers()
    } catch (error: any) {
      console.error('Error rejecting user:', error)
      alert('❌ Error rejecting user: ' + error.message)
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: waitlistUsers.length,
    pending: waitlistUsers.filter(u => u.status === 'pending').length,
    approved: waitlistUsers.filter(u => u.status === 'approved').length,
    rejected: waitlistUsers.filter(u => u.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Waitlist Management</h1>
        <p className="text-gray-600 mt-1">Manage user waitlist approvals and rejections</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              👥
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
              ⏳
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
              ❌
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'pending', label: 'Pending', count: stats.pending },
              { id: 'all', label: 'All', count: stats.total },
              { id: 'approved', label: 'Approved', count: stats.approved },
              { id: 'rejected', label: 'Rejected', count: stats.rejected },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Users Table */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : waitlistUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-medium text-gray-900">No users found</h3>
              <p className="text-gray-500 mt-1">
                {filter === 'pending' 
                  ? 'No pending waitlist requests at the moment' 
                  : `No ${filter} users`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reviewed By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {waitlistUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.reviewed_by || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.status === 'pending' && (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => approveUser(user.id)}
                              disabled={processing === user.id}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              {processing === user.id ? '...' : '✅ Approve'}
                            </button>
                            <button
                              onClick={() => rejectUser(user.id)}
                              disabled={processing === user.id}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              {processing === user.id ? '...' : '❌ Reject'}
                            </button>
                          </div>
                        )}
                        {user.status === 'approved' && (
                          <span className="text-green-600 font-medium">✓ Approved</span>
                        )}
                        {user.status === 'rejected' && (
                          <span className="text-red-600 font-medium">
                            ✗ Rejected
                            {user.rejection_reason && (
                              <span className="text-xs block text-gray-500 mt-1">
                                {user.rejection_reason}
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
