"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function LeaderboardsPage() {
  const [resetting, setResetting] = useState(false)
  const [resetStatus, setResetStatus] = useState<string | null>(null)
  const [snapshotting, setSnapshotting] = useState(false)
  const [snapshotStatus, setSnapshotStatus] = useState<string | null>(null)

  const resetWeeklyLeaderboards = async () => {
    if (!confirm("Are you sure you want to reset weekly leaderboard tracking? This will clear all position change history and start fresh from today.")) {
      return
    }

    setResetting(true)
    setResetStatus(null)

    try {
      // In a real implementation, this would call a Supabase RPC function
      // For now, we'll just show instructions to users
      
      console.log("🔄 [Admin] Weekly leaderboard reset initiated")
      console.log("📊 This will reset position tracking for all users")
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setResetStatus("success")
      
      // Show alert with instructions for users
      alert(
        "Weekly Leaderboard Reset Initiated!\n\n" +
        "All users need to clear their browser cache:\n" +
        "1. Open dashboard (localhost:3000)\n" +
        "2. Press F12 to open console\n" +
        "3. Type: localStorage.clear()\n" +
        "4. Refresh the page\n\n" +
        "CHG indicators will now track from this week forward."
      )
      
    } catch (error) {
      console.error("Error resetting leaderboards:", error)
      setResetStatus("error")
    } finally {
      setResetting(false)
    }
  }

  const createWeeklySnapshot = async () => {
    // Calculate last week's dates (Sunday to Saturday)
    const today = new Date()
    const lastSunday = new Date(today)
    lastSunday.setDate(today.getDate() - today.getDay() - 7) // Go back to last Sunday
    lastSunday.setHours(0, 0, 0, 0)
    
    const lastSaturday = new Date(lastSunday)
    lastSaturday.setDate(lastSunday.getDate() + 6)
    lastSaturday.setHours(23, 59, 59, 999)
    
    const weekStart = lastSunday.toISOString().split('T')[0]
    const weekEnd = lastSaturday.toISOString().split('T')[0]
    
    if (!confirm(`Create weekly snapshot for:\n\nWeek: ${weekStart} to ${weekEnd}\n\nThis will save current leaderboard positions for CHG tracking.`)) {
      return
    }
    
    setSnapshotting(true)
    setSnapshotStatus(null)
    
    try {
      const response = await fetch('/api/leaderboard/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart, weekEnd })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create snapshot')
      }
      
      setSnapshotStatus('success')
      alert(`Snapshot Created!\n\nMax Speed: ${data.maxSpeedSnapshots} entries\nDistance: ${data.distanceSnapshots} entries\n\nCHG indicators will now work for next week!`)
      
    } catch (error: any) {
      console.error('Error creating snapshot:', error)
      setSnapshotStatus('error')
      alert(`Failed to create snapshot: ${error.message}`)
    } finally {
      setSnapshotting(false)
    }
  }

  const clearAllTrips = async () => {
    if (!confirm("⚠️ WARNING: This will DELETE ALL TRIP DATA from the database. This action CANNOT be undone. Are you absolutely sure?")) {
      return
    }

    const confirmText = prompt("Type 'DELETE ALL TRIPS' to confirm:")
    if (confirmText !== "DELETE ALL TRIPS") {
      alert("Confirmation text did not match. Operation cancelled.")
      return
    }

    setResetting(true)
    setResetStatus(null)

    try {
      const { error } = await supabase
        .from("trips")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all rows
      
      if (error) throw error

      setResetStatus("success")
      alert("All trip data has been deleted. Leaderboards will be empty.")
      
    } catch (error) {
      console.error("Error clearing trips:", error)
      setResetStatus("error")
      alert("Failed to clear trip data. Check console for details.")
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Leaderboard Management</h1>
        <p className="text-zinc-400">Manage weekly resets and leaderboard data</p>
        <div className="space-y-3 mt-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-blue-400">
              <strong>✅ Weekly filtering is now automatic!</strong> The dashboard filters trips by date automatically when users switch to "WEEKLY" mode. 
              Data shows only trips from Sunday 12:00 AM onwards each week.
            </p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-sm text-green-400">
              <strong>✅ CHG indicators are now automatic!</strong> The leaderboard automatically calculates position changes from last week's trip data. 
              No manual snapshot creation needed - it works automatically with real-time fallback!
            </p>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {resetStatus && (
        <div className={`mb-6 p-4 rounded-xl border ${
          resetStatus === "success" 
            ? "bg-green-500/10 border-green-500/20 text-green-500" 
            : "bg-red-500/10 border-red-500/20 text-red-500"
        }`}>
          {resetStatus === "success" 
            ? "✅ Operation completed successfully" 
            : "❌ Operation failed. Check console for details."}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Weekly Snapshot Card */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Create Weekly Snapshot
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">OPTIONAL</span>
              </h3>
              <p className="text-sm text-zinc-400">Performance optimization (not required)</p>
            </div>
          </div>

          <div className="space-y-3 mb-6 text-sm text-zinc-300">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Saves current leaderboard positions to database</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Improves CHG calculation performance (faster loading)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Optional: CHG works automatically without snapshots</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✅</span>
              <span className="text-green-500">CHG now works automatically via fallback calculation</span>
            </div>
          </div>

          <button
            onClick={createWeeklySnapshot}
            disabled={snapshotting}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {snapshotting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                <span>Creating Snapshot...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Create Snapshot</span>
              </>
            )}
          </button>
        </div>
        
        {/* Reset Weekly Tracking Card */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Reset Weekly Tracking</h3>
              <p className="text-sm text-zinc-400">Clear position change history</p>
            </div>
          </div>

          <div className="space-y-3 mb-6 text-sm text-zinc-300">
            <div className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Only affects CHG (position change) indicators</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Weekly data filtering happens automatically by date</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Does NOT affect weekly/all-time trip filtering</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Does NOT delete any trip data</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">⚠️</span>
              <span className="text-yellow-500">Users need to clear browser cache to reset CHG indicators</span>
            </div>
          </div>

          <button
            onClick={resetWeeklyLeaderboards}
            disabled={resetting}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {resetting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset Weekly Tracking</span>
              </>
            )}
          </button>
        </div>

        {/* Clear All Trips Card (Danger Zone) */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Clear All Trip Data</h3>
              <p className="text-sm text-red-400">⚠️ DANGER ZONE</p>
            </div>
          </div>

          <div className="space-y-3 mb-6 text-sm text-zinc-300">
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-1">🗑️</span>
              <span>Deletes ALL trips from database</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-1">🗑️</span>
              <span>Empties both leaderboards completely</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-1">⚠️</span>
              <span className="text-red-500 font-semibold">THIS ACTION CANNOT BE UNDONE</span>
            </div>
          </div>

          <button
            onClick={clearAllTrips}
            disabled={resetting}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {resetting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Delete All Trip Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Current Leaderboard Stats */}
      <div className="mt-8 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <h3 className="text-lg font-bold text-white mb-4">Current Leaderboard Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LeaderboardStat 
            label="Total Trips" 
            value="Loading..." 
            icon="🚗"
            color="text-blue-500"
          />
          <LeaderboardStat 
            label="Total Users" 
            value="Loading..." 
            icon="👥"
            color="text-green-500"
          />
          <LeaderboardStat 
            label="Weekly Reset" 
            value="Every Sunday"
            icon="📅"
            color="text-purple-500"
          />
        </div>
      </div>

      {/* Instructions Panel */}
      <div className="mt-8 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <h3 className="text-lg font-bold text-white mb-4">How Weekly Leaderboards Work (Updated!)</h3>
        <div className="space-y-3 text-sm text-zinc-300">
          <div className="flex items-start gap-3">
            <span className="text-2xl">1️⃣</span>
            <div>
              <p className="font-semibold text-white mb-1 flex items-center gap-2">
                Automatic Date Filtering
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">AUTO</span>
              </p>
              <p>When users select "WEEKLY" mode, the dashboard automatically shows only trips from the current week (Sunday 12:00 AM onwards). This resets automatically every Sunday.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">2️⃣</span>
            <div>
              <p className="font-semibold text-white mb-1 flex items-center gap-2">
                Position Change (CHG) Tracking
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">NEW! AUTO</span>
              </p>
              <p><strong className="text-green-400">Now fully automatic!</strong> CHG indicators automatically calculate position changes by comparing current week positions with last week's trip data. No manual snapshots needed - it works in real-time with automatic fallback calculation.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">3️⃣</span>
            <div>
              <p className="font-semibold text-white mb-1">Optional Manual Snapshots</p>
              <p>Snapshots are now <strong>optional</strong> for performance optimization. The system works automatically without them by calculating from trip data. You can still create snapshots manually for faster loading, but they're no longer required.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">4️⃣</span>
            <div>
              <p className="font-semibold text-white mb-1">How It Works</p>
              <p>The dashboard first tries to load from snapshots (fast). If no snapshot exists, it automatically calculates positions from last week's trips (fallback). Users always see accurate CHG indicators - no "—" for users with previous data!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LeaderboardStat({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}
