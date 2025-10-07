'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Announcement } from '@/lib/types'

export default function AnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium',
    target: 'all',
    active: true
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('announcements')
        .insert([{
          ...formData,
          created_by: 'admin', // Replace with actual admin ID
          created_at: new Date().toISOString()
        }])

      if (error) throw error

      // Reset form and refresh
      setFormData({
        title: '',
        message: '',
        priority: 'medium',
        target: 'all',
        active: true
      })
      setShowForm(false)
      fetchAnnouncements()
      
      alert('✅ Announcement posted successfully!')
    } catch (error) {
      console.error('Error creating announcement:', error)
      alert('❌ Failed to post announcement')
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchAnnouncements()
    } catch (error) {
      console.error('Error updating announcement:', error)
    }
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchAnnouncements()
    } catch (error) {
      console.error('Error deleting announcement:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Post announcements to your app users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? '❌ Cancel' : '📢 New Announcement'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="Enter announcement title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                required
                placeholder="Enter announcement message..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target
                </label>
                <select
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="specific">Specific Users</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Active (visible to users immediately)
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              📢 Post Announcement
            </button>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No announcements yet. Create your first one!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          announcement.priority === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : announcement.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : announcement.priority === 'medium'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {announcement.priority.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          announcement.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {announcement.active ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{announcement.message}</p>
                    <p className="text-xs text-gray-500">
                      Posted {new Date(announcement.created_at).toLocaleString()} • 
                      Target: {announcement.target === 'all' ? 'All Users' : 'Specific Users'}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => toggleActive(announcement.id, announcement.active)}
                      className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition"
                    >
                      {announcement.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(announcement.id)}
                      className="px-3 py-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
