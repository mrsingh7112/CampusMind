'use client'
import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import { format, parseISO } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Clock, CalendarDays } from 'lucide-react'

interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: { name: string; code: string };
  faculty: { name: string };
  room: { name: string };
}

const daysMap: Record<number, string> = {
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
  7: 'SUNDAY',
};

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<Record<string, TimetableSlot[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTimetable() {
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
        const res = await fetch(`/api/student/timetable`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch timetable data');
        }

        const data: TimetableSlot[] = await res.json();
        
        // Organize timetable data by day of the week
        const organizedTimetable: Record<string, TimetableSlot[]> = {};

        Object.values(daysMap).forEach(dayName => {
          organizedTimetable[dayName] = data.filter(slot => daysMap[slot.dayOfWeek]?.toUpperCase() === dayName.toUpperCase())
                                      .sort((a, b) => a.startTime.localeCompare(b.startTime));
        });

        setTimetable(organizedTimetable);
      } catch (err: any) {
        console.error('Error fetching timetable:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchTimetable();
  }, []);

  const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Weekly Timetable</h1>

      {loading ? (
        <div className="text-center text-gray-600 text-lg py-10">Loading timetable data...</div>
      ) : error ? (
        <div className="text-center text-red-600 text-lg py-10 font-medium">Error: {error}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
          <h2 className="text-xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6" /> Your Schedule
          </h2>
          
          <div className="overflow-x-auto">
            {daysOrder.map(day => timetable[day] && timetable[day].length > 0 && (
              <div key={day} className="mb-6">
                <h3 className="text-2xl font-bold text-indigo-800 mb-3 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" /> {day.charAt(0) + day.slice(1).toLowerCase()}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Time</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Room</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timetable[day].map(slot => (
                      <TableRow key={slot.id}>
                        <TableCell className="font-medium">
                          {format(parseISO(`2000-01-01T${slot.startTime}:00`), 'hh:mm a')} - {format(parseISO(`2000-01-01T${slot.endTime}:00`), 'hh:mm a')}
                        </TableCell>
                        <TableCell>{slot.subject?.code} - {slot.subject?.name}</TableCell>
                        <TableCell>{slot.faculty?.name || 'N/A'}</TableCell>
                        <TableCell>{slot.room?.name || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
            {Object.values(timetable).every(daySlots => daySlots.length === 0) && (
              <div className="text-center text-gray-500 py-4">
                No timetable entries found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 