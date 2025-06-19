'use client'

import { useState, useMemo } from 'react';

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
  // Find the subject with the most students
  const defaultIdx = useMemo(() => {
    if (attendance.length === 0) return 0;
    let maxIdx = 0;
    let max = attendance[0].totalStudents;
    attendance.forEach((a, i) => {
      if (a.totalStudents > max) {
        max = a.totalStudents;
        maxIdx = i;
      }
    });
    return maxIdx;
  }, [attendance]);

  const [selectedIdx, setSelectedIdx] = useState(defaultIdx);
  const [expanded, setExpanded] = useState(false);
  const showCount = 2;

  if (!attendance || attendance.length === 0) {
    return (
      <div className="bg-purple-50 rounded-2xl shadow-xl border border-purple-200 overflow-hidden h-full flex flex-col">
        <div className="px-6 py-5 bg-purple-100 border-b border-purple-200 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              Today's Attendance
            </h3>
            <p className="mt-1 text-sm text-purple-700 font-medium">
              Overview of attendance for your classes
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 text-center text-gray-500 text-lg">
            <p className="mb-2">No attendance records to display for today.</p>
            <p className="text-sm text-gray-400">Check back later!</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedAttendance = attendance[selectedIdx];

  // If you have a student list, replace this with the actual student data
  // For now, we'll simulate a student list for demonstration
  const students = Array.from({ length: selectedAttendance.totalStudents }, (_, i) => ({
    name: `Student ${i + 1}`,
    present: i < selectedAttendance.presentStudents
  }));
  const displayStudents = expanded ? students : students.slice(0, showCount);

  return (
    <div className="bg-purple-50 rounded-2xl shadow-xl border border-purple-200 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 bg-purple-100 border-b border-purple-200 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <svg
              className="h-6 w-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            Today's Attendance
          </h3>
          <p className="mt-1 text-sm text-purple-700 font-medium">
            Overview of attendance for your classes
          </p>
        </div>
        <div>
          <select
            className="rounded-lg border border-purple-300 px-3 py-2 text-purple-800 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={selectedIdx}
            onChange={e => { setSelectedIdx(Number(e.target.value)); setExpanded(false); }}
          >
            {attendance.map((a, i) => (
              <option key={a.id} value={i}>{a.course}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold text-gray-800">{selectedAttendance.course}</div>
            <div className="inline-flex items-center rounded-full bg-blue-500 text-white px-3 py-1 text-sm font-bold shadow-sm">
              {selectedAttendance.presentStudents}/{selectedAttendance.totalStudents} Present
            </div>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-4">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${(selectedAttendance.presentStudents / selectedAttendance.totalStudents) * 100}%` }}
            />
          </div>
          <div>
            <div className="text-base font-medium text-purple-700 mb-2">Student List</div>
            {students.length === 0 ? (
              <div className="text-gray-500">No students found.</div>
            ) : (
              <ul className="space-y-2">
                {displayStudents.map((student, idx) => (
                  <li key={idx} className={`flex items-center justify-between px-4 py-2 rounded-lg shadow-sm border ${student.present ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <span className="font-medium text-gray-800">{student.name}</span>
                    <span className={`text-sm font-bold ${student.present ? 'text-green-600' : 'text-red-600'}`}>{student.present ? 'Present' : 'Absent'}</span>
                  </li>
                ))}
              </ul>
            )}
            {students.length > showCount && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setExpanded(prev => !prev)}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:from-pink-500 hover:to-purple-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {expanded ? 'Show Less' : 'Show More'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 