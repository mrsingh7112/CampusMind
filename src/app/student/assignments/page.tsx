'use client'
import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import { format, parseISO } from 'date-fns'
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  subject: { name: string; code: string };
  faculty: { name: string };
  submissionStatus: 'SUBMITTED' | 'GRADED' | 'PENDING' | 'MISSED';
  submittedAt: string | null;
  grade: number | null;
  fileUrl: string | null;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssignments() {
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
        const res = await fetch(`/api/student/assignments`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch assignments');
        }

        const data: Assignment[] = await res.json();
        setAssignments(data);
      } catch (err: any) {
        console.error('Error fetching assignments:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, []);

  const upcomingAssignments = assignments.filter(assignment => 
    (assignment.submissionStatus === 'PENDING' || assignment.submissionStatus === 'MISSED') && 
    new Date(assignment.dueDate) >= new Date()
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const submittedAssignments = assignments.filter(assignment => 
    assignment.submissionStatus === 'SUBMITTED' || assignment.submissionStatus === 'GRADED'
  ).sort((a, b) => new Date(b.submittedAt || b.dueDate).getTime() - new Date(a.submittedAt || a.dueDate).getTime());

  const overdueAssignments = assignments.filter(assignment => 
    assignment.submissionStatus === 'PENDING' && new Date(assignment.dueDate) < new Date()
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const renderAssignmentCard = (assignment: Assignment) => {
    const dueDate = format(parseISO(assignment.dueDate), 'MMM d, yyyy hh:mm a');
    const submittedAt = assignment.submittedAt ? format(parseISO(assignment.submittedAt), 'MMM d, yyyy hh:mm a') : 'N/A';

    const statusColor = {
      PENDING: 'text-yellow-600',
      SUBMITTED: 'text-blue-600',
      GRADED: 'text-green-600',
      MISSED: 'text-red-600',
    };

    const statusIcon = {
      PENDING: <Clock className="w-5 h-5 text-yellow-500" />,
      SUBMITTED: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
      GRADED: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      MISSED: <XCircle className="w-5 h-5 text-red-500" />,
    };

    return (
      <div key={assignment.id} className="bg-white rounded-lg shadow-md p-5 border border-gray-200 transform transition-transform hover:scale-[1.01]">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" /> {assignment.title}
        </h3>
        <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Subject:</span> {assignment.subject?.code} - {assignment.subject?.name}</p>
        <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Faculty:</span> {assignment.faculty?.name || 'N/A'}</p>
        <p className="text-sm text-gray-600 mb-3"><span className="font-medium">Due Date:</span> {dueDate}</p>
        <p className="text-sm text-gray-700 mb-3">{assignment.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <span className={`font-semibold flex items-center gap-1 ${statusColor[assignment.submissionStatus]}`}>
            {statusIcon[assignment.submissionStatus]} Status: {assignment.submissionStatus}
          </span>
          {assignment.maxMarks && (
            <span className="text-gray-500">Max Marks: {assignment.maxMarks}</span>
          )}
        </div>
        {assignment.submissionStatus === 'GRADED' && (
          <p className="text-sm text-green-700 font-bold mt-2 text-right">Grade: {assignment.grade !== null ? assignment.grade : 'N/A'}</p>
        )}
        {assignment.fileUrl && (
          <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm mt-2 block text-right">
            View Submission File
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Your Assignments</h1>

      {loading ? (
        <div className="text-center text-gray-600 text-lg py-10">Loading assignments...</div>
      ) : error ? (
        <div className="text-center text-red-600 text-lg py-10 font-medium">Error: {error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Overdue Assignments */}
          {overdueAssignments.length > 0 && (
            <section className="bg-red-50 rounded-xl shadow-lg p-6 border border-red-200">
              <h2 className="text-2xl font-bold text-red-700 mb-5 flex items-center gap-3">
                <AlertCircle className="w-7 h-7" /> Overdue Assignments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {overdueAssignments.map(renderAssignmentCard)}
              </div>
            </section>
          )}

          {/* Upcoming Assignments */}
          <section className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-700 mb-5 flex items-center gap-3">
              <Clock className="w-7 h-7" /> Upcoming Assignments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingAssignments.length > 0 ? (
                upcomingAssignments.map(renderAssignmentCard)
              ) : (
                <div className="text-center text-gray-500 text-lg col-span-full py-4">No upcoming assignments.</div>
              )}
            </div>
          </section>

          {/* Submitted/Graded Assignments */}
          <section className="bg-green-50 rounded-xl shadow-lg p-6 border border-green-200">
            <h2 className="text-2xl font-bold text-green-700 mb-5 flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7" /> Submitted & Graded Assignments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {submittedAssignments.length > 0 ? (
                submittedAssignments.map(renderAssignmentCard)
              ) : (
                <div className="text-center text-gray-500 text-lg col-span-full py-4">No submitted assignments yet.</div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
} 