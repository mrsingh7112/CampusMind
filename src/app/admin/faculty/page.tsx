'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Edit2, Bell, Ban, Layers, Search, PlusCircle, Trash2, Mail, Users, BookOpen, UserCheck, UserX, Info, ListFilter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'

interface AssignedSubject {
  id: number;
  name: string;
  code: string;
  semester: number;
  course: { id: number; name: string; code: string; createdAt?: string; updatedAt?: string; status?: string; };
  assignedAt: string;
}

interface Faculty {
  id: string
  name: string
  email: string
  department: { id?: string; name: string; code?: string; createdAt?: string; updatedAt?: string; status?: string; }
  position: string
  employeeId: string
  status: string
  assignedCourses?: {
    course: {
      id: number
      name: string
      code: string
      createdAt?: string;
      updatedAt?: string;
      status?: string;
    }
  }[]
  assignedSubjects?: AssignedSubject[]
}

interface Course {
  id: number
  name: string
  code: string
  departmentId: number
  createdAt?: string;
  updatedAt?: string;
  status?: string;
}

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState('')
  const [showSubjectsModal, setShowSubjectsModal] = useState(false)
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [availableSubjects, setAvailableSubjects] = useState<AssignedSubject[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([])
  const [subjectsError, setSubjectsError] = useState('')
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const router = useRouter()

  // Fetch faculty data with courses
  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/faculty')
      if (!res.ok) throw new Error('Failed to fetch faculty data')
      const data = await res.json()
      setFaculty(data)
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching faculty:', err)
      setError('Failed to load faculty data')
      toast({
        title: "Error",
        description: err.message || "Failed to load faculty data.",
        variant: "destructive",
      });
      setLoading(false)
    }
  }

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      if (!res.ok) throw new Error('Failed to fetch courses')
      const data = await res.json()
      setCourses(data)
    } catch (err: any) {
      console.error('Error fetching courses:', err)
      setError('Failed to load courses')
      toast({
        title: "Error",
        description: err.message || "Failed to load courses.",
        variant: "destructive",
      });
    }
  }

  // Initial data fetch and polling for real-time updates
  useEffect(() => {
    fetchData()
    fetchCourses()
    const interval = setInterval(fetchData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  // Handle faculty removal
  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/faculty/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to remove faculty member');
      }
      toast({
        title: "Faculty Removed!",
        description: "Faculty member has been successfully removed.",
        variant: "success",
      });
      fetchData()
    } catch (err: any) {
      console.error('Error removing faculty:', err)
      setError(err.message || 'Failed to remove faculty member')
      toast({
        title: "Error",
        description: err.message || "Failed to remove faculty member.",
        variant: "destructive",
      });
    }
  }

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/faculty`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      toast({
        title: "Status Updated!",
        description: "Faculty status has been successfully updated.",
        variant: "success",
      });
      fetchData()
      setShowDetailsModal(false)
    } catch (err: any) {
      console.error('Error updating status:', err)
      setError(err.message || 'Failed to update status')
      toast({
        title: "Error",
        description: err.message || "Failed to update status.",
        variant: "destructive",
      });
    }
  }

  // Handle course assignment
  const handleAssignCourse = async () => {
    if (!selectedFaculty || !selectedCourse || !selectedSemester) {
      toast({
        title: "Missing Information",
        description: "Please select a course and semester to assign.",
        variant: "destructive",
      });
      return
    }

    setAssignLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/faculty/assign-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFaculty.id,
          courseId: Number(selectedCourse),
          semester: parseInt(selectedSemester)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign course')
      }

      toast({
        title: "Course Assigned!",
        description: `Successfully assigned ${data.data.courseName} to ${data.data.facultyName}.`,
        variant: "success",
      });
      fetchData() // Refresh data immediately
      setShowAssignModal(false)
      setSelectedCourse('')
      setSelectedSemester('')
    } catch (err: any) {
      console.error('Error assigning course:', err)
      setError(err.message || 'Failed to assign course')
      toast({
        title: "Error",
        description: err.message || "Failed to assign course.",
        variant: "destructive",
      });
    } finally {
      setAssignLoading(false)
    }
  }

  // Handle sending notification
  const handleSendNotification = async () => {
    if (!selectedFaculty || !notificationTitle || !notificationMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and message for the notification.",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await fetch('/api/faculty/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFaculty.id,
          title: notificationTitle,
          message: notificationMessage
        })
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send notification');
      }
      toast({
        title: "Notification Sent!",
        description: "Notification has been successfully sent.",
        variant: "success",
      });
      setShowNotificationModal(false)
      setNotificationTitle('')
      setNotificationMessage('')
    } catch (err: any) {
      console.error('Error sending notification:', err)
      setError(err.message || 'Failed to send notification')
      toast({
        title: "Error",
        description: err.message || "Failed to send notification.",
        variant: "destructive",
      });
    }
  }

  // Fetch assigned subjects for a faculty
  const fetchAssignedSubjects = async (facultyId: string, assignedCourses: any[]) => {
    setSubjectsLoading(true)
    setSubjectsError('')
    try {
      const res = await fetch(`/api/admin/faculty/${facultyId}/subjects`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch available subjects');
      }
      const data = await res.json();
      setAvailableSubjects(data.map((subject: any) => ({ ...subject, id: Number(subject.id) })));
      setSelectedSubjects(assignedCourses.flatMap((ac: any) => ac.course.subjects?.map((s: any) => Number(s.id)) || [])); // Pre-select already assigned subjects (if any)
    } catch (err: any) {
      console.error('Error fetching subjects:', err);
      setSubjectsError(err.message || 'Failed to load available subjects.');
      toast({
        title: "Error",
        description: err.message || "Failed to load available subjects.",
        variant: "destructive",
      });
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleSubjectSelection = (subjectId: number, isSelected: boolean) => {
    setSelectedSubjects(prev =>
      isSelected ? [...prev, subjectId] : prev.filter(id => id !== subjectId)
    );
  };

  const handleSaveSubjects = async () => {
    if (!selectedFaculty) return;
    try {
      const res = await fetch(`/api/admin/faculty/${selectedFaculty.id}/subjects`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectIds: selectedSubjects }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update assigned subjects');
      }
      toast({
        title: "Subjects Updated!",
        description: "Faculty's assigned subjects have been updated.",
        variant: "success",
      });
      setShowSubjectsModal(false);
      fetchData(); // Refresh faculty data to reflect new subject assignments
    } catch (err: any) {
      console.error('Error saving subjects:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update assigned subjects.",
        variant: "destructive",
      });
    }
  };

  const filteredFaculty = faculty.filter(f =>
    (f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus === 'ALL' || f.status === filterStatus.toUpperCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'INACTIVE': return 'secondary';
      case 'DEACTIVATED': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" /> Manage Faculty
        </h1>

        <Card className="shadow-lg">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6" /> Faculty List
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search faculty..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64"
                />
              </div>
              <Select onValueChange={setFilterStatus} value={filterStatus}>
                <SelectTrigger className="w-[180px]">
                  <ListFilter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => router.push('/admin/faculty/add')} className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Add New Faculty
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading faculty data...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 font-medium">Error: {error}</div>
            ) : filteredFaculty.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No faculty members found.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[150px]">Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center w-[180px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFaculty.map(facultyMember => (
                      <TableRow key={facultyMember.id}>
                        <TableCell className="font-semibold text-gray-700">{facultyMember.employeeId}</TableCell>
                        <TableCell className="font-medium text-gray-800">{facultyMember.name}</TableCell>
                        <TableCell className="text-gray-700">{facultyMember.email}</TableCell>
                        <TableCell className="text-gray-700">{facultyMember.department.name}</TableCell>
                        <TableCell className="text-gray-700">{facultyMember.position}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(facultyMember.status)}>{facultyMember.status}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Layers className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/faculty/edit/${facultyMember.id}`)}>
                                <Edit2 className="h-4 w-4 mr-2" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedFaculty(facultyMember);
                                setShowDetailsModal(true);
                              }}>
                                <Info className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedFaculty(facultyMember);
                                setShowAssignModal(true);
                              }}>
                                <BookOpen className="h-4 w-4 mr-2" /> Assign Course
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedFaculty(facultyMember);
                                setShowNotificationModal(true);
                              }}>
                                <Bell className="h-4 w-4 mr-2" /> Send Notification
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedFaculty(facultyMember);
                                fetchAssignedSubjects(facultyMember.id, facultyMember.assignedCourses || []);
                                setShowSubjectsModal(true);
                              }}>
                                <BookOpen className="h-4 w-4 mr-2" /> Manage Subjects
                              </DropdownMenuItem>
                              {facultyMember.status === 'ACTIVE' ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-orange-600 focus:text-orange-700 focus:bg-orange-50 cursor-pointer">
                                      <UserX className="h-4 w-4 mr-2" /> Deactivate
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirm Deactivation</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to deactivate {facultyMember.name}? They will not be able to log in.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleStatusChange(facultyMember.id, 'DEACTIVATED')}>Deactivate</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : (
                                <DropdownMenuItem onClick={() => handleStatusChange(facultyMember.id, 'ACTIVE')} className="text-green-600 focus:text-green-700 focus:bg-green-50 cursor-pointer">
                                  <UserCheck className="h-4 w-4 mr-2" /> Activate
                                </DropdownMenuItem>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently remove {facultyMember.name} from the system.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemove(facultyMember.id)}>Remove</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Faculty Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Faculty Details</DialogTitle>
              <DialogDescription>Information about {selectedFaculty?.name}</DialogDescription>
            </DialogHeader>
            {selectedFaculty && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 items-center gap-4">
                  <span className="font-medium">Name:</span>
                  <span>{selectedFaculty.name}</span>

                  <span className="font-medium">Email:</span>
                  <span>{selectedFaculty.email}</span>

                  <span className="font-medium">Employee ID:</span>
                  <span>{selectedFaculty.employeeId}</span>

                  <span className="font-medium">Department:</span>
                  <span>{selectedFaculty.department.name}</span>

                  <span className="font-medium">Position:</span>
                  <span>{selectedFaculty.position}</span>

                  <span className="font-medium">Status:</span>
                  <span>
                    <Badge variant={getStatusBadgeVariant(selectedFaculty.status)}>{selectedFaculty.status}</Badge>
                  </span>
                </div>

                <h3 className="text-lg font-semibold mt-4">Assigned Courses</h3>
                {(selectedFaculty.assignedCourses && selectedFaculty.assignedCourses.length > 0) ? (
                  <ul className="list-disc ml-6 space-y-1">
                    {selectedFaculty.assignedCourses.map(ac => (
                      <li key={ac.course.id}>{ac.course.name} ({ac.course.code})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No courses assigned.</p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Course Modal */}
        <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Course to {selectedFaculty?.name}</DialogTitle>
              <DialogDescription>Select a course and semester to assign.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label htmlFor="assign-course-select" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <Select onValueChange={setSelectedCourse} value={selectedCourse}>
                  <SelectTrigger id="assign-course-select">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={String(course.id)}>{course.name} ({course.code}) - {String(course.departmentId)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="assign-semester-select" className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <Select onValueChange={setSelectedSemester} value={selectedSemester}>
                  <SelectTrigger id="assign-semester-select">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <SelectItem key={sem} value={String(sem)}>{sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              <Button onClick={handleAssignCourse} disabled={assignLoading}>
                {assignLoading ? 'Assigning...' : 'Assign Course'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Notification Modal */}
        <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Send Notification to {selectedFaculty?.name}</DialogTitle>
              <DialogDescription>Compose a message to send to this faculty member.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label htmlFor="notification-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  id="notification-title"
                  placeholder="Notification Title"
                  value={notificationTitle}
                  onChange={e => setNotificationTitle(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="notification-message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <Input
                  id="notification-message"
                  placeholder="Notification Message"
                  value={notificationMessage}
                  onChange={e => setNotificationMessage(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNotificationModal(false)}>Cancel</Button>
              <Button onClick={handleSendNotification}>
                Send Notification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Subjects Modal */}
        <Dialog open={showSubjectsModal} onOpenChange={setShowSubjectsModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Manage Subjects for {selectedFaculty?.name}</DialogTitle>
              <DialogDescription>Select subjects to assign to this faculty member.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {subjectsLoading ? (
                <div className="text-center py-4">Loading subjects...</div>
              ) : subjectsError ? (
                <div className="text-red-500 text-center py-4">Error: {subjectsError}</div>
              ) : availableSubjects.length === 0 ? (
                <div className="text-gray-500 text-center py-4">No subjects available.</div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {availableSubjects.map(subject => (
                    <div key={subject.id} className="flex items-center justify-between p-2 border rounded-md">
                      <label htmlFor={`subject-${subject.id}`} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          id={`subject-${subject.id}`}
                          checked={selectedSubjects.includes(subject.id)}
                          onChange={(e) => handleSubjectSelection(subject.id, e.target.checked)}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                        />
                        <div>
                          <p className="font-medium">{subject.name} ({subject.code})</p>
                          <p className="text-sm text-gray-500">Course: {subject.course?.name || 'N/A'} • Semester: {subject.semester}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubjectsModal(false)}>Cancel</Button>
              <Button onClick={handleSaveSubjects} disabled={subjectsLoading}>Save Subjects</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
} 