'use client';

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Trash2, Search, Calendar, Landmark, BookOpen, GraduationCap, Clock, FileText, BellRing, Download, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const EXAM_TYPES = [
  { label: 'Midterm', value: 'midterm', duration: 1.5 },
  { label: 'Final', value: 'final', duration: 3 },
];

const UNIVERSITY_START = 9; // 9 AM
const UNIVERSITY_END = 16; // 4 PM

interface Department {
  id: number;
  name: string;
  courses: Course[];
}

interface Course {
  id: number;
  name: string;
  code: string;
  subjects: Subject[];
  _count?: { students: number }; // Added for student count
}

interface Subject {
  id: number;
  name: string;
  code: string;
  semester: number;
}

interface GeneratedDatesheet {
  id: string;
  departmentId: number;
  departmentName: string;
  courseId: number;
  courseName: string;
  semester: number;
  examType: string;
  subjects: {
    subject: string;
    date: string;
    slot: string;
  }[];
  generatedAt: string;
  courseStudentCount?: number;
  pdfFile?: string;
}

function generateTimeSlots(examType: string) {
  const duration = EXAM_TYPES.find(type => type.value === examType)?.duration || 1.5;
  let slots = [];
  let current = UNIVERSITY_START;
  while (current + duration <= UNIVERSITY_END) {
    const startHour = Math.floor(current);
    const startMin = (current % 1) * 60;
    const end = current + duration;
    const endHour = Math.floor(end);
    const endMin = (end % 1) * 60;
    slots.push({
      start: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
      end: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
    });
    current += duration;
  }
  return slots;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

function generateDatesheet(subjects: Subject[], examType: string, existingDatesheets: GeneratedDatesheet[], courseId?: number, courseStudentCount?: number) {
  const slots = generateTimeSlots(examType);
  let datesheet: { subject: string; date: string; slot: string }[] = [];
  let date = new Date();
  let subjectIdx = 0;

  // Helper to count students scheduled for a given date
  function studentsScheduledOn(dateStr: string) {
    let total = 0;
    for (const ds of existingDatesheets) {
      // Only consider datesheets for other courses/departments for scheduling conflicts
      if (ds.courseId !== courseId) {
        for (const s of ds.subjects) {
          if (s.date === dateStr) {
            total += (ds as any).courseStudentCount || 0; // Assuming courseStudentCount is available
          }
        }
      }
    }
    return total;
  }

  // Ensure we start from a fresh date, at least tomorrow if today is used
  date.setDate(date.getDate() + 1);

  while (subjectIdx < subjects.length) {
    if (isWeekend(date)) {
      date.setDate(date.getDate() + 1);
      continue;
    }

    // Random holiday: 25% chance to skip a day (except before the first subject)
    if (subjectIdx > 0 && Math.random() < 0.25) {
      date.setDate(date.getDate() + 1);
      continue;
    }

    // Only one subject per day per slot for this course/semester to simplify
    let selectedSlot = null;
    const dateStr = date.toISOString().slice(0, 10);

    for (const slot of slots) {
      const isSlotUsed = existingDatesheets.some(ds =>
        ds.subjects.some(s => s.date === dateStr && s.slot === `${slot.start} - ${slot.end}`)
      );
      const studentsToday = studentsScheduledOn(dateStr);

      // Max capacity for exam hall, e.g., 400 students total per day per slot
      if (!isSlotUsed && (studentsToday + (courseStudentCount || 0)) <= 400) {
        selectedSlot = slot;
        break;
      }
    }

    if (selectedSlot) {
      datesheet.push({
        subject: subjects[subjectIdx].name,
        date: dateStr,
        slot: `${selectedSlot.start} - ${selectedSlot.end}`,
      });
      subjectIdx++;
    } else {
      // If no slot found for current date, move to next day
      date.setDate(date.getDate() + 1);
      continue; // Try again with the new date
    }
    date.setDate(date.getDate() + 1);
  }
  return datesheet;
}

function formatDateWithDay(dateStr: string) {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
  return `${date.toLocaleDateString(undefined, options)} (${dayName})`;
}

function isWeekendDateString(dateStr: string) {
  const date = new Date(dateStr);
  return isWeekend(date);
}

// Helper to upload PDF and get URL
async function uploadPDF(pdfBlob: Blob, fileName: string): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', pdfBlob, fileName);
  try {
    const response = await fetch('/api/admin/datesheets/upload', {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      return data.url;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload PDF');
    }
  } catch (error) {
    console.error('Error uploading PDF:', error);
    toast({
      title: "Upload Failed",
      description: (error as Error).message || "Could not upload PDF file.",
      variant: "destructive",
    });
    return null;
  }
}

// Helper to get the last exam date from a datesheet
function getLastExamDate(ds: GeneratedDatesheet) {
  if (!ds.subjects || ds.subjects.length === 0) return null;
  return ds.subjects.reduce((max, s) => (s.date > max ? s.date : max), ds.subjects[0].date);
}

export default function ExaminationPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [examType, setExamType] = useState('midterm');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [datesheet, setDatesheet] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedDatesheets, setGeneratedDatesheets] = useState<GeneratedDatesheet[]>([]);
  const [selectedDatesheet, setSelectedDatesheet] = useState<GeneratedDatesheet | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; datesheet: GeneratedDatesheet | null }>({ open: false, datesheet: null });
  const [editSubjects, setEditSubjects] = useState<any[]>([]);
  const [editError, setEditError] = useState('');
  const [announceLoading, setAnnounceLoading] = useState(false);

  useEffect(() => {
    fetchData();
    fetchDatesheets();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/examination');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setDepartments(data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch departments and courses data.",
        variant: "destructive",
      });
    }
  };

  const fetchDatesheets = async () => {
    try {
      const response = await fetch('/api/admin/datesheets');
      if (!response.ok) throw new Error('Failed to fetch datesheets');
      const data = await response.json();
      setGeneratedDatesheets(data);
    } catch (error: any) {
      console.error('Error fetching datesheets:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch generated datesheets.",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    if (!selectedDepartment || !selectedCourse || !selectedSemester) {
      toast({
        title: "Missing Information",
        description: "Please select department, course, and semester to generate a datesheet.",
        variant: "destructive",
      });
      return;
    }

    const department = departments.find(d => d.id === parseInt(selectedDepartment));
    const course = department?.courses.find(c => c.id === parseInt(selectedCourse));
    const subjects = course?.subjects.filter(s => s.semester === parseInt(selectedSemester)) || [];

    if (subjects.length === 0) {
      toast({
        title: "No Subjects Found",
        description: "No subjects found for the selected semester in this course. Cannot generate datesheet.",
        variant: "destructive",
      });
      return;
    }

    // Prevent duplicate datesheet generation for the exact same criteria
    const alreadyExists = generatedDatesheets.some(ds =>
      ds.departmentId === parseInt(selectedDepartment) &&
      ds.courseId === parseInt(selectedCourse) &&
      ds.semester === parseInt(selectedSemester) &&
      ds.examType === examType
    );
    if (alreadyExists) {
      toast({
        title: "Datesheet Already Exists",
        description: "A datesheet for this course, semester, and exam type has already been generated.",
        variant: "warning",
      });
      return;
    }

    // For demo, use actual student count if available, otherwise default to 100
    const courseStudentCount = course?._count?.students || 100;

    setLoading(true);
    try {
      const newDatesheetSubjects = generateDatesheet(subjects, examType, generatedDatesheets, course?.id, courseStudentCount);

      if (newDatesheetSubjects.length === 0) {
        toast({
          title: "Generation Failed",
          description: "Could not generate a valid datesheet with the current constraints. Try adjusting dates or settings.",
          variant: "destructive",
        });
        return;
      }

      // Generate PDF as Blob
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Examination Datesheet', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Department: ${department?.name || ''}`, 20, 30);
      doc.text(`Course: ${course?.name || ''}`, 20, 40);
      doc.text(`Semester: ${selectedSemester}`, 20, 50);
      doc.text(`Exam Type: ${examType}`, 20, 60);
      const tableData = newDatesheetSubjects.map(subject => [
        subject.subject,
        formatDateWithDay(subject.date),
        subject.slot
      ]);
      autoTable(doc, {
        startY: 70,
        head: [['Subject', 'Date', 'Time Slot']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [60, 100, 200] },
      });

      const pdfBlob = doc.output('blob');
      const fileName = `Datesheet_${course?.code}_Sem${selectedSemester}_${examType}.pdf`;
      const pdfUrl = await uploadPDF(pdfBlob, fileName);

      const response = await fetch('/api/admin/datesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: department?.id,
          departmentName: department?.name,
          courseId: course?.id,
          semester: parseInt(selectedSemester),
          examType,
          subjects: newDatesheetSubjects,
          pdfFile: pdfUrl,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save datesheet');
      }
      const saved = await response.json();
      setGeneratedDatesheets(prev => [saved, ...prev]);
      setDatesheet(newDatesheetSubjects);
      toast({
        title: "Datesheet Generated",
        description: "The examination datesheet has been successfully generated and saved.",
        variant: "success",
      });
    } catch (err: any) {
      console.error("Error generating datesheet:", err);
      toast({
        title: "Generation Failed",
        description: err.message || 'Failed to generate or save datesheet.',
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const downloadPDF = (datesheet: GeneratedDatesheet) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Examination Datesheet', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Department: ${datesheet.departmentName}`, 20, 30);
    doc.text(`Course: ${datesheet.courseName}`, 20, 40);
    doc.text(`Semester: ${datesheet.semester}`, 20, 50);
    doc.text(`Exam Type: ${datesheet.examType}`, 20, 60);
    const tableData = datesheet.subjects.map(subject => [
      subject.subject,
      formatDateWithDay(subject.date),
      subject.slot
    ]);
    autoTable(doc, {
      startY: 70,
      head: [['Subject', 'Date', 'Time Slot']],
      body: tableData,
    });
    doc.save(`datesheet_${datesheet.departmentName}_${datesheet.courseName}_${datesheet.semester}.pdf`);
    toast({
      title: "PDF Downloaded",
      description: "The datesheet PDF has been downloaded.",
    });
  };

  const openEditModal = (datesheet: GeneratedDatesheet) => {
    setEditSubjects(datesheet.subjects.map(s => ({ ...s })));
    setEditModal({ open: true, datesheet });
    setEditError('');
  };

  const closeEditModal = () => {
    setEditModal({ open: false, datesheet: null });
    setEditSubjects([]);
    setEditError('');
  };

  const handleEditSubjectChange = (idx: number, field: string, value: string) => {
    setEditSubjects(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleSaveEdit = async () => {
    if (!editModal.datesheet) return;
    // Validation: unique dates, unique slots, no weekends
    const dates = editSubjects.map(s => s.date);
    const slots = editSubjects.map(s => s.slot);
    const hasDuplicateDates = new Set(dates).size !== dates.length;
    const hasDuplicateSlots = new Set(slots.map((slot, i) => slot + dates[i])).size !== slots.length;
    const hasWeekend = editSubjects.some(s => isWeekendDateString(s.date));
    if (hasDuplicateDates) {
      setEditError('Each subject must be on a unique date.');
      toast({
        title: "Validation Error",
        description: "Each subject must be on a unique date.",
        variant: "destructive",
      });
      return;
    }
    if (hasDuplicateSlots) {
      setEditError('No two subjects can have the same slot on the same day.');
      toast({
        title: "Validation Error",
        description: "No two subjects can have the same slot on the same day.",
        variant: "destructive",
      });
      return;
    }
    if (hasWeekend) {
      setEditError('Exams cannot be scheduled on weekends.');
      toast({
        title: "Validation Error",
        description: "Exams cannot be scheduled on weekends.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/datesheets/${editModal.datesheet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: editSubjects }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update datesheet.');
      }
      // Update the datesheet in the list
      setGeneratedDatesheets(prev => prev.map(ds =>
        ds.id === editModal.datesheet?.id ? { ...ds, subjects: editSubjects } : ds
      ));
      toast({
        title: "Datesheet Updated",
        description: "The datesheet has been successfully updated.",
        variant: "success",
      });
      closeEditModal();
    } catch (err: any) {
      console.error("Error saving datesheet edit:", err);
      toast({
        title: "Update Failed",
        description: err.message || "Failed to save datesheet changes.",
        variant: "destructive",
      });
      setEditError(err.message || "Failed to save changes.");
    }
  };

  // Simulate fetching students and faculty for a course/semester
  type Recipient = { name: string; role: 'Student' | 'Faculty'; email: string };
  function getRecipientsForDatesheet(ds: GeneratedDatesheet): Recipient[] {
    // In real app, fetch from DB. Here, simulate with 2 students and 1 faculty per course/semester
    return [
      { name: `Student A (${ds.courseName})`, role: 'Student', email: 'studenta@example.com' },
      { name: `Student B (${ds.courseName})`, role: 'Student', email: 'studentb@example.com' },
      { name: `Faculty (${ds.courseName})`, role: 'Faculty', email: 'faculty@example.com' },
    ];
  }

  function getAnnouncementMessage(recipient: Recipient, ds: GeneratedDatesheet) {
    return `Dear ${recipient.name},\n\nPlease find attached the examination datesheet for your ${ds.departmentName} - ${ds.courseName} (Semester ${ds.semester}, ${ds.examType} exam).\n\nExam Rules:\n- Arrive 15 minutes before the exam.\n- Carry your ID card.\n- No electronic devices allowed.\n- Follow all university guidelines.\n\nBest of luck!\n\nRegards,\nExamination Cell`;
  }

  const handleAnnounceAll = async () => {
    setAnnounceLoading(true);
    try {
      const response = await fetch('/api/admin/announcements/send-datesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datesheets: generatedDatesheets }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast({
          title: "Announcements Sent",
          description: `Announcements sent successfully to ${data.count} recipients!`, 
          variant: "success",
        });
      } else {
        toast({
          title: "Announcement Failed",
          description: data.error || 'Failed to send announcements.',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error sending announcements:', error);
      toast({
        title: "Announcement Failed",
        description: error.message || "An unexpected error occurred while sending announcements.",
        variant: "destructive",
      });
    } finally {
      setAnnounceLoading(false);
    }
  };

  const semesterOptions = Array.from({ length: 8 }, (_, i) => i + 1);

  const getCourseOptions = () => {
    const department = departments.find(d => d.id === parseInt(selectedDepartment));
    return department ? department.courses : [];
  };

  const getSubjectOptions = () => {
    const department = departments.find(d => d.id === parseInt(selectedDepartment));
    const course = department?.courses.find(c => c.id === parseInt(selectedCourse));
    return course?.subjects.filter(s => s.semester === parseInt(selectedSemester)) || [];
  };

  const hasGeneratedDatesheets = generatedDatesheets && generatedDatesheets.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-indigo-600" /> Examination Datesheet Management
        </h1>

        {/* Datesheet Generation Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <PlusCircle className="w-6 h-6" /> Generate New Datesheet
            </CardTitle>
            <CardDescription>Select department, course, semester, and exam type to generate a new examination datesheet.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger id="department" className="w-full">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700">Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={!selectedDepartment}>
                  <SelectTrigger id="course" className="w-full">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCourseOptions().map(course => (
                      <SelectItem key={course.id} value={String(course.id)}>{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester} disabled={!selectedCourse}>
                  <SelectTrigger id="semester" className="w-full">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterOptions.map(sem => (
                      <SelectItem key={sem} value={String(sem)}>{sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="exam-type" className="block text-sm font-medium text-gray-700">Exam Type</label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger id="exam-type" className="w-full">
                    <SelectValue placeholder="Select Exam Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading || !selectedDepartment || !selectedCourse || !selectedSemester}
              className="mt-6 w-full flex items-center gap-2"
            >
              {loading ? 'Generating...' : <><Calendar className="w-4 h-4" /> Generate Datesheet</>}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Datesheet Preview */}
        {datesheet.length > 0 && (
          <Card className="shadow-lg border-l-4 border-indigo-500">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
                <FileText className="w-6 h-6" /> Newly Generated Datesheet
              </CardTitle>
              <CardDescription>Preview of the datesheet for {EXAM_TYPES.find(type => type.value === examType)?.label} exams.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader className="bg-indigo-50">
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time Slot</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datesheet.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.subject}</TableCell>
                        <TableCell>{formatDateWithDay(item.date)}</TableCell>
                        <TableCell>{item.slot}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Datesheets */}
        <Card className="shadow-lg">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6" /> Existing Datesheets
            </CardTitle>
            <Button onClick={handleAnnounceAll} disabled={!hasGeneratedDatesheets || announceLoading} className="flex items-center gap-2">
              {announceLoading ? 'Announcing...' : <><BellRing className="w-4 h-4" /> Announce All Datesheets</>}
            </Button>
          </CardHeader>
          <CardContent>
            {!hasGeneratedDatesheets ? (
              <div className="text-center py-8 text-gray-500">
                No datesheets have been generated yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead className="text-center">Semester</TableHead>
                      <TableHead className="text-center">Exam Type</TableHead>
                      <TableHead className="text-center"># Subjects</TableHead>
                      <TableHead className="text-center">Last Exam Date</TableHead>
                      <TableHead className="text-center w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedDatesheets.map((ds) => (
                      <TableRow key={ds.id}>
                        <TableCell>{ds.departmentName}</TableCell>
                        <TableCell>{ds.courseName}</TableCell>
                        <TableCell className="text-center">{ds.semester}</TableCell>
                        <TableCell className="text-center"><span className="capitalize">{ds.examType}</span></TableCell>
                        <TableCell className="text-center">{ds.subjects.length}</TableCell>
                        <TableCell className="text-center">
                          {getLastExamDate(ds) ? formatDateWithDay(getLastExamDate(ds)!) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-center flex gap-2 justify-center">
                          {ds.pdfFile && (
                            <Button size="sm" variant="secondary" onClick={() => window.open(ds.pdfFile!, '_blank')} className="flex items-center gap-1">
                              <Download className="w-4 h-4" /> PDF
                            </Button>
                          )} 
                          {!ds.pdfFile && (
                            <Button size="sm" variant="outline" onClick={() => downloadPDF(ds)} className="flex items-center gap-1">
                              <Download className="w-4 h-4" /> Download PDF
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => openEditModal(ds)}>
                            <Edit className="w-4 h-4" /> Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" className="flex items-center gap-1">
                                <Trash2 className="w-4 h-4" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the datesheet.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/admin/datesheets/${ds.id}`, { method: 'DELETE' });
                                    if (!response.ok) {
                                      const errorData = await response.json();
                                      throw new Error(errorData.message || 'Failed to delete datesheet.');
                                    }
                                    toast({
                                      title: "Datesheet Deleted",
                                      description: "The datesheet has been successfully deleted.",
                                      variant: "success",
                                    });
                                    fetchDatesheets();
                                  } catch (error: any) {
                                    console.error("Error deleting datesheet:", error);
                                    toast({
                                      title: "Deletion Failed",
                                      description: error.message || "Failed to delete the datesheet.",
                                      variant: "destructive",
                                    });
                                  }
                                }}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Datesheet Modal */}
        <Dialog open={editModal.open} onOpenChange={closeEditModal}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Edit Datesheet for {editModal.datesheet?.courseName}</DialogTitle>
              <DialogDescription>
                Adjust subject dates and time slots for this datesheet.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {editError && <div className="text-red-500 text-sm mb-4">{editError}</div>}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editSubjects.map((subject, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{subject.subject}</TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={subject.date}
                          onChange={(e) => handleEditSubjectChange(idx, 'date', e.target.value)}
                          className="w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={subject.slot} onValueChange={(value) => handleEditSubjectChange(idx, 'slot', value)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Slot" />
                          </SelectTrigger>
                          <SelectContent>
                            {generateTimeSlots(editModal.datesheet?.examType || 'midterm').map((slot, sIdx) => (
                              <SelectItem key={sIdx} value={`${slot.start} - ${slot.end}`}>
                                {`${slot.start} - ${slot.end}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setEditSubjects(prev => prev.filter((_, i) => i !== idx))}>
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeEditModal}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 