"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface WaitlistUser {
  id: string
  auth_user_id: string
  email: string
  full_name: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export default function WaitlistPage() {
  const [users, setUsers] = useState<WaitlistUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")

  const fetchWaitlistUsers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("waitlist_users")
        .select("*")
        .order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error } = await query

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching waitlist users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWaitlistUsers()
  }, [filter])

  const updateUserStatus = async (userId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("waitlist_users")
        .update({ status })
        .eq("id", userId)

      if (error) throw error

      // Refresh the list
      fetchWaitlistUsers()
    } catch (error) {
      console.error("Error updating user status:", error)
      alert("Failed to update user status")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Pending</span>
      case "approved":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-500 border border-green-500/20">Approved</span>
      case "rejected":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-500 border border-red-500/20">Rejected</span>
      default:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-zinc-700 text-zinc-300">Unknown</span>
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Waitlist Management</h1>
        <p className="text-zinc-400">Review and approve users waiting for dashboard access</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 bg-zinc-900 p-1 rounded-xl w-fit">
        {(["all", "pending", "approved", "rejected"] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === filterOption
                ? "bg-[#E10600] text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E10600]" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl p-12 text-center">
          <p className="text-zinc-400">No {filter !== "all" ? filter : ""} waitlist users found</p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4 text-sm font-semibold text-zinc-400">Name</th>
                <th className="text-left p-4 text-sm font-semibold text-zinc-400">Email</th>
                <th className="text-left p-4 text-sm font-semibold text-zinc-400">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-zinc-400">Signed Up</th>
                <th className="text-left p-4 text-sm font-semibold text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 text-white font-medium">{user.full_name}</td>
                  <td className="p-4 text-zinc-300">{user.email}</td>
                  <td className="p-4">{getStatusBadge(user.status)}</td>
                  <td className="p-4 text-zinc-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">
                    {user.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateUserStatus(user.id, "approved")}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateUserStatus(user.id, "rejected")}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {user.status === "approved" && (
                      <button
                        onClick={() => updateUserStatus(user.id, "rejected")}
                        className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                    {user.status === "rejected" && (
                      <button
                        onClick={() => updateUserStatus(user.id, "approved")}
                        className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Re-approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
