'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Banner {
  id: string
  title: string
  message: string
  type: 'static' | 'countdown' | 'live_update'
  countdown_target_date: string | null
  style: {
    backgroundColor?: string
    textColor?: string
  }
  active: boolean
  priority: number
  visible_to: string
  created_at: string
  expires_at: string | null
}

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'static' as 'static' | 'countdown' | 'live_update',
    countdown_target_date: '',
    backgroundColor: '#00FF7F',
    textColor: '#000000',
    active: true,
    priority: 1,
    visible_to: 'all',
    expires_at: '',
  })

  useEffect(() => {
    fetchBanners()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('banner-management')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'banner_announcements',
        },
        () => {
          fetchBanners()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchBanners() {
    setLoading(true)
    const { data, error } = await supabase
      .from('banner_announcements')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBanners(data)
    }
    setLoading(false)
  }

  function handleEdit(banner: Banner) {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      message: banner.message,
      type: banner.type,
      countdown_target_date: banner.countdown_target_date
        ? new Date(banner.countdown_target_date).toISOString().slice(0, 16)
        : '',
      backgroundColor: banner.style.backgroundColor || '#00FF7F',
      textColor: banner.style.textColor || '#000000',
      active: banner.active,
      priority: banner.priority,
      visible_to: banner.visible_to,
      expires_at: banner.expires_at
        ? new Date(banner.expires_at).toISOString().slice(0, 16)
        : '',
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const bannerData = {
      title: formData.title,
      message: formData.message,
      type: formData.type,
      countdown_target_date:
        formData.type === 'countdown' && formData.countdown_target_date
          ? new Date(formData.countdown_target_date).toISOString()
          : null,
      style: {
        backgroundColor: formData.backgroundColor,
        textColor: formData.textColor,
      },
      active: formData.active,
      priority: formData.priority,
      visible_to: formData.visible_to,
      expires_at: formData.expires_at
        ? new Date(formData.expires_at).toISOString()
        : null,
    }

    if (editingBanner) {
      // Update existing banner
      const { error } = await supabase
        .from('banner_announcements')
        .update(bannerData)
        .eq('id', editingBanner.id)

      if (!error) {
        alert('Banner updated successfully!')
        resetForm()
        fetchBanners()
      } else {
        alert('Error updating banner: ' + error.message)
      }
    } else {
      // Create new banner
      const { error } = await supabase
        .from('banner_announcements')
        .insert([bannerData])

      if (!error) {
        alert('Banner created successfully!')
        resetForm()
        fetchBanners()
      } else {
        alert('Error creating banner: ' + error.message)
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this banner?')) return

    const { error } = await supabase
      .from('banner_announcements')
      .delete()
      .eq('id', id)

    if (!error) {
      alert('Banner deleted successfully!')
      fetchBanners()
    } else {
      alert('Error deleting banner: ' + error.message)
    }
  }

  async function toggleActive(id: string, currentActive: boolean) {
    const { error } = await supabase
      .from('banner_announcements')
      .update({ active: !currentActive })
      .eq('id', id)

    if (!error) {
      fetchBanners()
    } else {
      alert('Error toggling banner: ' + error.message)
    }
  }

  function resetForm() {
    setShowForm(false)
    setEditingBanner(null)
    setFormData({
      title: '',
      message: '',
      type: 'static',
      countdown_target_date: '',
      backgroundColor: '#00FF7F',
      textColor: '#000000',
      active: true,
      priority: 1,
      visible_to: 'all',
      expires_at: '',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banner Announcements</h2>
          <p className="text-gray-600 mt-1">Manage site-wide banner announcements</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ New Banner'}
        </button>
      </div>

      {/* Banner Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingBanner ? 'Edit Banner' : 'Create New Banner'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="🚀 LAUNCH COUNTDOWN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'static' | 'countdown' | 'live_update',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="static">Static</option>
                  <option value="countdown">Countdown</option>
                  <option value="live_update">Live Update</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SpeedX Waitlist opens in:"
              />
            </div>

            {formData.type === 'countdown' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Countdown Target Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.countdown_target_date}
                  onChange={(e) =>
                    setFormData({ ...formData, countdown_target_date: e.target.value })
                  }
                  required={formData.type === 'countdown'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) =>
                      setFormData({ ...formData, backgroundColor: e.target.value })
                    }
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={formData.backgroundColor}
                    onChange={(e) =>
                      setFormData({ ...formData, backgroundColor: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) =>
                      setFormData({ ...formData, textColor: e.target.value })
                    }
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: parseInt(e.target.value) })
                  }
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visible To
                </label>
                <select
                  value={formData.visible_to}
                  onChange={(e) => setFormData({ ...formData, visible_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="authenticated">Authenticated Only</option>
                  <option value="anonymous">Anonymous Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingBanner ? 'Update Banner' : 'Create Banner'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banners List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Existing Banners</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : banners.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No banners created yet. Create your first banner above!
            </p>
          ) : (
            <div className="space-y-3">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{banner.title}</h4>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            banner.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {banner.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {banner.type}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                          Priority: {banner.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{banner.message}</p>
                      {banner.type === 'countdown' && banner.countdown_target_date && (
                        <p className="text-xs text-gray-500">
                          Target: {new Date(banner.countdown_target_date).toLocaleString()}
                        </p>
                      )}
                      {banner.expires_at && (
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(banner.expires_at).toLocaleString()}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: banner.style.backgroundColor || '#00FF7F' }}
                          title="Background Color"
                        />
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: banner.style.textColor || '#000000' }}
                          title="Text Color"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(banner.id, banner.active)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
                      >
                        {banner.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEdit(banner)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition"
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
    </div>
  )
}
