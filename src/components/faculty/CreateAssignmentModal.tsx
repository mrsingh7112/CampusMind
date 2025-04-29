'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { FileUploader } from './FileUploader'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'

interface CreateAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAssignmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    totalMarks: 100,
    files: [] as File[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create form data for file upload
      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('courseId', formData.courseId)
      data.append('dueDate', formData.dueDate)
      data.append('totalMarks', formData.totalMarks.toString())
      
      formData.files.forEach((file) => {
        data.append('files', file)
      })

      const response = await fetch('/api/faculty/assignments', {
        method: 'POST',
        body: data,
      })

      if (!response.ok) {
        throw new Error('Failed to create assignment')
      }

      onSuccess()
    } catch (error) {
      console.error('Error creating assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (files: File[]) => {
    setFormData(prev => ({ ...prev, files }))
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Create New Assignment
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Course</label>
                  <select
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.courseId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        courseId: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Course</option>
                    <option value="CS101">Data Structures</option>
                    <option value="CS102">Database Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Upload Files (Optional)
                </label>
                <FileUploader onUpload={handleFileUpload} />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create Assignment
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 