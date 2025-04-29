'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function SendAnnouncementPage() {
  const [form, setForm] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to send announcement')
      setSuccess('Announcement sent successfully!')
      setForm({ title: '', content: '' })
    } catch (err) {
      setError('Failed to send announcement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Send Announcement</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        <Textarea placeholder="Content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
        <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Announcement'}</Button>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
      </form>
    </div>
  )
} 