"use client"
import useSWR, { mutate } from 'swr'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, PlusCircle, Layers, ChevronDown, ChevronRight, Search, Edit2, Bookmark, GraduationCap } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function DepartmentsPage() {
  const { data: departments, isLoading, error } = useSWR('/api/admin/departments', fetcher, { refreshInterval: 3000 })
  const [edit, setEdit] = useState<{ type: string, id: number, name: string } | null>(null)
  const [add, setAdd] = useState<{ type: string, parentId?: number, semester?: number } | null>(null)
  const [input, setInput] = useState('')
  const [semester, setSemester] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string, id: number } | null>(null)
  const [expanded, setExpanded] = useState<{ [id: number]: boolean }>({})
  const [search, setSearch] = useState('')

  // Handlers
  const handleEdit = (type: string, id: number, name: string) => {
    setEdit({ type, id, name })
    setInput(name)
  }
  const handleEditSave = async () => {
    try {
      const res = await fetch('/api/admin/departments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: edit?.type, id: edit?.id, name: input }),
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update.');
      }
      toast({ title: 'Success', description: `${edit?.type.charAt(0).toUpperCase() + edit?.type.slice(1)} updated!`, variant: "success" })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update.', variant: 'destructive' })
    }
    setEdit(null)
    setInput('')
    mutate('/api/admin/departments')
  }
  const handleDelete = (type: string, id: number) => {
    setDeleteConfirm({ type, id })
  }
  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      const res = await fetch('/api/admin/departments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: deleteConfirm.type, id: deleteConfirm.id }),
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete.');
      }
      toast({ title: 'Deleted', description: `${deleteConfirm.type.charAt(0).toUpperCase() + deleteConfirm.type.slice(1)} deleted!`, variant: "success" })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete.', variant: 'destructive' })
    }
    setDeleteConfirm(null)
    mutate('/api/admin/departments')
  }
  const handleAdd = (type: string, parentId?: number, semester?: number) => {
    setAdd({ type, parentId, semester })
    setInput('')
    setSemester(1)
  }
  const handleAddSave = async () => {
    if (!input) {
      toast({
        title: "Validation Error",
        description: "Name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: add?.type,
          name: input,
          departmentId: add?.type === 'course' ? add?.parentId : undefined,
          courseId: add?.type === 'subject' ? add?.parentId : undefined,
          semester: add?.type === 'subject' ? semester : undefined,
        }),
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add.');
      }
      toast({ title: 'Added', description: `${add?.type.charAt(0).toUpperCase() + add?.type.slice(1)} added!`, variant: "success" })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to add.', variant: 'destructive' })
    }
    setAdd(null)
    setInput('')
    setSemester(1)
    mutate('/api/admin/departments')
  }
  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Filtered departments
  const filteredDepartments = departments?.filter((dept: any) =>
    dept.name.toLowerCase().includes(search.toLowerCase()) ||
    dept.courses.some((c: any) => c.name.toLowerCase().includes(search.toLowerCase()))
  ) || []

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
          <Layers className="w-8 h-8 text-blue-600" /> Manage Departments
        </h1>

        <Card className="shadow-lg">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Layers className="w-6 h-6" /> Departments Overview
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search departments, courses..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64"
                />
              </div>
              <Button onClick={() => handleAdd('department')} className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Add Department
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading departments...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 font-medium">Error: Failed to load departments.</div>
            ) : filteredDepartments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No departments found.</div>
            ) : (
              <div className="space-y-4">
                {filteredDepartments.map((dept: any) => (
                  <Card key={dept.id} className="shadow-sm border border-blue-100">
                    <CardHeader className="p-4 flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-3">
                        <Button size="icon" variant="ghost" onClick={() => toggleExpand(dept.id)} className="focus:outline-none">
                          {expanded[dept.id] ? <ChevronDown className="w-5 h-5 text-blue-600" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                        </Button>
                        <CardTitle className="text-xl font-bold text-blue-800">{dept.name}</CardTitle>
                        <span className="text-sm bg-blue-100 text-blue-700 rounded-full px-3 py-1 font-semibold">{dept.courses.length} Courses</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit('department', dept.id, dept.name)}>
                          <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('department', dept.id)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </CardHeader>
                    {expanded[dept.id] && (
                      <CardContent className="p-4 pt-0 border-t border-blue-100 bg-blue-50">
                        {dept.courses.length === 0 ? (
                          <div className="text-gray-600 italic py-2 flex items-center justify-between">
                            <span>No courses in this department.</span>
                            <Button size="sm" variant="link" onClick={() => handleAdd('course', dept.id)}>
                              <PlusCircle className="w-4 h-4 mr-1" /> Add Course
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3 mt-2">
                            {dept.courses.map((course: any) => (
                              <div key={course.id} className="bg-white rounded-md p-3 border border-blue-200 shadow-xs">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-purple-600" />
                                    <span className="font-semibold text-purple-700 text-lg">{course.name} ({course.code})</span>
                                    <span className="text-sm bg-purple-100 text-purple-700 rounded-full px-2 py-0.5 font-semibold">{course.subjects.length} Subjects</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit('course', course.id, course.name)}>
                                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete('course', course.id)}>
                                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                                    </Button>
                                    <Button size="sm" onClick={() => handleAdd('subject', course.id)} className="flex items-center gap-1">
                                      <PlusCircle className="w-4 h-4" /> Add Subject
                                    </Button>
                                  </div>
                                </div>
                                <div className="ml-8">
                                  {course.subjects.length === 0 ? (
                                    <div className="text-gray-600 italic py-2">No subjects in this course.</div>
                                  ) : (
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Subject Name</TableHead>
                                          <TableHead>Code</TableHead>
                                          <TableHead>Semester</TableHead>
                                          <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {course.subjects.map((subject: any) => (
                                          <TableRow key={subject.id}>
                                            <TableCell className="font-medium">{subject.name}</TableCell>
                                            <TableCell>{subject.code}</TableCell>
                                            <TableCell>{subject.semester}</TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                              <Button size="sm" variant="outline" onClick={() => handleEdit('subject', subject.id, subject.name)}>
                                                <Edit2 className="w-4 h-4" />
                                              </Button>
                                              <Button size="sm" variant="destructive" onClick={() => handleDelete('subject', subject.id)}>
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit/Add Dialog */}
        <Dialog open={!!edit || !!add} onOpenChange={() => { setEdit(null); setAdd(null); setInput(''); setSemester(1); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{edit ? `Edit ${edit.type.charAt(0).toUpperCase() + edit.type.slice(1)}` : `Add ${add?.type.charAt(0).toUpperCase() + add?.type.slice(1)}`}</DialogTitle>
              <DialogDescription>
                {edit ? `Editing ${edit.name}` : `Adding a new ${add?.type}.`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">Name</label>
                <Input
                  id="name"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="col-span-3"
                  placeholder={`Enter ${edit?.type || add?.type} name`}
                />
              </div>
              {add?.type === 'subject' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="semester" className="text-right">Semester</label>
                  <Select value={String(semester)} onValueChange={(val) => setSemester(Number(val))}>
                    <SelectTrigger id="semester" className="col-span-3">
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEdit(null); setAdd(null); setInput(''); setSemester(1); }}>Cancel</Button>
              <Button onClick={edit ? handleEditSave : handleAddSave}>{edit ? 'Save Changes' : 'Add'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this {deleteConfirm?.type}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 