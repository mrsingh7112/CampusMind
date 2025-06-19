'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef, Fragment } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusCircle, Edit, Trash2, Eye, FileText, Calendar, BookOpen, Upload, Save, XCircle } from 'lucide-react'

export default function FacultyAssignmentsPage() {
  const { data: session } = useSession();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subjectId: '', title: '', description: '', dueDate: '', file: null as File | null });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', dueDate: '', file: null as File | null });
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [viewSubmissionsId, setViewSubmissionsId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const isAdmin = session?.user?.role === 'ADMIN';

  const fetchAssignments = async () => {
    const res = await fetch('/api/faculty/assignments/list');
    if (res.ok) {
      const data = await res.json();
      setAssignments(data);
    } else {
      toast.error('Failed to fetch assignments');
    }
  }

  useEffect(() => {
    fetch('/api/faculty/classes')
      .then(res => res.json())
      .then(data => setSubjects(data))
      .finally(() => setLoading(false));
    fetchAssignments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, file: e.target.files ? e.target.files[0] : null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.append('subjectId', form.subjectId);
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('dueDate', form.dueDate);
    if (form.file) formData.append('file', form.file);

    try {
      const res = await fetch('/api/faculty/assignments/create', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        toast.success('Assignment created and students notified!');
        setForm({ subjectId: '', title: '', description: '', dueDate: '', file: null });
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchAssignments(); // Refresh list
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('An unexpected error occurred.');
    }
    setSubmitting(false);
  };

  const startEdit = (a: any) => {
    setEditingId(a.id);
    setEditForm({ title: a.title, description: a.description, dueDate: a.dueDate ? a.dueDate.slice(0, 10) : '', file: null });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '', dueDate: '', file: null });
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(f => ({ ...f, file: e.target.files ? e.target.files[0] : null }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', editForm.title);
    formData.append('description', editForm.description);
    formData.append('dueDate', editForm.dueDate);
    if (editForm.file) formData.append('file', editForm.file);

    try {
      const res = await fetch(`/api/faculty/assignments/update?id=${editingId}`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        toast.success('Assignment updated!');
        setEditingId(null);
        setEditForm({ title: '', description: '', dueDate: '', file: null });
        if (editFileInputRef.current) editFileInputRef.current.value = '';
        fetchAssignments(); // Refresh assignments
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const res = await fetch(`/api/faculty/assignments/delete?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Assignment deleted!');
        fetchAssignments(); // Refresh assignments
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  const handleViewSubmissions = async (id: string) => {
    if (viewSubmissionsId === id) {
      setViewSubmissionsId(null);
      setSubmissions([]);
    } else {
      setViewSubmissionsId(id);
      try {
        const res = await fetch(`/api/faculty/assignments/submissions?id=${id}`);
        if (res.ok) {
          setSubmissions(await res.json());
        } else {
          const errorData = await res.json();
          toast.error(errorData.error || 'Failed to fetch submissions');
          setSubmissions([]);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        toast.error('An unexpected error occurred while fetching submissions.');
        setSubmissions([]);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-white to-green-50 p-8 rounded-lg shadow-xl space-y-8">
      <Card className="bg-white border-none shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 drop-shadow-sm">Manage Assignments</CardTitle>
          <p className="text-lg text-gray-600">Create, view, and manage all assignments for your subjects.</p>
        </CardHeader>
        <CardContent className="space-y-8">
          {isAdmin && (
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-2"><PlusCircle className="w-6 h-6" /> Admin Upload Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="admin-subject" className="block text-base font-medium text-gray-700 mb-2">Subject</Label>
                    <Select name="subjectId" value={form.subjectId} onValueChange={(value) => handleSelectChange('subjectId', value)}>
                      <SelectTrigger id="admin-subject" className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.code} - {s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="admin-title" className="block text-base font-medium text-gray-700 mb-2">Title</Label>
                    <Input id="admin-title" name="title" value={form.title} onChange={handleChange} required className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
                  </div>
                  <div>
                    <Label htmlFor="admin-description" className="block text-base font-medium text-gray-700 mb-2">Description</Label>
                    <Textarea id="admin-description" name="description" value={form.description} onChange={handleChange} required className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-[100px]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="admin-due-date" className="block text-base font-medium text-gray-700 mb-2">Due Date</Label>
                      <div className="relative">
                        <Input id="admin-due-date" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} required className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-10" />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="admin-file-upload" className="block text-base font-medium text-gray-700 mb-2">Upload PDF (optional)</Label>
                      <div className="relative flex items-center">
                        <Input id="admin-file-upload" type="file" accept="application/pdf" onChange={handleFileChange} ref={fileInputRef} className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        <Upload className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 text-lg flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" /> {submitting ? 'Creating...' : 'Create Assignment'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2"><FileText className="w-6 h-6" /> Your Current Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 border-solid"></div>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-12 text-gray-600 text-lg">
                  No assignments found. Start by creating a new one!
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                  <table className="w-full text-left table-auto">
                    <thead className="bg-purple-100 text-purple-800 uppercase text-sm leading-normal">
                      <tr>
                        <th className="py-3 px-6 text-left">Subject</th>
                        <th className="py-3 px-6 text-left">Title</th>
                        <th className="py-3 px-6 text-left">Due Date</th>
                        <th className="py-3 px-6 text-center">Actions</th>
                        <th className="py-3 px-6 text-center">Submissions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm font-light">
                      {assignments.map((a) => (
                        <Fragment key={a.id}>
                          <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-3 px-6 whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-purple-500" /> {a.subject?.code} - {a.subject?.name}
                            </td>
                            <td className="py-3 px-6">{a.title}</td>
                            <td className="py-3 px-6">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="py-3 px-6 text-center">
                              {editingId === a.id ? (
                                <form onSubmit={handleEditSubmit} className="flex flex-col gap-3 p-4 bg-purple-50 rounded-lg shadow-inner">
                                  <Label htmlFor={`edit-title-${a.id}`} className="sr-only">Title</Label>
                                  <Input id={`edit-title-${a.id}`} name="title" value={editForm.title} onChange={handleEditChange} required placeholder="Title" className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-400" />
                                  <Label htmlFor={`edit-description-${a.id}`} className="sr-only">Description</Label>
                                  <Textarea id={`edit-description-${a.id}`} name="description" value={editForm.description} onChange={handleEditChange} required placeholder="Description" className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-400 min-h-[80px]" />
                                  <Label htmlFor={`edit-due-date-${a.id}`} className="sr-only">Due Date</Label>
                                  <div className="relative">
                                    <Input id={`edit-due-date-${a.id}`} type="date" name="dueDate" value={editForm.dueDate} onChange={handleEditChange} required className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-400 pr-10" />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                  </div>
                                  <Label htmlFor={`edit-file-${a.id}`} className="sr-only">Upload PDF</Label>
                                  <div className="relative flex items-center">
                                    <Input id={`edit-file-${a.id}`} type="file" accept="application/pdf" onChange={handleEditFileChange} ref={editFileInputRef} className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                                    <Upload className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                  </div>
                                  <div className="flex justify-end gap-2 mt-3">
                                    <Button type="submit" size="sm" className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
                                      <Save className="w-4 h-4" /> Save
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" onClick={cancelEdit} className="flex items-center gap-1">
                                      <XCircle className="w-4 h-4" /> Cancel
                                    </Button>
                                  </div>
                                </form>
                              ) : (
                                <div className="flex justify-center items-center gap-2">
                                  <Button size="sm" variant="outline" onClick={() => startEdit(a)} className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50">
                                    <Edit className="w-4 h-4" /> Edit
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleDelete(a.id)} className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" /> Delete
                                  </Button>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-6 text-center">
                              <Button size="sm" variant="outline" onClick={() => handleViewSubmissions(a.id)} className="flex items-center gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50 mx-auto">
                                <Eye className="w-4 h-4" /> {viewSubmissionsId === a.id ? 'Hide' : 'View'} Submissions
                              </Button>
                            </td>
                          </tr>
                          {viewSubmissionsId === a.id && submissions.length > 0 && (
                            <tr>
                              <td colSpan={5} className="p-4 bg-gray-50 border-t border-gray-200">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">Submissions for {a.title}</h3>
                                <ul className="space-y-2">
                                  {submissions.map((sub: any) => (
                                    <li key={sub.id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border border-gray-100">
                                      <span className="text-gray-700 font-medium">{sub.student?.name}</span>
                                      <a
                                        href={sub.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-1"
                                      >
                                        View File <ExternalLink className="w-4 h-4" />
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          )}
                          {viewSubmissionsId === a.id && submissions.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-4 bg-gray-50 border-t border-gray-200 text-center text-gray-500">
                                No submissions yet for this assignment.
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
} 