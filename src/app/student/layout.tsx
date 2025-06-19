'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/student/dashboard' },
  { name: 'Attendance', href: '/student/attendance' },
  { name: 'Timetable', href: '/student/timetable' },
  { name: 'Courses', href: '/student/courses' },
  { name: 'Assignments', href: '/student/assignments' },
  { name: 'Results', href: '/student/results' },
  { name: 'Notifications', href: '/student/notifications' },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 text-2xl font-bold text-blue-700">Student Portal</div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg font-medium transition-colors ${pathname.startsWith(item.href) ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
} 