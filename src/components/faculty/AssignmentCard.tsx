'use client'

interface Assignment {
  id: string
  title: string
  course: string
  dueDate: string
  submissions: number
  totalStudents: number
}

interface AssignmentCardProps {
  assignments: Assignment[]
}

export default function AssignmentCard({ assignments = [] }: AssignmentCardProps) {
  const defaultAssignments: Assignment[] = [
    {
      id: '1',
      title: 'Data Structures Assignment 1',
      course: 'CS201',
      dueDate: '2024-03-20',
      submissions: 25,
      totalStudents: 35,
    },
    {
      id: '2',
      title: 'Database Design Project',
      course: 'CS301',
      dueDate: '2024-03-25',
      submissions: 30,
      totalStudents: 40,
    },
    {
      id: '3',
      title: 'Programming Basics Quiz',
      course: 'CS101',
      dueDate: '2024-03-18',
      submissions: 40,
      totalStudents: 45,
    },
  ]

  const displayAssignments = assignments.length > 0 ? assignments : defaultAssignments

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Active Assignments</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Track assignment submissions and due dates
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {displayAssignments.map((assignment) => (
            <li key={assignment.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="truncate text-sm font-medium text-indigo-600">
                    {assignment.title}
                  </p>
                  <p className="truncate text-sm text-gray-500">{assignment.course}</p>
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
                    Due: {assignment.dueDate}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {assignment.submissions}/{assignment.totalStudents} Submitted
                  </div>
                  <div className="mt-2">
                    <div className="h-2 w-20 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{
                          width: `${(assignment.submissions / assignment.totalStudents) * 100}%`,
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