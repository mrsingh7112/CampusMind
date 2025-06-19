'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import ClassCard from '@/components/faculty/ClassCard'
import AttendanceOverview from '@/components/faculty/AttendanceOverview'
import { format } from 'date-fns'
import { ClipboardList } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Calendar, ClipboardCheck } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function FacultyDashboard() {
  const { data: session } = useSession();
  // const name = session?.user?.name || 'Faculty';
  // const initialGreeting = getGreeting();
  // const [currentGreeting, setCurrentGreeting] = useState(initialGreeting);
  // const [displayed, setDisplayed] = useState('');
  // const [showWelcome, setShowWelcome] = useState(true); // Always show welcome on initial load

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalAssignments: 0,
  });
  
  // Set typing animation for the current greeting
  // useEffect(() => {
  //   if (showWelcome) {
  //     setDisplayed(''); // Reset displayed text for new animation
  //     let i = 0;
  //     const interval = setInterval(() => {
  //       setDisplayed(`${currentGreeting}, ${name}!`.slice(0, i + 1));
  //       i++;
  //       if (i >= `${currentGreeting}, ${name}!`.length) clearInterval(interval);
  //     }, 70);
  //     return () => clearInterval(interval);
  //   }
  // }, [showWelcome, currentGreeting, name]);

  // Voice greeting effect
  // useEffect(() => {
  //   if (showWelcome && typeof window !== 'undefined' && 'speechSynthesis' in window) {
  //     const utter = new window.SpeechSynthesisUtterance(`${currentGreeting}, ${name}!`);
  //     utter.rate = 1.05;
  //     utter.pitch = 1.1;
  //     window.speechSynthesis.cancel();
  //     window.speechSynthesis.speak(utter);
  //   }
  // }, [showWelcome, currentGreeting, name]);

  // Hide welcome after 5 seconds
  // useEffect(() => {
  //   if (showWelcome) {
  //     const timer = setTimeout(() => setShowWelcome(false), 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [showWelcome]);

  // Periodically check for greeting changes
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const newGreeting = getGreeting();
  //     if (newGreeting !== currentGreeting) {
  //       setCurrentGreeting(newGreeting);
  //       setShowWelcome(true); // Show welcome again for the new greeting
  //     }
  //   }, 60 * 1000); // Check every minute
  //   return () => clearInterval(interval);
  // }, [currentGreeting]);

  // Fetch classes for today
  useEffect(() => {
    setLoading(true);
    fetch('/api/faculty/classes')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch classes');
        return res.json();
      })
      .then(async data => {
        console.log('Raw Classes API Data:', data);
        const mapped = data.map((cls: any) => ({
          id: cls.id,
          subject: { id: cls.subjectId, name: cls.name, code: cls.code },
          course: { name: cls.course },
          semester: cls.semester,
          studentCount: cls.studentCount,
          startTime: cls.startTime,
          endTime: cls.endTime,
          room: cls.room
        }))
        setClasses(mapped);
        setError('');
        // Fetch attendance for each class for today
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const attendanceResults = await Promise.all(
          data.map(async (cls: any) => {
            const res = await fetch(`/api/faculty/attendance/subject?subjectId=${cls.subjectId}&date=${todayStr}`);
            if (!res.ok) return null;
            const att = await res.json();
            return {
              id: cls.id,
              course: `${cls.code} - ${cls.name}`,
              totalStudents: att.totalStudents ?? 0,
              presentStudents: att.presentStudents ?? 0,
              date: todayStr
            };
          })
        );
        setAttendance(attendanceResults.filter(Boolean));
      })
      .catch(err => {
        setError('Could not load classes.');
        setClasses([]);
        setAttendance([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch recent assignments
  useEffect(() => {
    fetch('/api/faculty/assignments')
      .then(res => res.json())
      .then(data => setAssignments(data))
      .catch(err => console.error('Error fetching assignments:', err));
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/faculty/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Welcome Message (replaced existing) */}
      {session?.user?.name && session?.user?.role && (
        <Card className="bg-white shadow-lg p-6 mb-8">
          <CardTitle className="text-3xl font-bold text-indigo-700 mb-2">
            Welcome, {session.user.name}!
          </CardTitle>
          <CardDescription className="text-gray-600">
            You are logged in as {session.user.role.toLowerCase()}. We wish you a productive day!
          </CardDescription>
        </Card>
      )}

      <div className={`transition-opacity duration-1000 opacity-100`}> {/* Always visible now */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-white rounded-3xl shadow-2xl border border-blue-100 transform transition-all duration-300 ease-in-out hover:shadow-3xl">
          <div className="col-span-1 md:col-span-2 flex justify-between items-center mb-4">
            <h2 className="text-4xl font-extrabold text-blue-800 tracking-tight leading-tight">Faculty Dashboard</h2>
            <span className="text-lg font-medium text-gray-600">{format(new Date(), 'EEEE, MMM d, yyyy')}</span>
          </div>
          <div className="col-span-1 md:col-span-2">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-lg animate-pulse">Loading classes...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-600 text-lg font-medium">{error}</div>
            ) : (
              <ClassCard courses={classes} />
            )}
          </div>
          <div className="col-span-1 md:col-span-2">
            <AttendanceOverview attendance={attendance} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center h-full border border-pink-200">
              <h3 className="text-xl font-semibold text-pink-700 mb-4 flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-pink-600" />
                Recent Assignments
              </h3>
              {assignments.length > 0 ? (
                <ul className="list-none p-0 m-0 text-gray-700 w-full">
                  {assignments.slice(0, 5).map((assignment: any) => (
                    <li key={assignment.id} className="flex justify-between items-center py-2 px-4 bg-white rounded-lg shadow-sm mb-2 hover:shadow-md transition-shadow duration-200 border border-gray-200">
                      <span className="font-medium text-blue-700">{assignment.title}</span>
                      <span className="text-sm text-gray-500">Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-base italic">No recent assignments found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 