'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, Building2, Layers } from 'lucide-react'
import { toast } from 'sonner'
import bcrypt from 'bcryptjs'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function generateEmployeeId() {
  return 'FAC' + Math.floor(100000 + Math.random() * 900000)
}
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
  let pwd = ''
  for (let i = 0; i < 8; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pwd
}

export default function AddFacultyPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    employeeId: '',
    password: '',
    phoneNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [showCreds, setShowCreds] = useState<{employeeId: string, password: string} | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch departments
  const { data: departments, isLoading: loadingDepartments } = useSWR('/api/admin/departments', fetcher)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setShowCreds(null)
    setError('')
    setSuccess('')

    // Auto-generate employeeId if not provided
    let employeeId = form.employeeId
    if (!employeeId) {
      const year = new Date().getFullYear()
      const randomNum = Math.floor(100 + Math.random() * 900) // 3-digit random
      employeeId = `FAC${randomNum}-${year}`
    }

    try {
      const passwordToStore = form.password || Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(passwordToStore, 10)

      const res = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          department: form.department,
          position: form.position,
          employeeId,
          password: hashedPassword,
          phoneNumber: form.phoneNumber || null
        })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || data.details || 'Failed to add faculty')
        return
      }
      setShowCreds({ employeeId, password: passwordToStore })
      toast.success('Faculty added successfully!')
      setForm({ name: '', email: '', department: '', position: '', employeeId: '', password: '', phoneNumber: '' })
      mutate('/api/admin/faculty')
      mutate('/api/admin/faculty?new=true')
    } catch (err: any) {
      setError(err.message || 'Failed to add faculty')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-lg mt-10 border border-blue-100">
      <h2 className="text-3xl font-extrabold mb-6 flex items-center gap-2 text-blue-700">
        <UserPlus className="w-8 h-8 text-blue-500" /> Add New Faculty
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-semibold text-blue-800">Name</label>
          <Input 
            placeholder="Full Name" 
            value={form.name} 
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
            required 
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-blue-800">Email</label>
          <Input 
            type="email"
            placeholder="Email Address" 
            value={form.email} 
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
            required 
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-blue-800">Department</label>
          <div className="flex items-center gap-2">
            <select
              className="w-full border-2 border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 bg-white"
              value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              required
            >
              <option value="">Select Department</option>
              {departments && departments.length > 0 && departments.map((dep: any) => (
                <option key={dep.id} value={dep.name}>{dep.name}</option>
              ))}
            </select>
            <Layers className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-semibold text-blue-800">Position</label>
          <Input 
            placeholder="Position (e.g. Professor, Assistant Professor)" 
            value={form.position} 
            onChange={e => setForm(f => ({ ...f, position: e.target.value }))} 
            required 
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-blue-800">Phone Number (optional)</label>
          <Input 
            placeholder="Phone Number" 
            value={form.phoneNumber} 
            onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-blue-800">Employee ID (optional, will be auto-generated if empty)</label>
          <Input 
            placeholder="Employee ID" 
            value={form.employeeId} 
            onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg rounded-lg"
        >
          {loading ? 'Adding...' : 'Add Faculty'}
        </Button>
      </form>
      {showCreds && (
        <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
          <div className="font-semibold text-blue-800 mb-2">Faculty Credentials:</div>
          <div><b>Employee ID:</b> {showCreds.employeeId}</div>
          <div><b>Password:</b> {showCreds.password}</div>
          <div className="text-xs text-gray-500 mt-2">
            Please securely share these credentials with the faculty member.
          </div>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
          <div className="font-semibold text-red-800 mb-2">Error:</div>
          <div>{error}</div>
        </div>
      )}
      {success && (
        <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
          <div className="font-semibold text-green-800 mb-2">Success:</div>
          <div>{success}</div>
        </div>
      )}
    </div>
  )
} 