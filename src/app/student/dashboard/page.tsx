'use client'

import StudentHeader from '@/components/student/StudentHeader'
import StudentSidebar from '@/components/student/StudentSidebar'
import AttendanceCard from '@/components/student/AttendanceCard'
import TimeTableCard from '@/components/student/TimeTableCard'
import CourseCard from '@/components/student/CourseCard'
import NotificationCard from '@/components/student/NotificationCard'

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <StudentHeader />
      <div className="flex">
        <StudentSidebar />
        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CourseCard />
                </div>
            <div>
              <AttendanceCard />
            </div>
            <div className="lg:col-span-2">
              <TimeTableCard />
            </div>
            <div>
              <NotificationCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 