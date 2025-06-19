'use client'
import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import { format, parseISO } from 'date-fns'
import { CalendarDays, BarChart2, ListChecks } from 'lucide-react'

interface AttendanceStats {
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  month: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  subject: {
    name: string;
    code: string;
  };
}

export default function AttendancePage() {
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      setError(null);
      const session = await getSession();
      const studentId = session?.user?.id;

      if (!studentId) {
        setError('Student ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const [year, month] = selectedMonth.split('-');
        const res = await fetch(`/api/student/attendance?month=${month}&year=${year}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch attendance data');
        }

        const data = await res.json();
        setAttendanceStats(data.stats);
        setAttendanceRecords(data.records);
      } catch (err: any) {
        console.error('Error fetching attendance:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchAttendance();
  }, [selectedMonth]);

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Attendance Overview</h1>

      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="month-select" className="text-lg font-medium text-gray-700">Select Month:</label>
        <input
          type="month"
          id="month-select"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-600 text-lg py-10">Loading attendance data...</div>
      ) : error ? (
        <div className="text-center text-red-600 text-lg py-10 font-medium">Error: {error}</div>
      ) : (
        <>
          {/* Attendance Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <BarChart2 className="w-6 h-6" /> Attendance Statistics ({format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-5xl font-extrabold text-blue-900">{attendanceStats?.percentage || 0}%</p>
                <p className="text-lg text-gray-600">Present</p>
              </div>
              <div>
                <p className="text-5xl font-extrabold text-blue-900">{attendanceStats?.attendedClasses || 0}</p>
                <p className="text-lg text-gray-600">Classes Attended</p>
              </div>
              <div>
                <p className="text-5xl font-extrabold text-blue-900">{attendanceStats?.totalClasses || 0}</p>
                <p className="text-lg text-gray-600">Total Classes</p>
              </div>
            </div>
          </div>

          {/* Attendance Records */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
              <ListChecks className="w-6 h-6" /> Attendance Records
            </h2>
            <div className="overflow-x-auto">
              {attendanceRecords.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {format(parseISO(record.date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {record.subject.code} - {record.subject.name}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                          record.status === 'PRESENT' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {record.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center text-gray-500 py-4">No attendance records for this month.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 