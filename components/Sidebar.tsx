'use client'

import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
  const router = useRouter()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'waitlist', label: 'Waitlist', icon: '📋' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'notifications', label: 'Push Notifications', icon: '🔔' },
    { id: 'features', label: 'Features', icon: '🎛️' },
    { id: 'banners', label: 'Banners', icon: '🎯' },
    { id: 'challenges', label: 'Challenges', icon: '🏁' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'leaderboards', label: 'Leaderboards', icon: '🏆' },
    { id: 'privacy-policy', label: 'Privacy Policy', icon: '📜' },
    { id: 'support-requests', label: 'Support Requests', icon: '💬' },
    { id: 'data-requests', label: 'Data Requests', icon: '🗂️' },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function handleTabClick(tab: string) {
    setActiveTab(tab)
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between md:justify-start space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xl md:text-2xl">
                ⚡
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold">SpeedX</h1>
                <p className="text-xs text-gray-400">Admin Dashboard</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 md:px-4 space-y-1 md:space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors text-sm md:text-base ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-lg md:text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 md:p-4 border-t border-gray-800 space-y-2">
          <div className="flex items-center space-x-3 px-3 md:px-4 py-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">admin@speedx.app</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 md:px-4 py-2 rounded-lg text-red-400 hover:bg-gray-800 transition-colors text-sm md:text-base"
          >
            <span className="text-lg md:text-xl">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}
