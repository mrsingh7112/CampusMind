'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface AttendanceData {
  subject: string
  present: number
  total: number
  dates: string[]
  status: boolean[]
}

export default function StudentAttendancePage() {
  const { data: session } = useSession()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([])
  const [predictedAttendance, setPredictedAttendance] = useState<number | null>(null)

  useEffect(() => {
    fetchAttendanceData()
  }, [selectedMonth, selectedYear])

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch('/api/student/attendance?' + new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString()
      }))
      const data = await response.json()
      setAttendanceData(data.attendance)
      setPredictedAttendance(data.prediction)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const monthlyBarChartData = {
    labels: attendanceData.map(data => data.subject),
    datasets: [
      {
        label: 'Attendance Percentage',
        data: attendanceData.map(data => (data.present / data.total) * 100),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  }

  const attendanceTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Overall Attendance Trend',
        data: [85, 88, 82, 90, 85, predictedAttendance || 0],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  }

  const overallAttendanceData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [75, 25],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Attendance Dashboard</h1>
        <div className="flex space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {[2023, 2024].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Attendance Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Monthly Subject-wise Attendance</h2>
          <Bar data={monthlyBarChartData} />
        </div>

        {/* Attendance Trend Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Attendance Trend</h2>
          <Line data={attendanceTrendData} />
          {predictedAttendance && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                AI Prediction: Your attendance next month is predicted to be {predictedAttendance.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* Overall Attendance Doughnut Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Overall Attendance</h2>
          <div className="w-1/2 mx-auto">
            <Doughnut data={overallAttendanceData} />
          </div>
        </div>

        {/* Detailed Attendance Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Detailed Attendance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((data, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.present}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((data.present / data.total) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 