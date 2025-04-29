'use client'

import ClassCard from '@/components/faculty/ClassCard'
import AssignmentCard from '@/components/faculty/AssignmentCard'
import AttendanceOverview from '@/components/faculty/AttendanceOverview'
import UpcomingClasses from '@/components/faculty/UpcomingClasses'

export default function FacultyDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-1 md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Faculty Dashboard</h2>
      </div>

      {/* Class Overview */}
      <div className="col-span-1 md:col-span-2">
        <ClassCard courses={[]} />
      </div>

      {/* Assignments */}
      <div className="col-span-1">
        <AssignmentCard assignments={[]} />
      </div>

      {/* Attendance Overview */}
      <div className="col-span-1">
        <AttendanceOverview attendance={[]} />
      </div>

      {/* Upcoming Classes */}
      <div className="col-span-1 md:col-span-2">
        <UpcomingClasses classes={[]} />
      </div>
    </div>
  )
} 