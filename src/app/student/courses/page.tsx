'use client'
import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import { BookOpen, GraduationCap, Building2, CreditCard } from 'lucide-react'

interface CourseDetail {
  id: number;
  name: string;
  code: string;
  totalSemesters: number;
  department: { name: string };
  subjects: SubjectDetail[];
}

interface SubjectDetail {
  id: number;
  name: string;
  code: string;
  semester: number;
  credits: number;
  type: string;
}

export default function CoursesPage() {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentSemester, setCurrentSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourseData() {
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
        const res = await fetch(`/api/student/courses`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch course data');
        }

        const data = await res.json();
        setCourse(data.course);
        setCurrentSemester(data.currentSemester);
      } catch (err: any) {
        console.error('Error fetching course data:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchCourseData();
  }, []);

  const filteredSubjects = course?.subjects.filter(
    (subject) => subject.semester === currentSemester
  ) || [];

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Your Enrolled Course</h1>

      {loading ? (
        <div className="text-center text-gray-600 text-lg py-10">Loading course data...</div>
      ) : error ? (
        <div className="text-center text-red-600 text-lg py-10 font-medium">Error: {error}</div>
      ) : course ? (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Course Details */}
            <div className="bg-blue-50 rounded-lg p-6 shadow-md border border-blue-200">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-7 h-7" /> Course Information
              </h2>
              <p className="text-lg text-gray-700 mb-2">
                <span className="font-semibold">Name:</span> {course.name} ({course.code})
              </p>
              <p className="text-lg text-gray-700 mb-2">
                <span className="font-semibold">Department:</span> {course.department?.name || 'N/A'}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Total Semesters:</span> {course.totalSemesters}
              </p>
            </div>

            {/* Subjects Overview */}
            <div className="bg-green-50 rounded-lg p-6 shadow-md border border-green-200">
              <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <GraduationCap className="w-7 h-7" /> Subjects Overview
              </h2>
              <p className="text-lg text-gray-700 mb-2">
                <span className="font-semibold">Total Subjects:</span> {course.subjects.length}
              </p>
              {currentSemester && (
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Subjects in Current Semester ({currentSemester}):</span> {
                    course.subjects.filter(s => s.semester === currentSemester).length
                  }
                </p>
              )}
            </div>
          </div>

          {/* Detailed Subjects List */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <h2 className="text-2xl font-bold text-purple-700 mb-6 flex items-center gap-2">
              <Building2 className="w-7 h-7" /> Subjects in Semester {currentSemester || 'N/A'}
            </h2>
            {filteredSubjects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubjects.map(subject => (
                      <tr key={subject.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {subject.semester}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {subject.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {subject.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex items-center gap-1">
                          <CreditCard className="w-4 h-4 text-gray-500" /> {subject.credits}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {subject.type}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">No subjects found for this semester.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">No course information available.</div>
      )}
    </div>
  );
} 