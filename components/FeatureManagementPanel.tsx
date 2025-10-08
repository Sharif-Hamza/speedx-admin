'use client'

import { useState, useEffect } from 'react'
import { FeatureFlag } from '@/lib/types'

export default function FeatureManagementPanel() {
  const [features, setFeatures] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchFeatures()
    // Poll for updates every 30 seconds to stay in sync (increased to avoid conflicts)
    const interval = setInterval(() => {
      // Only fetch if not currently updating to avoid race conditions
      if (!updating) {
        fetchFeatures()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [updating])

  const fetchFeatures = async () => {
    try {
      const res = await fetch('/api/features', {
        cache: 'no-store', // Disable caching to get fresh data
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      const json = await res.json()
      if (json.success) {
        console.log('✅ Fetched features:', json.data.map(f => `${f.feature_key}: ${f.enabled}`))
        setFeatures(json.data)
      } else {
        console.error('❌ Failed to fetch features:', json.error)
      }
    } catch (error) {
      console.error('❌ Error fetching features:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFeature = async (featureKey: string, currentState: boolean) => {
    const newState = !currentState
    setUpdating(featureKey)
    
    console.log(`🔄 Toggling ${featureKey}: ${currentState} → ${newState}`)
    
    // Optimistic update
    setFeatures(prev =>
      prev.map(f =>
        f.feature_key === featureKey ? { ...f, enabled: newState } : f
      )
    )
    
    try {
      const res = await fetch(`/api/features/${featureKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState })
      })

      const json = await res.json()
      if (json.success) {
        console.log(`✅ ${featureKey} updated successfully to: ${json.data.enabled}`)
        // Update with server response to ensure consistency
        setFeatures(prev =>
          prev.map(f =>
            f.feature_key === featureKey ? json.data : f
          )
        )
      } else {
        console.error(`❌ Failed to toggle ${featureKey}:`, json.error)
        // Revert optimistic update on failure
        setFeatures(prev =>
          prev.map(f =>
            f.feature_key === featureKey ? { ...f, enabled: currentState } : f
          )
        )
        alert(`Failed to toggle ${featureKey}: ${json.error}`)
      }
    } catch (error) {
      console.error(`❌ Error toggling ${featureKey}:`, error)
      // Revert optimistic update on error
      setFeatures(prev =>
        prev.map(f =>
          f.feature_key === featureKey ? { ...f, enabled: currentState } : f
        )
      )
      alert(`Error toggling ${featureKey}. Check console for details.`)
    } finally {
      setUpdating(null)
    }
  }

  const getFeatureIcon = (key: string) => {
    switch (key) {
      case 'blitz_mode':
        return '⚡'
      case 'badges':
        return '🏆'
      case 'simple_drive':
        return '🚗'
      case 'video_recaps':
        return '🎬'
      case 'leaderboards':
        return '📊'
      default:
        return '🔧'
    }
  }

  const getFeatureColor = (enabled: boolean) => {
    return enabled
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-gray-100 text-gray-600 border-gray-300'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Feature Management</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enable or disable app features in real-time
        </p>
      </div>

      <div className="p-6 space-y-4">
        {features.map(feature => (
          <div
            key={feature.id}
            className={`border-2 rounded-lg p-4 transition-all ${getFeatureColor(feature.enabled)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getFeatureIcon(feature.feature_key)}</span>
                <div>
                  <h3 className="font-semibold text-lg">{feature.feature_name}</h3>
                  {feature.description && (
                    <p className="text-sm opacity-80">{feature.description}</p>
                  )}
                  <p className="text-xs mt-1 opacity-60">
                    Last updated: {new Date(feature.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    feature.enabled
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-400 text-white'
                  }`}>
                    {feature.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>

                <button
                  onClick={() => toggleFeature(feature.feature_key, feature.enabled)}
                  disabled={updating === feature.feature_key}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    feature.enabled
                      ? 'bg-green-600 focus:ring-green-500'
                      : 'bg-gray-300 focus:ring-gray-400'
                  } ${updating === feature.feature_key ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      feature.enabled ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Additional config info */}
            {feature.config && Object.keys(feature.config).length > 0 && (
              <div className="mt-3 pt-3 border-t border-current opacity-30">
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium">
                    Configuration
                  </summary>
                  <pre className="mt-2 p-2 bg-black bg-opacity-5 rounded overflow-auto">
                    {JSON.stringify(feature.config, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ))}

        {features.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No feature flags found</p>
            <p className="text-sm mt-2">Run the SQL migration to create feature flags</p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">{features.filter(f => f.enabled).length}</span>
            {' '}of{' '}
            <span className="font-medium">{features.length}</span>
            {' '}features enabled
          </div>
          <button
            onClick={fetchFeatures}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}
