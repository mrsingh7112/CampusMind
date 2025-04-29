'use client'

export default function NotificationCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
      <div className="space-y-4">
        <div className="border-l-4 border-blue-500 pl-4 py-2">
          <p className="font-medium">Assignment Due: Data Structures</p>
          <p className="text-sm text-gray-500">Due in 2 days</p>
        </div>
        <div className="border-l-4 border-green-500 pl-4 py-2">
          <p className="font-medium">Quiz Result: Database Management</p>
          <p className="text-sm text-gray-500">Score: 85/100</p>
        </div>
        <div className="border-l-4 border-yellow-500 pl-4 py-2">
          <p className="font-medium">Class Rescheduled: Software Engineering</p>
          <p className="text-sm text-gray-500">New time: 2:00 PM - 3:30 PM</p>
        </div>
      </div>
    </div>
  )
} 