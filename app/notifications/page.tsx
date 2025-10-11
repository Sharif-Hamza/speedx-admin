'use client'

import { useState } from 'react'

export default function NotificationsPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState<'all' | 'specific'>('all')
  const [userId, setUserId] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function sendNotification() {
    if (!title || !message) {
      alert('Please enter title and message')
      return
    }

    setSending(true)
    setResult(null)

    try {
      const payload: any = {
        title,
        body: message,
        type: 'custom',
        target: target === 'all' ? 'all' : undefined,
        userId: target === 'specific' ? userId : undefined,
      }

      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({ success: true, data })
        setTitle('')
        setMessage('')
        alert(`✅ Sent to ${data.sent} device(s)!`)
      } else {
        setResult({ success: false, error: data.error })
        alert(`❌ Error: ${data.error}`)
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message })
      alert(`❌ Error: ${error.message}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">📢 Send Push Notification</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Notification Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., New Feature Available!"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., Check out our new blitz mode feature!"
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Send To
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setTarget('all')}
                  className={`px-4 py-2 rounded-lg ${
                    target === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  📢 All Users
                </button>
                <button
                  onClick={() => setTarget('specific')}
                  className={`px-4 py-2 rounded-lg ${
                    target === 'specific'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  👤 Specific User
                </button>
              </div>
            </div>

            {/* User ID (if specific) */}
            {target === 'specific' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user UUID"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={sendNotification}
              disabled={sending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {sending ? '📤 Sending...' : '🚀 Send Notification'}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.success ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'
            }`}
          >
            {result.success ? (
              <div>
                <p className="font-bold">✅ Success!</p>
                <p>Sent to {result.data.sent} device(s)</p>
                {result.data.failed > 0 && (
                  <p className="text-yellow-400">
                    Failed: {result.data.failed} device(s)
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="font-bold">❌ Error</p>
                <p>{result.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Quick Templates */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">💡 Quick Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setTitle('🌙 Night Driving Alert')
                setMessage("It's nighttime! Drive safely and stay alert.")
              }}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left"
            >
              <div className="font-bold">🌙 Night Driving</div>
              <div className="text-sm text-gray-400">Safety reminder</div>
            </button>

            <button
              onClick={() => {
                setTitle('🏆 New Feature!')
                setMessage('Check out our new blitz mode - race against the clock!')
              }}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left"
            >
              <div className="font-bold">🚀 Feature Announcement</div>
              <div className="text-sm text-gray-400">New feature alert</div>
            </button>

            <button
              onClick={() => {
                setTitle('🚗 Time to Drive!')
                setMessage("Haven't seen you in a while. Ready for a drive?")
              }}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left"
            >
              <div className="font-bold">🚗 Drive Reminder</div>
              <div className="text-sm text-gray-400">Re-engagement</div>
            </button>

            <button
              onClick={() => {
                setTitle('🎉 Congratulations!')
                setMessage('You just earned a new badge! Check your stats page.')
              }}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left"
            >
              <div className="font-bold">🏆 Badge Earned</div>
              <div className="text-sm text-gray-400">Achievement</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
