"use client"
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Filter, RefreshCw } from 'lucide-react'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [analytics, setAnalytics] = useState<any>(null)
  const [filters, setFilters] = useState({
    dateRange: '6', // months
    department: 'all',
    course: 'all'
  })
  const [departments, setDepartments] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [showPredictionsChart, setShowPredictionsChart] = useState(true)
  const [visibleReport, setVisibleReport] = useState<string | null>(null)
  const [reportChartData, setReportChartData] = useState<any>(null)
  const [reportChartLoading, setReportChartLoading] = useState(false)
  
  // Refs for chart components
  const attendanceChartRef = useRef(null)
  const departmentChartRef = useRef(null)
  const performanceChartRef = useRef(null)
  const workloadChartRef = useRef(null)

  useEffect(() => {
    fetchDepartments()
    fetchCourses()
  }, [])

  useEffect(() => {
    fetchAnalytics()
    fetchPredictions()
    const interval = setInterval(() => {
      fetchAnalytics()
      fetchPredictions()
    }, 5000)
    return () => clearInterval(interval)
  }, [filters])

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/admin/departments')
      if (!res.ok) throw new Error('Failed to fetch departments')
      const data = await res.json()
      setDepartments(data)
    } catch (err) {
      setError('Failed to load departments')
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses')
      if (!res.ok) throw new Error('Failed to fetch courses')
      const data = await res.json()
      setCourses(data)
    } catch (err) {
      setError('Failed to load courses')
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        months: filters.dateRange,
        department: filters.department,
        course: filters.course
      })
      const res = await fetch(`/api/admin/reports/analytics?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const fetchPredictions = async () => {
    try {
      const res = await fetch(`/api/admin/reports/predictions?format=json`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to fetch predictions')
      const data = await res.json()
      setPredictions(data.predictions)
    } catch (err) {
      // Optionally set error
    }
  }

  const handleExportChart = (chartRef: any, filename: string) => {
    if (chartRef.current) {
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = chartRef.current.toBase64Image()
      link.click()
    }
  }

  const handleSeeReport = async (type: string) => {
    setReportChartLoading(true)
    setVisibleReport(type)
    setReportChartData(null)
    try {
      let url = `/api/admin/reports/${type}?format=json`
      let method = 'POST'
      if (type === 'analytics') {
        // For analytics, use GET
        url = `/api/admin/reports/analytics?months=${filters.dateRange}&department=${filters.department}&course=${filters.course}`
        method = 'GET'
      }
      const res = await fetch(url, { method })
      if (!res.ok) throw new Error('Failed to fetch report data')
      const data = await res.json()
      setReportChartData(data)
    } catch (err) {
      setReportChartData({ error: 'Failed to load report data' })
    } finally {
      setReportChartLoading(false)
    }
  }

  const handleHideReport = () => {
    setVisibleReport(null)
    setReportChartData(null)
  }

  const handleDownloadReport = async (type: string) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        format: 'csv'
      })
      const resCsv = await fetch(`/api/admin/reports/${type}?${queryParams}`, { method: 'POST' })
      if (!resCsv.ok) throw new Error('Failed to generate report')
      const blob = await resCsv.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_report.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      setSuccess('Report downloaded successfully!')
    } catch (err) {
      setError('Failed to download report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <Button onClick={fetchAnalytics} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <select
                className="w-full border rounded p-2 bg-white"
                value={filters.dateRange}
                onChange={e => setFilters(f => ({ ...f, dateRange: e.target.value }))}
              >
                <option value="1">Last Month</option>
                <option value="3">Last 3 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select
                className="w-full border rounded p-2 bg-white"
                value={filters.department}
                onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Course</label>
              <select
                className="w-full border rounded p-2 bg-white"
                value={filters.course}
                onChange={e => setFilters(f => ({ ...f, course: e.target.value }))}
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      {/* Analytics Dashboard */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attendance Trends */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attendance Trends</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportChart(attendanceChartRef, 'attendance_trends')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Line
                ref={attendanceChartRef}
                data={{
                  labels: analytics.attendanceTrends.labels,
                  datasets: [{
                    label: 'Average Attendance %',
                    data: analytics.attendanceTrends.data,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' as const },
                    title: { display: true, text: 'Monthly Attendance Trends' }
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Department Statistics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Department Statistics</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportChart(departmentChartRef, 'department_stats')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Bar
                ref={departmentChartRef}
                data={{
                  labels: analytics.departmentStats.labels,
                  datasets: [
                    {
                      label: 'Students',
                      data: analytics.departmentStats.students,
                      backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    },
                    {
                      label: 'Faculty',
                      data: analytics.departmentStats.faculty,
                      backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' as const },
                    title: { display: true, text: 'Department-wise Distribution' }
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Performance Distribution */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Performance Distribution</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportChart(performanceChartRef, 'performance_dist')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Pie
                ref={performanceChartRef}
                data={{
                  labels: ['Good', 'Average', 'At Risk'],
                  datasets: [{
                    data: analytics.performanceDistribution,
                    backgroundColor: [
                      'rgba(75, 192, 192, 0.5)',
                      'rgba(255, 206, 86, 0.5)',
                      'rgba(255, 99, 132, 0.5)',
                    ]
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' as const },
                    title: { display: true, text: 'Student Performance Distribution' }
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Faculty Workload */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Faculty Workload</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportChart(workloadChartRef, 'faculty_workload')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Bar
                ref={workloadChartRef}
                data={{
                  labels: analytics.facultyWorkload.labels,
                  datasets: [{
                    label: 'Courses Assigned',
                    data: analytics.facultyWorkload.data,
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' as const },
                    title: { display: true, text: 'Faculty Course Distribution' }
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Attendance */}
        <Card className="shadow-lg border-2 border-blue-100">
          <CardHeader>
            <CardTitle>Attendance Reports</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => handleDownloadReport('attendance')} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Download Report</Button>
            <Button variant="outline" onClick={() => handleSeeReport('attendance')} className="w-full">See Report</Button>
          </CardContent>
        </Card>
        {/* Academic */}
        <Card className="shadow-lg border-2 border-green-100">
          <CardHeader>
            <CardTitle>Academic Reports</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => handleDownloadReport('academic')} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">Download Report</Button>
            <Button variant="outline" onClick={() => handleSeeReport('academic')} className="w-full">See Report</Button>
          </CardContent>
        </Card>
        {/* Faculty */}
        <Card className="shadow-lg border-2 border-purple-100">
          <CardHeader>
            <CardTitle>Faculty Reports</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => handleDownloadReport('faculty')} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">Download Report</Button>
            <Button variant="outline" onClick={() => handleSeeReport('faculty')} className="w-full">See Report</Button>
          </CardContent>
        </Card>
        {/* Student */}
        <Card className="shadow-lg border-2 border-yellow-100">
          <CardHeader>
            <CardTitle>Student Reports</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => handleDownloadReport('student')} disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">Download Report</Button>
            <Button variant="outline" onClick={() => handleSeeReport('student')} className="w-full">See Report</Button>
          </CardContent>
        </Card>
        {/* Department */}
        <Card className="shadow-lg border-2 border-pink-100">
          <CardHeader>
            <CardTitle>Department Reports</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => handleDownloadReport('department')} disabled={loading} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Download Report</Button>
            <Button variant="outline" onClick={() => handleSeeReport('department')} className="w-full">See Report</Button>
          </CardContent>
        </Card>
        {/* System */}
        <Card className="shadow-lg border-2 border-gray-200">
          <CardHeader>
            <CardTitle>System Reports</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => handleDownloadReport('system')} disabled={loading} className="w-full bg-gray-700 hover:bg-gray-800 text-white">Download Report</Button>
            <Button variant="outline" onClick={() => handleSeeReport('system')} className="w-full">See Report</Button>
          </CardContent>
        </Card>
        {/* Custom */}
        <Card className="shadow-lg border-2 border-indigo-100">
          <CardHeader>
            <CardTitle>Custom Reports</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => handleDownloadReport('custom')} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Download Report</Button>
            <Button variant="outline" onClick={() => handleSeeReport('custom')} className="w-full">See Report</Button>
          </CardContent>
        </Card>
        {/* AI/ML Predictions */}
        <Card className="shadow-lg border-2 border-cyan-100">
          <CardHeader>
            <CardTitle>AI/ML Predictions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => handleDownloadReport('predictions')} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">Download Report</Button>
            <Button variant="outline" onClick={() => handleSeeReport('predictions')} className="w-full">See Report</Button>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section for Selected Report */}
      {visibleReport && (
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{visibleReport === 'predictions' ? 'AI/ML Predictions Analysis' : `${visibleReport.charAt(0).toUpperCase() + visibleReport.slice(1)} Report Chart`}</CardTitle>
            <Button variant="ghost" onClick={handleHideReport}>Hide</Button>
          </CardHeader>
          <CardContent>
            {reportChartLoading && <div className="text-center py-8">Loading chart...</div>}
            {!reportChartLoading && reportChartData && !reportChartData.error && (
              <div>
                {/* Render different charts based on report type */}
                {visibleReport === 'predictions' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Risk Distribution Pie Chart */}
                    <div>
                      <h3 className="font-semibold mb-2">Risk Distribution</h3>
                      <Pie
                        data={{
                          labels: ['Low', 'Medium', 'High'],
                          datasets: [{
                            data: [
                              reportChartData.predictions.filter((p: any) => p.riskLevel === 'Low').length,
                              reportChartData.predictions.filter((p: any) => p.riskLevel === 'Medium').length,
                              reportChartData.predictions.filter((p: any) => p.riskLevel === 'High').length,
                            ],
                            backgroundColor: [
                              'rgba(75, 192, 192, 0.5)',
                              'rgba(255, 206, 86, 0.5)',
                              'rgba(255, 99, 132, 0.5)',
                            ]
                          }]
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: 'top' as const },
                            title: { display: true, text: 'Student Risk Levels' }
                          }
                        }}
                      />
                    </div>
                    {/* Grade Distribution Bar Chart */}
                    <div>
                      <h3 className="font-semibold mb-2">Predicted Grade Distribution</h3>
                      <Bar
                        data={{
                          labels: ['60-69', '70-79', '80-89', '90-100'],
                          datasets: [{
                            label: 'Number of Students',
                            data: [
                              reportChartData.predictions.filter((p: any) => p.predictedGrade >= 60 && p.predictedGrade < 70).length,
                              reportChartData.predictions.filter((p: any) => p.predictedGrade >= 70 && p.predictedGrade < 80).length,
                              reportChartData.predictions.filter((p: any) => p.predictedGrade >= 80 && p.predictedGrade < 90).length,
                              reportChartData.predictions.filter((p: any) => p.predictedGrade >= 90).length,
                            ],
                            backgroundColor: 'rgba(153, 102, 255, 0.5)',
                          }]
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { display: false },
                            title: { display: true, text: 'Predicted Grades' }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
                {/* Example for Attendance Report (Line Chart) */}
                {visibleReport === 'attendance' && reportChartData && reportChartData.data && (
                  <Line
                    data={{
                      labels: reportChartData.data.labels,
                      datasets: [{
                        label: 'Attendance %',
                        data: reportChartData.data.values,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' as const },
                        title: { display: true, text: 'Attendance Trends' }
                      }
                    }}
                  />
                )}
                {/* Add similar chart logic for other report types as needed */}
              </div>
            )}
            {!reportChartLoading && reportChartData && reportChartData.error && (
              <div className="text-red-500 text-center py-8">{reportChartData.error}</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 