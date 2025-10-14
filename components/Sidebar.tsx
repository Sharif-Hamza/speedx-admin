'use client'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'waitlist', label: 'Waitlist', icon: '📋' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'notifications', label: 'Push Notifications', icon: '🔔' },
    { id: 'features', label: 'Features', icon: '🎛️' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'leaderboards', label: 'Leaderboards', icon: '🏆' },
    { id: 'privacy-policy', label: 'Privacy Policy', icon: '📜' },
    { id: 'support-requests', label: 'Support Requests', icon: '💬' },
    { id: 'data-requests', label: 'Data Requests', icon: '🗂️' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl">
            ⚡
          </div>
          <div>
            <h1 className="text-xl font-bold">SpeedX</h1>
            <p className="text-xs text-gray-400">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-gray-400 truncate">admin@speedx.app</p>
          </div>
        </div>
      </div>
    </div>
  )
}
