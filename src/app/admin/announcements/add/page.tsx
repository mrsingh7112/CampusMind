'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { BellRing, Send } from 'lucide-react'

export default function SendAnnouncementPage() {
  const [form, setForm] = useState({ title: '', content: '', audience: 'BOTH' })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('content', form.content)
    formData.append('audience', form.audience)
    if (file) formData.append('file', file)

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to send announcement')
      }

      toast({
        title: "Announcement Sent!",
        description: "Your announcement has been successfully sent.",
        variant: "success",
      })
      setForm({ title: '', content: '', audience: 'BOTH' })
      setFile(null)
    } catch (err: any) {
      toast({
        title: "Failed to Send Announcement",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
          <BellRing className="w-8 h-8 text-blue-600" /> Send New Announcement
        </h1>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Compose Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input 
                  id="title"
                  placeholder="Enter announcement title" 
                  value={form.title} 
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <Textarea 
                  id="content"
                  placeholder="Write your announcement content here..." 
                  value={form.content} 
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))} 
                  required 
                  rows={8}
                />
              </div>

              <div>
                <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                <Select 
                  value={form.audience}
                  onValueChange={(value) => setForm(f => ({ ...f, audience: value }))}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BOTH">Faculty & Students</SelectItem>
                    <SelectItem value="FACULTY">Faculty Only</SelectItem>
                    <SelectItem value="STUDENT">Students Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">Attach File (optional)</label>
                <Input
                  id="file"
                  type="file"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
              </div>
              
              <Button type="submit" disabled={loading} className="w-full flex items-center gap-2">
                {loading ? (
                  <span className="flex items-center gap-2"><Send className="w-4 h-4 animate-pulse" /> Sending...</span>
                ) : (
                  <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Announcement</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 