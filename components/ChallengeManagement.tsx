'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Challenge {
  id: string
  title: string
  description: string
  challenge_type: 'daily' | 'weekly' | 'monthly' | 'special'
  start_date: string
  end_date: string
  target_goal: number
  prize_points: number
  active: boolean
  created_at: string
}

interface ChallengeProgress {
  challenge_id: string
  title: string
  target_goal: number
  current_points: number
  participant_count: number
  total_completions: number
  progress_percentage: number
}

export default function ChallengeManagement() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [progress, setProgress] = useState<Record<string, ChallengeProgress>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challenge_type: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'special',
    start_date: '',
    end_date: '',
    target_goal: 1000,
    prize_points: 500,
    active: true,
  })

  useEffect(() => {
    fetchChallenges()
    fetchProgress()

    const interval = setInterval(() => {
      fetchProgress() // Refresh progress every 30 seconds
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  async function fetchChallenges() {
    setLoading(true)
    const { data, error } = await supabase
      .from('blitz_challenges')
      .select('*')
      .order('start_date', { ascending: false })

    if (!error && data) {
      setChallenges(data)
    }
    setLoading(false)
  }

  async function fetchProgress() {
    const { data, error } = await supabase
      .from('challenge_progress')
      .select('*')

    if (!error && data) {
      const progressMap: Record<string, ChallengeProgress> = {}
      data.forEach((p: ChallengeProgress) => {
        progressMap[p.challenge_id] = p
      })
      setProgress(progressMap)
    }
  }

  function handleEdit(challenge: Challenge) {
    setEditingChallenge(challenge)
    setFormData({
      title: challenge.title,
      description: challenge.description,
      challenge_type: challenge.challenge_type,
      start_date: new Date(challenge.start_date).toISOString().slice(0, 16),
      end_date: new Date(challenge.end_date).toISOString().slice(0, 16),
      target_goal: challenge.target_goal,
      prize_points: challenge.prize_points,
      active: challenge.active,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const challengeData = {
      title: formData.title,
      description: formData.description,
      challenge_type: formData.challenge_type,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      target_goal: formData.target_goal,
      prize_points: formData.prize_points,
      active: formData.active,
    }

    if (editingChallenge) {
      const { error } = await supabase
        .from('blitz_challenges')
        .update(challengeData)
        .eq('id', editingChallenge.id)

      if (!error) {
        alert('Challenge updated successfully!')
        resetForm()
        fetchChallenges()
      } else {
        alert('Error updating challenge: ' + error.message)
      }
    } else {
      const { error } = await supabase
        .from('blitz_challenges')
        .insert([challengeData])

      if (!error) {
        alert('Challenge created successfully!')
        resetForm()
        fetchChallenges()
        
        // Update app_config with new active challenge if this is set to active
        if (formData.active) {
          updateActiveChallenge()
        }
      } else {
        alert('Error creating challenge: ' + error.message)
      }
    }
  }

  async function updateActiveChallenge() {
    // Get the most recent active challenge
    const { data } = await supabase
      .from('blitz_challenges')
      .select('id')
      .eq('active', true)
      .order('start_date', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      await supabase
        .from('app_config')
        .update({ value: `"${data.id}"` })
        .eq('key', 'active_challenge_id')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this challenge? All associated points will also be deleted.')) return

    const { error } = await supabase
      .from('blitz_challenges')
      .delete()
      .eq('id', id)

    if (!error) {
      alert('Challenge deleted successfully!')
      fetchChallenges()
    } else {
      alert('Error deleting challenge: ' + error.message)
    }
  }

  async function toggleActive(id: string, currentActive: boolean) {
    const { error } = await supabase
      .from('blitz_challenges')
      .update({ active: !currentActive })
      .eq('id', id)

    if (!error) {
      fetchChallenges()
      if (!currentActive) {
        // If activating, update the app_config
        await supabase
          .from('app_config')
          .update({ value: `"${id}"` })
          .eq('key', 'active_challenge_id')
      }
    } else {
      alert('Error toggling challenge: ' + error.message)
    }
  }

  function resetForm() {
    setShowForm(false)
    setEditingChallenge(null)
    setFormData({
      title: '',
      description: '',
      challenge_type: 'weekly',
      start_date: '',
      end_date: '',
      target_goal: 1000,
      prize_points: 500,
      active: true,
    })
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Challenge Management</h2>
          <p className="text-gray-600 mt-1">Create and manage Blitz challenges</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ New Challenge'}
        </button>
      </div>

      {/* Challenge Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Challenge Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Launch Week Blitz Challenge"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Challenge Type *
                </label>
                <select
                  value={formData.challenge_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      challenge_type: e.target.value as 'daily' | 'weekly' | 'monthly' | 'special',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="special">Special Event</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Complete Blitz runs and contribute to the community goal! Everyone who participates gets points."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Goal (Total Community Points) *
                </label>
                <input
                  type="number"
                  value={formData.target_goal}
                  onChange={(e) =>
                    setFormData({ ...formData, target_goal: parseInt(e.target.value) })
                  }
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prize Points *
                </label>
                <input
                  type="number"
                  value={formData.prize_points}
                  onChange={(e) =>
                    setFormData({ ...formData, prize_points: parseInt(e.target.value) })
                  }
                  required
                  min="0"
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
                {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
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

      {/* Challenges List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Existing Challenges</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : challenges.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No challenges created yet. Create your first challenge above!
            </p>
          ) : (
            <div className="space-y-4">
              {challenges.map((challenge) => {
                const challengeProgress = progress[challenge.id]
                const isOngoing = new Date(challenge.start_date) <= new Date() && new Date(challenge.end_date) >= new Date()
                
                return (
                  <div
                    key={challenge.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 text-lg">{challenge.title}</h4>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              challenge.active
                                ? isOngoing
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {challenge.active ? (isOngoing ? 'Live' : 'Scheduled') : 'Inactive'}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                            {challenge.challenge_type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>📅 {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}</div>
                          <div>🎯 Target: {challenge.target_goal.toLocaleString()} points • 🏆 Prize: {challenge.prize_points.toLocaleString()} points</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleActive(challenge.id, challenge.active)}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
                        >
                          {challenge.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEdit(challenge)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(challenge.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {challengeProgress && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-sm mb-2">
                          <div className="flex gap-4">
                            <span className="text-gray-600">
                              👥 {challengeProgress.participant_count} participants
                            </span>
                            <span className="text-gray-600">
                              ✅ {challengeProgress.total_completions} completions
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {challengeProgress.current_points.toLocaleString()} / {challenge.target_goal.toLocaleString()} pts
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                            style={{ width: `${Math.min(challengeProgress.progress_percentage, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {challengeProgress.progress_percentage.toFixed(1)}% complete
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
