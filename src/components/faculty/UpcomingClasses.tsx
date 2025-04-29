'use client'

interface UpcomingClass {
  id: string
  course: string
  time: string
  room: string
  topic: string
}

interface UpcomingClassesProps {
  classes: UpcomingClass[]
}

export default function UpcomingClasses({ classes = [] }: UpcomingClassesProps) {
  const defaultClasses: UpcomingClass[] = [
    {
      id: '1',
      course: 'CS101',
      time: '09:00 AM - 10:30 AM',
      room: 'Room 301',
      topic: 'Introduction to Programming Concepts',
    },
    {
      id: '2',
      course: 'CS201',
      time: '11:00 AM - 12:30 PM',
      room: 'Room 302',
      topic: 'Binary Trees and Traversal',
    },
    {
      id: '3',
      course: 'CS301',
      time: '02:00 PM - 03:30 PM',
      room: 'Room 303',
      topic: 'SQL Query Optimization',
    },
  ]

  const displayClasses = classes.length > 0 ? classes : defaultClasses

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Upcoming Classes</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Your schedule for today
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {displayClasses.map((cls) => (
            <li key={cls.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400 mr-2" />
                    <p className="text-sm font-medium text-gray-900">{cls.course}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{cls.topic}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
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
                    {cls.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    {cls.room}
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