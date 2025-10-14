'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface DataRequest {
  id: string
  name?: string
  email: string
  request_type: 'export' | 'delete'
  message?: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  created_at: string
  processed_at?: string
  admin_notes?: string
}

export default function DataRequestsViewer() {
  const [requests, setRequests] = useState<DataRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null)
  const [updating, setUpdating] = useState(false)
  const [hideCompleted, setHideCompleted] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from('data_requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setRequests(data || [])
    } catch (err) {
      console.error('Error fetching data requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = requests.filter(req => {
    // Hide completed requests if option is enabled
    if (hideCompleted && req.status === 'completed') {
      return false
    }
    
    const matchesFilter = filter === 'all' || req.status === filter
    const matchesSearch = 
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.name && req.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.message && req.message.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  const typeCounts = {
    export: requests.filter(r => r.request_type === 'export').length,
    delete: requests.filter(r => r.request_type === 'delete').length,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'export' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
  }

  async function markAsCompleted(requestId: string) {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('data_requests')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId)
      
      if (error) throw error
      
      // Refresh the list
      await fetchRequests()
      setSelectedRequest(null)
      alert('✅ Request marked as completed!')
    } catch (err) {
      console.error('Error updating request:', err)
      alert('Failed to update request. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Requests</h2>
          <p className="text-gray-600 mt-1">
            Manage user data export and deletion requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Hide Completed</span>
          </label>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-700">
              <strong>Important:</strong> Data deletion requests are permanent. Always verify ownership before processing.
              Export requests should be fulfilled within 7-14 days per privacy policy.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'All Requests', count: statusCounts.all, color: 'bg-gray-100', filter: 'all' },
          { label: 'Pending', count: statusCounts.pending, color: 'bg-blue-100', filter: 'pending' },
          { label: 'Processing', count: statusCounts.processing, color: 'bg-yellow-100', filter: 'processing' },
          { label: 'Completed', count: statusCounts.completed, color: 'bg-green-100', filter: 'completed' },
          { label: 'Rejected', count: statusCounts.rejected, color: 'bg-red-100', filter: 'rejected' },
        ].map((stat) => (
          <button
            key={stat.filter}
            onClick={() => setFilter(stat.filter as any)}
            className={`${stat.color} p-4 rounded-lg hover:shadow-md transition ${
              filter === stat.filter ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
          </button>
        ))}
      </div>

      {/* Request Type Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-700">Export Requests</p>
          <p className="text-2xl font-bold text-blue-900">{typeCounts.export}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm font-medium text-red-700">Delete Requests</p>
          <p className="text-2xl font-bold text-red-900">{typeCounts.delete}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search by email, name, or message..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {requests.length === 0 ? 'No data requests yet' : 'No requests match your filters'}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {request.name && <div className="text-sm font-medium text-gray-900">{request.name}</div>}
                        <div className="text-sm text-gray-500">{request.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(request.request_type)}`}>
                        {request.request_type === 'export' ? '📥 Export' : '🗑️ Delete'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.processed_at ? formatDate(request.processed_at) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Data Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Request Type</label>
                <p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(selectedRequest.request_type)}`}>
                    {selectedRequest.request_type === 'export' ? '📥 Export Data' : '🗑️ Delete Account'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">From</label>
                {selectedRequest.name && <p className="text-base text-gray-900">{selectedRequest.name}</p>}
                <a href={`mailto:${selectedRequest.email}`} className="text-sm text-blue-600 hover:underline">
                  {selectedRequest.email}
                </a>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Submitted</label>
                <p className="text-base text-gray-900">{formatDate(selectedRequest.created_at)}</p>
              </div>
              {selectedRequest.processed_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Processed</label>
                  <p className="text-base text-gray-900">{formatDate(selectedRequest.processed_at)}</p>
                </div>
              )}
              {selectedRequest.message && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Additional Message</label>
                  <p className="text-base text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {selectedRequest.message}
                  </p>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <p className="text-sm text-gray-700">
                  <strong>Processing Guidelines:</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                  <li><strong>Export:</strong> Verify email ownership, compile all user data (trips, stats, profile), send as JSON/CSV within 7-14 days</li>
                  <li><strong>Delete:</strong> Verify email ownership, permanently delete all user data, send confirmation email</li>
                </ul>
                <p className="text-sm text-gray-500 mt-3 mb-4">
                  💡 Click the email address above to communicate with the user.
                </p>
                {selectedRequest.status !== 'completed' && selectedRequest.status !== 'rejected' && (
                  <button
                    onClick={() => markAsCompleted(selectedRequest.id)}
                    disabled={updating}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Mark as Completed</span>
                      </>
                    )}
                  </button>
                )}
                {selectedRequest.status === 'completed' && (
                  <div className="text-center py-2 text-green-600 font-medium">
                    ✅ This request has been completed
                  </div>
                )}
                {selectedRequest.status === 'rejected' && (
                  <div className="text-center py-2 text-red-600 font-medium">
                    ❌ This request was rejected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
