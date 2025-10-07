'use client'

import { DashboardStats } from '@/lib/types'

interface StatsCardsProps {
  stats: DashboardStats | null
}

export default function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: '👥',
      color: 'bg-blue-500',
      change: '+12% from last month'
    },
    {
      title: 'Total Trips',
      value: stats.totalTrips.toLocaleString(),
      icon: '🚗',
      color: 'bg-green-500',
      change: '+23% from last month'
    },
    {
      title: 'Active Today',
      value: stats.activeToday.toLocaleString(),
      icon: '📊',
      color: 'bg-purple-500',
      change: 'Live users'
    },
    {
      title: 'Blitz Completed',
      value: stats.blitzCompleted.toLocaleString(),
      icon: '⚡',
      color: 'bg-yellow-500',
      change: '+8% from last week'
    },
    {
      title: 'Total Distance',
      value: `${Math.round(stats.totalDistance)} mi`,
      icon: '🛣️',
      color: 'bg-red-500',
      change: 'All time'
    },
    {
      title: 'Badges Earned',
      value: stats.badgesEarned.toLocaleString(),
      icon: '🏆',
      color: 'bg-indigo-500',
      change: '+15% from last month'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              <p className="text-xs text-gray-500 mt-2">{card.change}</p>
            </div>
            <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
