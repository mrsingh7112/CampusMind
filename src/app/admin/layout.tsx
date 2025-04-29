'use client'

import { useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <main className="flex-1 p-6 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <nav className="space-y-2">
              <Link href="/admin/dashboard" className="sidebar-link">Dashboard</Link>
              <Link href="/admin/faculty" className="sidebar-link">Faculty Management</Link>
              <Link href="/admin/faculty-attendance" className="sidebar-link">Faculty Attendance</Link>
              <Link href="/admin/students" className="sidebar-link">Student Management</Link>
              <Link href="/admin/departments" className="sidebar-link">Departments</Link>
              <Link href="/admin/courses" className="sidebar-link">Course Management</Link>
              <Link href="/admin/announcements" className="sidebar-link">Announcements</Link>
              <Link href="/admin/reports" className="sidebar-link">Reports</Link>
            </nav>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 