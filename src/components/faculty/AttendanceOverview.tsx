'use client'

interface CourseAttendance {
  id: string
  course: string
  totalStudents: number
  presentStudents: number
  date: string
}

interface AttendanceOverviewProps {
  attendance: CourseAttendance[]
}

export default function AttendanceOverview({ attendance = [] }: AttendanceOverviewProps) {
  const defaultAttendance: CourseAttendance[] = [
    {
      id: '1',
      course: 'CS101 - Introduction to Computer Science',
      totalStudents: 45,
      presentStudents: 42,
      date: '2024-03-15',
    },
    {
      id: '2',
      course: 'CS201 - Data Structures',
      totalStudents: 35,
      presentStudents: 30,
      date: '2024-03-15',
    },
    {
      id: '3',
      course: 'CS301 - Database Management',
      totalStudents: 40,
      presentStudents: 38,
      date: '2024-03-15',
    },
  ]

  const displayAttendance = attendance.length > 0 ? attendance : defaultAttendance

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Today's Attendance</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Overview of attendance for your classes
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {displayAttendance.map((record) => (
            <li key={record.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {record.course}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg
                      className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {record.date}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {record.presentStudents}/{record.totalStudents} Present
                  </div>
                  <div className="mt-2">
                    <div className="h-2 w-20 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{
                          width: `${(record.presentStudents / record.totalStudents) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 