'use client'

import { format } from 'date-fns';
import { useState } from 'react';

interface Course {
  id: string
  subject: { name: string, code: string } | null
  course: { name: string } | null
  semester: number
  studentCount: number
  startTime: string
  endTime: string
  room: { name: string, building: string, floor: number } | null
}

interface ClassCardProps {
  courses: Course[]
}

export default function ClassCard({ courses = [] }: ClassCardProps) {
  const [expanded, setExpanded] = useState(false);
  const showCount = 2;
  const displayCourses = expanded ? courses : courses.slice(0, showCount);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  if (!courses || courses.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 text-lg border border-dashed border-gray-300 rounded-xl bg-gray-50">
        <p className="mb-2">No classes scheduled for today.</p>
        <p className="text-sm text-gray-400">Enjoy your day!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-blue-800 mb-4">Assigned Subjects</h3>
      {displayCourses.map((slot) => (
        <div
          key={slot.id}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between border border-blue-200 transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-2xl"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xl font-extrabold text-blue-800">{slot.subject?.name || '-'}</span>
              <span className="text-sm bg-blue-200 text-blue-800 rounded-full px-3 py-1 font-semibold">{slot.subject?.code || '-'}</span>
            </div>
            <div className="text-base text-indigo-700 font-medium mb-1">{slot.course?.name || '-'} | Semester {slot.semester}</div>
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-semibold text-gray-700">Time:</span> {slot.startTime} - {slot.endTime}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-700">Room:</span> {slot.room ? `${slot.room.name} (${slot.room.building}, Floor ${slot.room.floor})` : '-'}
            </div>
          </div>
          <div className="mt-5 md:mt-0 flex flex-col items-end justify-center min-w-[140px]">
            <div className="text-lg font-bold text-white bg-blue-600 rounded-full px-4 py-2 shadow-md">
              {slot.studentCount} Students
            </div>
          </div>
        </div>
      ))}
      {courses.length > showCount && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:from-indigo-500 hover:to-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {expanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      )}
    </div>
  );
} 