'use client'

interface Course {
  id: string
  code: string
  name: string
  students: number
  time: string
  room: string
}

interface ClassCardProps {
  courses: Course[]
}

export default function ClassCard({ courses = [] }: ClassCardProps) {
  const defaultCourses: Course[] = [
    {
      id: '1',
      code: 'CS101',
      name: 'Introduction to Computer Science',
      students: 45,
      time: '09:00 AM - 10:30 AM',
      room: 'Room 301',
    },
    {
      id: '2',
      code: 'CS201',
      name: 'Data Structures',
      students: 35,
      time: '11:00 AM - 12:30 PM',
      room: 'Room 302',
    },
    {
      id: '3',
      code: 'CS301',
      name: 'Database Management',
      students: 40,
      time: '02:00 PM - 03:30 PM',
      room: 'Room 303',
    },
  ]

  const displayCourses = courses.length > 0 ? courses : defaultCourses

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Your Classes</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Today's schedule and class information
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {displayCourses.map((course) => (
            <li key={course.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="truncate text-sm font-medium text-indigo-600">{course.code}</p>
                  <p className="truncate text-sm text-gray-900">{course.name}</p>
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {course.time}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="text-sm text-gray-900">{course.room}</span>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span className="text-sm text-gray-500">{course.students} Students</span>
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