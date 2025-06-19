'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { PlusCircle, Edit, Trash2, Search, BookOpen, Layers, Users, TrendingUp, Info } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Department {
  id: string
  name: string
}

interface Course {
  id: string
  code: string
  name: string
  departmentId: string
  department: Department
  subjects?: any[]
  studentsCount?: number
}

export default function AdminCoursesPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', departmentId: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', code: '', departmentId: '' })
  const [filterDept, setFilterDept] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [detailsCourse, setDetailsCourse] = useState<Course | null>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [studentsCount, setStudentsCount] = useState<number>(0)
  const [faculty, setFaculty] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState<string | null>(null)

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [filterDept])

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/admin/departments')
      const data = await res.json()
      setDepartments(data)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load departments.",
        variant: "destructive",
      })
      setDepartments([])
    }
  }

  const fetchCourses = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/courses'
      if (filterDept) url += `?departmentId=${filterDept}`
      const res = await fetch(url)
      const data = await res.json()
      if (Array.isArray(data)) {
        setCourses(data)
        setError('')
      } else {
        setCourses([])
        setError(data.error || 'Failed to load courses')
        toast({
          title: "Error",
          description: data.error || 'Failed to load courses.',
          variant: "destructive",
        })
      }
    } catch (err: any) {
      setCourses([])
      setError(err.message || 'Failed to load courses')
      toast({
        title: "Error",
        description: err.message || 'Failed to load courses.',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add course')
      }
      toast({
        title: "Course Added!",
        description: "New course has been successfully added.",
        variant: "success",
      })
      setForm({ name: '', code: '', departmentId: '' })
      setShowAdd(false)
      fetchCourses()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to add course.',
        variant: "destructive",
      })
      setError('Failed to add course')
    }
  }

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update course')
      }
      toast({
        title: "Course Updated!",
        description: "Course details have been successfully updated.",
        variant: "success",
      })
      setEditId(null)
      setEditForm({ name: '', code: '', departmentId: '' })
      fetchCourses()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to update course.',
        variant: "destructive",
      })
      setError('Failed to update course')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete course')
      }
      toast({
        title: "Course Deleted!",
        description: "Course has been successfully deleted.",
        variant: "success",
      })
      fetchCourses()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to delete course.',
        variant: "destructive",
      })
      setError('Failed to delete course')
    }
  }

  // Filtered and searched courses
  const filteredCourses = courses.filter(c =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id])
  }
  const handleSelectAll = () => {
    if (selected.length === filteredCourses.length) setSelected([])
    else setSelected(filteredCourses.map(c => c.id))
  }
  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selected.length} selected courses?`)) return;

    try {
      await Promise.all(selected.map(id => handleDelete(id)));
      toast({
        title: "Bulk Delete Successful!",
        description: `${selected.length} courses have been deleted.`, 
        variant: "success",
      });
      setSelected([]);
      fetchCourses();
    } catch (err: any) {
      toast({
        title: "Bulk Delete Failed",
        description: err.message || "An error occurred during bulk deletion.",
        variant: "destructive",
      });
    }
  };

  // Analytics calculations
  const totalCourses = courses.length
  const coursesWithNoSubjects = courses.filter(c => !c.subjects || c.subjects.length === 0).length
  // Placeholder for most popular course (by student count)
  const mostPopularCourse = courses.reduce((max, c) => (c.studentsCount && (!max || c.studentsCount > max.studentsCount)) ? c : max, null as any)

  // Add a helper to get department code by id
  const getDepartmentCode = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId)
    if (!dept) return ''
    // Use the first letter of each word in the department name as code (e.g., School of Engineering -> SOE)
    return dept.name.split(' ').map(w => w[0]).join('').toUpperCase()
  }

  // Generate course code when department or name changes
  useEffect(() => {
    if (form.departmentId && form.name) {
      const deptCode = getDepartmentCode(form.departmentId)
      // Use a random 3-digit number for uniqueness
      const randomNum = Math.floor(100 + Math.random() * 900)
      setForm(f => ({ ...f, code: `${deptCode}-${randomNum}` }))
    } else {
      setForm(f => ({ ...f, code: '' }))
    }
    // eslint-disable-next-line
  }, [form.departmentId, form.name])

  // --- Modal functions ---
  const openAddModal = () => {
    setForm({ name: '', code: '', departmentId: '' });
    setShowAdd(true);
  };

  const openEditModal = (course: Course) => {
    setEditId(course.id);
    setEditForm({ name: course.name, code: course.code, departmentId: course.departmentId });
    setModalOpen('edit');
  };

  const openDetailsModal = async (course: Course) => {
    setDetailsCourse(course);
    setModalOpen('details');

    try {
      const [subjectsRes, studentsRes, facultyRes] = await Promise.all([
        fetch(`/api/admin/courses/${course.id}/subjects`),
        fetch(`/api/admin/courses/${course.id}/students`),
        fetch(`/api/admin/courses/${course.id}/faculty`)
      ]);

      const subjectsData = await subjectsRes.json();
      const studentsData = await studentsRes.json();
      const facultyData = await facultyRes.json();

      setSubjects(subjectsData);
      setStudentsCount(studentsData.count || 0);
      setFaculty(facultyData);
    } catch (err: any) {
      console.error("Failed to fetch course details:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load course details.",
        variant: "destructive",
      });
    }
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditId(null);
    setDetailsCourse(null);
    setModalOpen(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Manage Courses</h1>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-500 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{totalCourses}</div>
              <CardDescription className="text-xs text-blue-100 mt-1">All active courses</CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-orange-500 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses Without Subjects</CardTitle>
              <Layers className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{coursesWithNoSubjects}</div>
              <CardDescription className="text-xs text-orange-100 mt-1">Courses needing subjects assigned</CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-purple-500 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular Course</CardTitle>
              <Users className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              {mostPopularCourse ? (
                <div className="space-y-1">
                  <p className="text-xl font-bold">{mostPopularCourse.name}</p>
                  <p className="text-sm text-purple-100">{mostPopularCourse.code}</p>
                  <p className="text-xs text-purple-100">Students: {mostPopularCourse.studentsCount}</p>
                </div>
              ) : (
                <p className="text-lg font-bold">N/A</p>
              )}
              <CardDescription className="text-xs text-purple-100 mt-1">Based on enrolled students</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Course List and Management */}
        <Card className="shadow-lg">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6" /> All Courses
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64"
                />
              </div>
              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger id="filter-department" className="w-[180px]">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={openAddModal} className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Add New Course
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={selected.length === 0} className="flex items-center gap-2">
                    Bulk Actions ({selected.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleBulkDelete} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {loading && <div className="text-center py-8 text-gray-500">Loading courses...</div>}
            {error && <div className="text-center py-8 text-red-500 font-medium">Error: {error}</div>}
            {!loading && !error && filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No courses found. Try adjusting your filters.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selected.length === filteredCourses.length && filteredCourses.length > 0}
                          onCheckedChange={handleSelectAll}
                          disabled={filteredCourses.length === 0}
                        />
                      </TableHead>
                      <TableHead className="w-[100px]">Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-center">Subjects</TableHead>
                      <TableHead className="text-center">Students</TableHead>
                      <TableHead className="text-center w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map(course => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <Checkbox
                            checked={selected.includes(course.id)}
                            onCheckedChange={() => handleSelect(course.id)}
                          />
                        </TableCell>
                        <TableCell className="font-semibold text-gray-700">{course.code}</TableCell>
                        <TableCell className="font-medium text-gray-800">{course.name}</TableCell>
                        <TableCell>{course.department?.name}</TableCell>
                        <TableCell className="text-center">{course.subjects?.length || 0}</TableCell>
                        <TableCell className="text-center">{course.studentsCount || 0}</TableCell>
                        <TableCell className="text-center flex gap-2 justify-center">
                          <Button size="sm" variant="outline" onClick={() => openEditModal(course)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(course.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => openDetailsModal(course)}>
                            <Info className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Course Dialog */}
        <Dialog open={showAdd} onOpenChange={closeModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new course to the system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">Course Name</label>
                <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="code" className="text-right">Course Code</label>
                <Input id="code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="col-span-3" required readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="department" className="text-right">Department</label>
                <Select value={form.departmentId} onValueChange={value => setForm({ ...form, departmentId: value })} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit">Add Course</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Course Dialog */}
        <Dialog open={modalOpen === 'edit'} onOpenChange={closeModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update the details for {editForm.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); editId && handleEdit(editId); }} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-name" className="text-right">Course Name</label>
                <Input id="edit-name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-code" className="text-right">Course Code</label>
                <Input id="edit-code" value={editForm.code} onChange={e => setEditForm({ ...editForm, code: e.target.value })} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-department" className="text-right">Department</label>
                <Select value={editForm.departmentId} onValueChange={value => setEditForm({ ...editForm, departmentId: value })} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Course Details Dialog */}
        <Dialog open={modalOpen === 'details'} onOpenChange={closeModal}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Course Details: {detailsCourse?.name}</DialogTitle>
              <DialogDescription>
                Information about {detailsCourse?.name} ({detailsCourse?.code})
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="w-5 h-5" /> Subjects ({subjects.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {subjects.length === 0 ? (
                      <p className="text-gray-500">No subjects assigned to this course.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Semester</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subjects.map((subject: any) => (
                            <TableRow key={subject.id}>
                              <TableCell>{subject.name}</TableCell>
                              <TableCell>{subject.code}</TableCell>
                              <TableCell>{subject.semester}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5" /> Enrolled Students ({studentsCount})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentsCount === 0 ? (
                      <p className="text-gray-500">No students enrolled in this course.</p>
                    ) : (
                      <p className="text-gray-700">{studentsCount} students are currently enrolled.</p>
                      // Potentially display a list of students if needed, but for now, just the count.
                    )}
                  </CardContent>
                </Card>

                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5" /> Assigned Faculty ({faculty.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {faculty.length === 0 ? (
                      <p className="text-gray-500">No faculty assigned to this course.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Position</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {faculty.map((f: any) => (
                            <TableRow key={f.id}>
                              <TableCell>{f.name}</TableCell>
                              <TableCell>{f.email}</TableCell>
                              <TableCell>{f.position}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 