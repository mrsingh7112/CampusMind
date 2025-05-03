"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, formatISO } from 'date-fns';
import { toast } from 'sonner';

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  status: string;
  attendanceStatus?: string;
}

export default function FacultyAttendancePage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch data every 30 seconds
  useEffect(() => {
    fetchFacultyData();
    const interval = setInterval(fetchFacultyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchFacultyData = async () => {
    try {
      const res = await fetch(`/api/faculty/realtime?date=${format(selectedDate, 'yyyy-MM-dd')}`);
      if (!res.ok) throw new Error('Failed to fetch faculty data');
      const data = await res.json();
      setFaculty(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch faculty data');
    } finally {
      setLoading(false);
    }
  };

  const handleManualMark = async (facultyId: string, status: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/faculty/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId,
          date: formatISO(selectedDate, { representation: 'date' }),
          status,
          manual: true
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.existingStatus) {
          toast.error(`Already marked as ${data.existingStatus}`);
        } else {
          throw new Error(data.error || 'Failed to mark attendance');
        }
        return;
      }
      
      toast.success(`Marked as ${status}`);
      fetchFacultyData();
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      toast.error(error.message || 'Failed to mark attendance');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Faculty Attendance Management</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-700">Select Date:</label>
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={e => { setSelectedDate(new Date(e.target.value)); setLoading(true); fetchFacultyData(); }}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Present</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Absent</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="text-sm text-gray-600">Not Marked</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Department</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Attendance</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {faculty.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{f.name}</p>
                          <p className="text-sm text-gray-500">{f.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{f.department}</td>
                      <td className="py-4 px-6">
                        <Badge 
                          className={`${
                            f.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          } font-medium`}
                        >
                          {f.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        {f.attendanceStatus ? (
                          <Badge 
                            className={`${
                              f.attendanceStatus === 'PRESENT' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            } font-medium`}
                          >
                            {f.attendanceStatus}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">Not Marked</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={f.attendanceStatus === 'PRESENT' ? 'default' : 'outline'}
                            className={`${
                              f.attendanceStatus === 'PRESENT' 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'hover:bg-green-50'
                            }`}
                            onClick={() => handleManualMark(f.id, 'PRESENT')}
                            disabled={isProcessing || f.attendanceStatus === 'PRESENT'}
                          >
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={f.attendanceStatus === 'ABSENT' ? 'destructive' : 'outline'}
                            className={`${
                              f.attendanceStatus === 'ABSENT' 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'hover:bg-red-50'
                            }`}
                            onClick={() => handleManualMark(f.id, 'ABSENT')}
                            disabled={isProcessing || f.attendanceStatus === 'ABSENT'}
                          >
                            Absent
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 