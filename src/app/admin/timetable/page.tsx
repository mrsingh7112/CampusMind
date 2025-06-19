'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaChalkboardTeacher, FaFlask, FaTools, FaUserTie, FaVideo, FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';
import TimetableGrid from '@/components/admin/TimetableGrid';
import EditSlotModal from '@/components/admin/EditSlotModal';
import AIAssistantPanel from '@/components/admin/AIAssistantPanel';

interface Course {
  id: number;
  name: string;
  code: string;
}

const blockColors: Record<string, string> = {
  A: 'bg-blue-100 border-blue-400',
  B: 'bg-green-100 border-green-400',
  C: 'bg-yellow-100 border-yellow-400',
  VIRTUAL: 'bg-purple-100 border-purple-400',
};
const typeIcons: Record<string, JSX.Element> = {
  LECTURE: <FaChalkboardTeacher className="text-blue-600 text-2xl" />,
  LAB: <FaFlask className="text-green-600 text-2xl" />,
  WORKSHOP: <FaTools className="text-yellow-600 text-2xl" />,
  FACULTY: <FaUserTie className="text-gray-600 text-2xl" />,
  VIRTUAL: <FaVideo className="text-purple-600 text-2xl" />,
};

// Helper to format time in 12-hour format
function formatTime(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

export default function AdminTimetablePage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTimetables, setGeneratedTimetables] = useState<any[]>([]);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState<any | null>(null);
  const [allTimetables, setAllTimetables] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSlots, setEditedSlots] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt'|'course'|'semester'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('desc');
  const [newlyCreatedIds, setNewlyCreatedIds] = useState<number[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<{ day: number; startTime: string } | null>(null);
  const [aiFeedback, setAIFeedback] = useState<string>('');

  useEffect(() => {
    fetchCourses();
    fetchAllTimetables();
    if (editModalOpen) return; // Pause polling while editing
    const interval = setInterval(() => {
      fetchAllTimetables();
    }, 5000); // every 5 seconds
    return () => clearInterval(interval);
  }, [editModalOpen]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchAllTimetables = async () => {
    try {
      const response = await fetch('/api/admin/timetable');
      const data = await response.json();
      setAllTimetables(data);
    } catch (error) {
      setAllTimetables([]);
    }
  };

  const handleGenerateTimetable = async () => {
    if (!selectedCourse || !selectedSemester) {
      toast.error('Please select both course and semester');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/timetable/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourse, semester: selectedSemester }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate timetable');
      }

      if (data.timetable) {
        setSelectedTimetable(data.timetable);
        setShowTimetableModal(true);
        setAllTimetables(prev => [data.timetable, ...prev.filter(tt => !(tt.course.id === data.timetable.course.id && tt.semester === data.timetable.semester))]);
        toast.success('Timetable generated successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Timetable generation error:', err);
      setError(err.message || 'Failed to generate timetable');
      toast.error(err.message || 'Failed to generate timetable');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredAndSortedTimetables = allTimetables
    .filter(tt => {
      // Only filter by search term, not by selectedCourse/selectedSemester
      const term = searchTerm.toLowerCase();
      return (
        tt.course.name.toLowerCase().includes(term) ||
        tt.course.code.toLowerCase().includes(term) ||
        String(tt.semester).includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'createdAt') {
        return sortOrder === 'desc' ? b.slots[0]?.id - a.slots[0]?.id : a.slots[0]?.id - b.slots[0]?.id;
      } else if (sortBy === 'course') {
        return sortOrder === 'desc'
          ? b.course.name.localeCompare(a.course.name)
          : a.course.name.localeCompare(b.course.name);
      } else {
        return sortOrder === 'desc' ? b.semester - a.semester : a.semester - b.semester;
      }
    });

  // PDF export helper
  const handleDownloadPDF = (tt: any) => {
    const doc = new jsPDF();
    doc.text(`Timetable: ${tt.course.name} (Semester ${tt.semester})`, 10, 10);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const timeSlots = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '13:00', end: '14:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
    ];
    const grid: Record<number, Record<string, any>> = {};
    tt.slots.forEach((slot: any) => {
      if (!grid[slot.dayOfWeek]) grid[slot.dayOfWeek] = {};
      grid[slot.dayOfWeek][slot.startTime] = slot;
    });
    const tableBody = timeSlots.map(ts => [
      `${formatTime(ts.start)} - ${formatTime(ts.end)}`,
      ...days.map((_, dIdx) => {
        const slot = grid[dIdx+1]?.[ts.start];
        return slot
          ? `${slot.subject?.name}\n${slot.faculty?.name}\nRoom: ${slot.room?.name}`
          : '';
      })
    ]);
    autoTable(doc, {
      head: [["Time", ...days]],
      body: tableBody,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    doc.save(`Timetable_${tt.course.name}_Sem${tt.semester}.pdf`);
  };

  const handleEditTimetable = (tt: any) => {
    setSelectedTimetable(tt);
    setEditedSlots([...tt.slots]);
    setIsEditing(true);
    setShowTimetableModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTimetable) return;
    try {
      const response = await fetch(`/api/admin/timetable/${selectedTimetable.course.id}/${selectedTimetable.semester}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: editedSlots }),
      });
      if (response.ok) {
        toast.success('Timetable updated successfully!');
        fetchAllTimetables();
        setIsEditing(false);
        setShowTimetableModal(false);
      } else {
        toast.error('Failed to update timetable.');
      }
    } catch (error) {
      toast.error('Error updating timetable.');
    }
  };

  // Helper to build slots for TimetableGrid
  const buildGridSlots = (tt: any) => {
    const days = [1, 2, 3, 4, 5];
    const timeSlots = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '13:00', end: '14:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
    ];
    const grid: Record<number, Record<string, any>> = {};
    days.forEach(day => {
      grid[day] = {};
      timeSlots.forEach(ts => {
        grid[day][ts.start] = { dayOfWeek: day, startTime: ts.start, endTime: ts.end, isFree: true };
      });
    });
    if (tt && tt.slots) {
      tt.slots.forEach((slot: any) => {
        grid[slot.dayOfWeek][slot.startTime] = {
          ...slot,
          isLunch: false,
          isFree: false,
        };
      });
    }
    // Mark lunch slots
    if (tt && tt.lunchSlots) {
      Object.entries(tt.lunchSlots).forEach(([day, slotIdx]) => {
        const ts = timeSlots[Number(slotIdx)];
        if (ts) grid[Number(day)][ts.start] = { dayOfWeek: Number(day), startTime: ts.start, endTime: ts.end, isLunch: true };
      });
    }
    return grid;
  };

  // Handler for editing a slot
  const handleEditSlot = (day: number, startTime: string) => {
    setEditSlot({ day, startTime });
    setEditModalOpen(true);
    setAIFeedback('AI will provide feedback here about conflicts, availability, and suggestions.');
  };

  // Handler for saving slot edits
  const handleSaveSlot = async (data: any) => {
    try {
      // Get courseId and semester from the current timetable
      const tt = allTimetables[0];
      if (!tt) return;
      const payload = { ...data, courseId: tt.course.id, semester: tt.semester };
      const res = await fetch('/api/admin/timetable/edit-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || 'Timetable updated!');
        fetchAllTimetables(); // Refresh timetable in real time
        setEditModalOpen(false); // Only close modal on success
      } else {
        toast.error(result.message || 'Failed to update timetable.');
        // Do NOT close modal on error
      }
    } catch (err) {
      toast.error('Failed to update timetable.');
      // Do NOT close modal on error
    }
  };

  // Helper to get available subjects, faculty, and rooms for the current timetable
  const getEditModalData = () => {
    if (!allTimetables.length || !editSlot) return { subjects: [], faculty: [], rooms: [], current: {} };
    const tt = allTimetables[0]; // For demo, use the first timetable
    // Subjects for this course/semester
    const subjects = tt.slots ? Array.from(new Set(tt.slots.map((s: any) => s.subject))) : [];
    // Faculty for this course/semester
    const faculty = tt.slots ? Array.from(new Set(tt.slots.map((s: any) => s.faculty))) : [];
    // Rooms for this course/semester
    const rooms = tt.slots ? Array.from(new Set(tt.slots.map((s: any) => s.room))) : [];
    // Find the current slot assignment
    const currentSlot = tt.slots?.find((s: any) => s.dayOfWeek === editSlot.day && s.startTime === editSlot.startTime) || {};
    return { subjects, faculty, rooms, current: {
      id: currentSlot.id, // Pass slot id for editing
      subject: currentSlot.subject,
      faculty: currentSlot.faculty,
      room: currentSlot.room,
    }};
  };

  const handleDeleteAllTimetables = async () => {
    if (!confirm('Are you sure you want to delete ALL timetables? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch('/api/admin/timetable?deleteAll=true', {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('All timetables deleted successfully');
        fetchAllTimetables(); // Refresh the list
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete timetables');
      }
    } catch (error) {
      console.error('Error deleting timetables:', error);
      toast.error('Failed to delete timetables');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Timetable Management</h1>
        <button
          onClick={handleDeleteAllTimetables}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
        >
          Delete All Timetables
        </button>
      </div>
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Timetable Generation</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(parseInt(e.target.value))}
            className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 w-full md:w-auto"
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
            className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 w-full md:w-auto"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerateTimetable}
            disabled={!selectedCourse || isGenerating}
            className={`px-6 py-2 rounded text-white font-semibold transition-colors ${!selectedCourse || isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isGenerating ? 'Generating...' : 'Generate Timetable'}
          </button>
        </div>
      </div>
      {/* Search and Sort Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by course, code, or semester..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-2 w-full md:w-64 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="border rounded px-2 py-1"
          >
            <option value="createdAt">Last Created</option>
            <option value="course">Course Name</option>
            <option value="semester">Semester</option>
          </select>
          <button
            className="ml-2"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </button>
        </div>
      </div>
      {/* All Generated Timetables List */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">All Generated Timetables</h2>
        {/* Show the first timetable as a demo for editing */}
        {allTimetables.length > 0 && (
          <div className="mb-8">
            <TimetableGrid
              days={["Mon", "Tue", "Wed", "Thu", "Fri"]}
              timeSlots={[
                { start: '09:00', end: '10:00' },
                { start: '10:00', end: '11:00' },
                { start: '11:00', end: '12:00' },
                { start: '13:00', end: '14:00' },
                { start: '14:00', end: '15:00' },
                { start: '15:00', end: '16:00' },
              ]}
              slots={buildGridSlots(allTimetables[0])}
              onEditSlot={handleEditSlot}
            />
          </div>
        )}
        {Array.isArray(filteredAndSortedTimetables) && filteredAndSortedTimetables.length === 0 ? (
          <div className="text-red-500 font-semibold">No timetables generated for the selected course. This may be due to faculty conflicts or missing assignments.</div>
        ) : Array.isArray(filteredAndSortedTimetables) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTimetables.map((tt, idx) => (
              <div key={idx} className={`bg-white border rounded-xl shadow-lg p-5 flex flex-col gap-2 relative transition-transform hover:scale-[1.02] ${newlyCreatedIds.includes(tt.course.id * 100 + tt.semester) ? 'ring-2 ring-green-400' : ''}`}>
                {newlyCreatedIds.includes(tt.course.id * 100 + tt.semester) && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">New</span>
                )}
                <div className="font-semibold text-blue-700 text-lg">{tt.course.name} ({tt.course.code})</div>
                <div>Semester: <span className="font-semibold">{tt.semester}</span></div>
                <div>Total Slots: {tt.slots.length}</div>
                {tt.slots.length < 18 && (
                  <div className="text-orange-600 font-semibold">Warning: Only {tt.slots.length}/18 slots filled. Faculty or room conflicts may exist.</div>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    onClick={() => { setSelectedTimetable(tt); setShowTimetableModal(true); }}
                  >
                    View
                  </button>
                  <button
                    className="px-4 py-1 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-600"
                    onClick={() => handleDownloadPDF(tt)}
                  >
                    Download PDF
                  </button>
                  <button
                    className="px-4 py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
                    onClick={() => handleEditTimetable(tt)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-red-500">Failed to load timetables.</div>
        )}
      </div>
      {/* Timetable Modal */}
      {showTimetableModal && selectedTimetable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl w-full relative animate-fadeIn overflow-y-auto max-h-[90vh]">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl" onClick={() => setShowTimetableModal(false)}>&times;</button>
            <h3 className="text-2xl font-bold mb-4">Timetable</h3>
            
            {/* Show shortages if any */}
            {selectedTimetable.shortages && selectedTimetable.shortages.length > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Auto-Created Resources:</h4>
                <ul className="list-disc list-inside text-yellow-700">
                  {selectedTimetable.shortages.map((shortage: any, idx: number) => (
                    <li key={idx}>{shortage.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timetable Grid */}
            {selectedTimetable.slots && selectedTimetable.slots.length > 0 ? (
              (() => {
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                const timeSlots = [
                  { start: '09:00', end: '10:00' },
                  { start: '10:00', end: '11:00' },
                  { start: '11:00', end: '12:00' },
                  { start: '13:00', end: '14:00' },
                  { start: '14:00', end: '15:00' },
                  { start: '15:00', end: '16:00' },
                ];
                const lunchIdx = 3; // Always 12:00-13:00 as lunch
                const grid: Record<number, Record<string, any>> = {};
                selectedTimetable.slots.forEach((slot: any) => {
                  if (!grid[slot.dayOfWeek]) grid[slot.dayOfWeek] = {};
                  grid[slot.dayOfWeek][slot.startTime] = slot;
                });
                return (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr>
                          <th className="border border-gray-200 p-2">Time</th>
                          {days.map((day, idx) => (
                            <th key={idx} className="border border-gray-200 p-2">{day}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map((ts, tsIdx) => (
                          <tr key={tsIdx}>
                            <td className="border border-gray-200 p-2">{formatTime(ts.start)} - {formatTime(ts.end)}</td>
                            {days.map((_, dIdx) => {
                              if (tsIdx === lunchIdx) {
                                return (
                                  <td key={dIdx} className="border border-gray-200 p-2 bg-orange-100 text-orange-700 font-semibold text-center">Lunch Break</td>
                                );
                              }
                              const slot = grid[dIdx+1]?.[ts.start];
                              return (
                                <td key={dIdx} className="border border-gray-200 p-2">
                                  {slot ? (
                                    <div>
                                      <div className="font-semibold">{slot.subject?.name}</div>
                                      <div>{slot.faculty?.name}</div>
                                      <div>Room: {slot.room?.name}</div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-400">—</div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()
            ) : (
              <div className="text-gray-500">No slots available.</div>
            )}
            {isEditing && (
              <div className="mt-4 flex justify-end">
                <button
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Edit Slot Modal */}
      <EditSlotModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveSlot}
        {...getEditModalData()}
        aiFeedback={aiFeedback}
        day={editSlot?.day}
        startTime={editSlot?.startTime}
      />
    </div>
  );
} 