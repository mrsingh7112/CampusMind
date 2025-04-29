'use client'

import { useState } from 'react'
import { FileText, Calendar, Users, ChevronRight } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  course: {
    name: string
  }
  submissions: {
    student: {
      name: string
    }
  }[]
}

interface AssignmentListProps {
  assignments: Assignment[]
  onRefresh: () => void
}

export function AssignmentList({ assignments, onRefresh }: AssignmentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No assignments yet</h3>
        <p className="text-gray-500">Create your first assignment to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="bg-white border rounded-lg overflow-hidden"
        >
          <div
            className="p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => toggleExpand(assignment.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {assignment.title}
                  </h3>
                  <p className="text-sm text-gray-500">{assignment.course.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDateTime(assignment.dueDate)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  {assignment.submissions.length} submissions
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedId === assignment.id ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </div>
          </div>

          {expandedId === assignment.id && (
            <div className="px-4 pb-4 border-t">
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Description
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {assignment.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Recent Submissions
                  </h4>
                  <div className="mt-2 space-y-2">
                    {assignment.submissions.slice(0, 3).map((submission, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-900">
                          {submission.student.name}
                        </span>
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                  {assignment.submissions.length > 3 && (
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                      View all submissions
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 