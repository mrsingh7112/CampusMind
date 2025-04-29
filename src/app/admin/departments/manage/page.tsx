"use client"
import useSWR, { mutate } from 'swr'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, PlusCircle, BookOpen, Layers, Edit2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ManageDepartmentsPage() {
  const { data: departments, isLoading, error } = useSWR('/api/admin/departments', fetcher, { refreshInterval: 3000 })
  const [edit, setEdit] = useState<{ type: string, id: number, name: string } | null>(null)
  const [add, setAdd] = useState<{ type: string, parentId?: number, semester?: number } | null>(null)
  const [input, setInput] = useState('')
  const [semester, setSemester] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string, id: number } | null>(null)

  // Handlers
  const handleEdit = (type: string, id: number, name: string) => {
    setEdit({ type, id, name })
    setInput(name)
  }
  const handleEditSave = async () => {
    try {
      await fetch('/api/admin/departments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: edit?.type, id: edit?.id, name: input }),
      })
      toast({ title: 'Success', description: `${edit?.type.charAt(0).toUpperCase() + edit?.type.slice(1)} updated!` })
    } catch {
      toast({ title: 'Error', description: 'Failed to update.', variant: 'destructive' })
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
      await fetch('/api/admin/departments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: deleteConfirm.type, id: deleteConfirm.id }),
      })
      toast({ title: 'Deleted', description: `${deleteConfirm.type.charAt(0).toUpperCase() + deleteConfirm.type.slice(1)} deleted!` })
    } catch {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' })
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
    if (!input) return
    try {
      await fetch('/api/admin/departments', {
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
      toast({ title: 'Added', description: `${add?.type.charAt(0).toUpperCase() + add?.type.slice(1)} added!` })
    } catch {
      toast({ title: 'Error', description: 'Failed to add.', variant: 'destructive' })
    }
    setAdd(null)
    setInput('')
    setSemester(1)
    mutate('/api/admin/departments')
  }

  return (
    <TooltipProvider>
      <div className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-2xl mt-10 border border-blue-200">
        <h2 className="text-4xl font-black mb-10 flex items-center gap-3 text-blue-800 tracking-tight">
          <Layers className="w-10 h-10 text-blue-600" /> Manage Departments
        </h2>
        {isLoading ? (
          <div className="text-center text-lg font-semibold text-blue-600 py-10">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-10 font-bold">Failed to load departments</div>
        ) : (
          <div className="space-y-10">
            {departments && departments.length > 0 ? departments.map((dept: any) => (
              <div key={dept.id} className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl shadow-lg p-8 border border-blue-200">
                <div className="flex items-center mb-4">
                  {edit?.type === 'department' && edit.id === dept.id ? (
                    <>
                      <Input value={input} onChange={e => setInput(e.target.value)} className="w-80 text-2xl font-bold" />
                      <Button onClick={handleEditSave} className="ml-2 font-bold px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
                      <Button variant="ghost" onClick={() => setEdit(null)} className="ml-2 font-bold px-6 py-2 rounded-full">Cancel</Button>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-black text-blue-800 tracking-tight">{dept.name}</span>
                      <Tooltip><TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit('department', dept.id, dept.name)} className="ml-2"><Edit2 className="w-5 h-5" /></Button>
                      </TooltipTrigger><TooltipContent>Edit Department</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete('department', dept.id)} className="ml-1"><Trash2 className="w-5 h-5 text-red-500" /></Button>
                      </TooltipTrigger><TooltipContent>Delete Department</TooltipContent></Tooltip>
                    </>
                  )}
                  <div className="ml-auto">
                    <Tooltip><TooltipTrigger asChild>
                      <Button size="lg" className="rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2 shadow-lg" onClick={() => handleAdd('course', dept.id)}>
                        <PlusCircle className="w-5 h-5" /> Add Course
                      </Button>
                    </TooltipTrigger><TooltipContent>Add Course</TooltipContent></Tooltip>
                  </div>
                </div>
                {/* Courses */}
                <div className="space-y-6 mt-4">
                  {dept.courses.map((course: any) => (
                    <div key={course.id} className="bg-white rounded-xl border border-blue-100 shadow p-6 flex flex-col gap-2">
                      <div className="flex items-center mb-2">
                        {edit?.type === 'course' && edit.id === course.id ? (
                          <>
                            <Input value={input} onChange={e => setInput(e.target.value)} className="w-64 text-lg font-semibold" />
                            <Button onClick={handleEditSave} className="ml-2 font-bold px-5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white">Save</Button>
                            <Button variant="ghost" onClick={() => setEdit(null)} className="ml-2 font-bold px-5 py-1.5 rounded-full">Cancel</Button>
                          </>
                        ) : (
                          <>
                            <span className="text-lg font-bold text-blue-700">{course.name}</span>
                            <Tooltip><TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" onClick={() => handleEdit('course', course.id, course.name)} className="ml-2"><Edit2 className="w-4 h-4" /></Button>
                            </TooltipTrigger><TooltipContent>Edit Course</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" onClick={() => handleDelete('course', course.id)} className="ml-1"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                            </TooltipTrigger><TooltipContent>Delete Course</TooltipContent></Tooltip>
                          </>
                        )}
                        <div className="ml-auto">
                          <Tooltip><TooltipTrigger asChild>
                            <Button size="sm" className="rounded-full font-bold bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 flex items-center gap-2 shadow" onClick={() => handleAdd('subject', course.id)}>
                              <PlusCircle className="w-4 h-4" /> Add Subject
                            </Button>
                          </TooltipTrigger><TooltipContent>Add Subject</TooltipContent></Tooltip>
                        </div>
                      </div>
                      {/* Subjects by semester */}
                      <div className="ml-4">
                        {[...new Set(course.subjects.map((s: any) => s.semester))].sort((a, b) => a - b).map((sem: number) => (
                          <div key={sem} className="mb-2">
                            <span className="font-semibold text-purple-700">Semester {sem}:</span>
                            <ul className="flex flex-wrap gap-3 mt-1">
                              {course.subjects.filter((s: any) => s.semester === sem).map((subj: any) => (
                                <li key={subj.id} className="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-3 py-1 rounded-full shadow text-purple-900 font-semibold text-sm">
                                  {edit?.type === 'subject' && edit.id === subj.id ? (
                                    <>
                                      <Input value={input} onChange={e => setInput(e.target.value)} className="w-32 text-sm font-semibold" />
                                      <Button onClick={handleEditSave} className="ml-2 font-bold px-4 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
                                      <Button variant="ghost" onClick={() => setEdit(null)} className="ml-2 font-bold px-4 py-1 rounded-full">Cancel</Button>
                                    </>
                                  ) : (
                                    <>
                                      <span>{subj.name}</span>
                                      <Tooltip><TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost" onClick={() => handleEdit('subject', subj.id, subj.name)} className="ml-1"><Edit2 className="w-4 h-4" /></Button>
                                      </TooltipTrigger><TooltipContent>Edit Subject</TooltipContent></Tooltip>
                                      <Tooltip><TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost" onClick={() => handleDelete('subject', subj.id)} className="ml-1"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                      </TooltipTrigger><TooltipContent>Delete Subject</TooltipContent></Tooltip>
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )) : <div className="text-gray-400 text-center text-lg font-semibold">No departments found.</div>}
          </div>
        )}
        {/* Add dialogs */}
        {add && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-10 min-w-[340px] border-2 border-blue-200">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-2 text-blue-700">
                <PlusCircle className="w-6 h-6 text-blue-500" /> Add {add.type.charAt(0).toUpperCase() + add.type.slice(1)}
              </h3>
              <Input placeholder={`Enter ${add.type} name`} value={input} onChange={e => setInput(e.target.value)} className="mb-4 text-lg font-semibold" />
              {add.type === 'subject' && (
                <div className="mb-4">
                  <label className="block mb-1 font-bold text-purple-700">Semester</label>
                  <input type="number" min={1} max={8} value={semester} onChange={e => setSemester(Number(e.target.value))} className="border-2 border-purple-200 rounded p-2 w-24 text-lg font-semibold" />
                </div>
              )}
              <div className="flex gap-4 mt-2">
                <Button onClick={handleAddSave} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-6 py-2 rounded-full">Add</Button>
                <Button variant="ghost" onClick={() => setAdd(null)} className="font-bold px-6 py-2 rounded-full">Cancel</Button>
              </div>
            </div>
          </div>
        )}
        {/* Delete confirmation modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-10 min-w-[340px] border-2 border-red-200">
              <h3 className="text-2xl font-black mb-6 text-red-600 flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-red-500" /> Confirm Delete
              </h3>
              <p className="mb-6 text-lg font-semibold">Are you sure you want to delete this {deleteConfirm.type}?</p>
              <div className="flex gap-4">
                <Button onClick={confirmDelete} className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold px-6 py-2 rounded-full">Delete</Button>
                <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="font-bold px-6 py-2 rounded-full">Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
} 