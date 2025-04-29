'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 
  Bell, 
  Settings,
  Menu,
  X
} from 'lucide-react'

export default function FacultyDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/faculty/dashboard',
      icon: BookOpen,
    },
    {
      name: 'Attendance',
      href: '/faculty/attendance',
      icon: Users,
    },
    {
      name: 'Assignments',
      href: '/faculty/assignments',
      icon: FileText,
    },
    {
      name: 'Schedule',
      href: '/faculty/schedule',
      icon: Calendar,
    },
    {
      name: 'Notifications',
      href: '/faculty/notifications',
      icon: Bell,
    },
    {
      name: 'Settings',
      href: '/faculty/settings',
      icon: Settings,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-semibold">Faculty Portal</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-md lg:hidden hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div
        className={`min-h-screen transition-all duration-200 ${
          isSidebarOpen ? 'pl-64' : 'pl-0'
        }`}
      >
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-500" />
              <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
} 