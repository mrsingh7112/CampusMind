'use client'

export default function TimeTableCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
      <div className="space-y-4">
        <div className="border rounded-lg p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Data Structures</p>
              <p className="text-sm text-gray-500">Dr. Sarah Wilson</p>
            </div>
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
              9:00 AM - 10:30 AM
            </span>
          </div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Database Management</p>
              <p className="text-sm text-gray-500">Dr. Michael Chen</p>
            </div>
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
              11:00 AM - 12:30 PM
            </span>
          </div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Software Engineering</p>
              <p className="text-sm text-gray-500">Dr. Emily Brown</p>
            </div>
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
              2:00 PM - 3:30 PM
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 