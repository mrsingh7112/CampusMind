'use client'
import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import { format, parseISO } from 'date-fns'
import { BarChart, BookOpen, Award } from 'lucide-react'

interface ResultRecord {
  id: string;
  grade: string;
  createdAt: string;
  subject: {
    name: string;
    code: string;
    semester: number;
  };
}

interface ResultsData {
  results: ResultRecord[];
  gpa: string;
}

export default function ResultsPage() {
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [availableSemesters, setAvailableSemesters] = useState<number[]>([]);

  useEffect(() => {
    async function fetchResults() {
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
        const queryString = selectedSemester ? `?semester=${selectedSemester}` : '';
        const res = await fetch(`/api/student/results${queryString}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch results');
        }

        const data: ResultsData = await res.json();
        setResultsData(data);

        // Extract unique semesters for filter
        if (data.results.length > 0 && availableSemesters.length === 0) {
          const semesters = Array.from(new Set(data.results.map(r => r.subject.semester))).sort((a, b) => a - b);
          setAvailableSemesters(semesters);
          if (!selectedSemester && semesters.length > 0) {
            setSelectedSemester(semesters[semesters.length - 1].toString()); // Default to latest semester
          }
        }

      } catch (err: any) {
        console.error('Error fetching results:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [selectedSemester]);

  const handleSemesterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSemester(event.target.value);
  };

  const filteredResults = resultsData?.results.filter(result => 
    selectedSemester === '' || result.subject.semester.toString() === selectedSemester
  ) || [];

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Your Academic Results</h1>

      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="semester-select" className="text-lg font-medium text-gray-700">Select Semester:</label>
        <select
          id="semester-select"
          value={selectedSemester}
          onChange={handleSemesterChange}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">All Semesters</option>
          {availableSemesters.map(semester => (
            <option key={semester} value={semester.toString()}>
              Semester {semester}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-gray-600 text-lg py-10">Loading results...</div>
      ) : error ? (
        <div className="text-center text-red-600 text-lg py-10 font-medium">Error: {error}</div>
      ) : (resultsData && resultsData.results.length > 0) ? (
        <div className="grid grid-cols-1 gap-8">
          {/* GPA/Overall Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center justify-center gap-2">
              <Award className="w-7 h-7" /> Overall Performance
            </h2>
            <p className="text-6xl font-extrabold text-green-800">{resultsData.gpa}</p>
            <p className="text-lg text-gray-600">Cumulative GPA</p>
          </div>

          {/* Exam Results Table */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <h2 className="text-2xl font-bold text-purple-700 mb-6 flex items-center gap-2">
              <BookOpen className="w-7 h-7" /> Detailed Exam Results
            </h2>
            <div className="overflow-x-auto">
              {filteredResults.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResults.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.subject.semester}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {record.subject.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {record.subject.name}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                          parseFloat(record.grade) >= 7.0 ? 'text-green-600' : parseFloat(record.grade) >= 5.0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {record.grade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(parseISO(record.createdAt), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center text-gray-500 py-4">No results found for this semester.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">No results information available.</div>
      )}
    </div>
  );
} 