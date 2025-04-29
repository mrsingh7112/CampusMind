'use client'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, Building2, Layers } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function generateToken() {
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
  const [form, setForm] = useState({ name: '', email: '', department: '', position: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreds, setShowCreds] = useState<{token: string, password: string} | null>(null)

  // Fetch departments
  const { data: departments, isLoading: loadingDepartments } = useSWR('/api/admin/departments', fetcher)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const token = generateToken()
    const password = generatePassword()
    try {
      const formData = { 
        name: form.name,
        email: form.email,
        department: form.department,
        position: form.position,
        tokenId: token,
        password: password
      }
      console.log('Submitting faculty data:', formData)
      
      const res = await fetch('/api/admin/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await res.json()
      console.log('Response status:', res.status)
      console.log('Response data:', data)
      
      if (!res.ok) {
        console.error('Error response:', data)
        throw new Error(data.error || data.details || 'Failed to add faculty')
      }
      
      console.log('Faculty added successfully:', data)
      setShowCreds({ token, password })
      setSuccess('Faculty added successfully! Token: ' + token)
      setForm({ name: '', email: '', department: '', position: '', password: '' })
      
      // Trigger dashboard updates
      mutate('/api/admin/faculty')
      mutate('/api/admin/faculty?new=true')
    } catch (err: any) {
      console.error('Error in handleSubmit:', err)
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
        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg rounded-lg"
        >
          {loading ? 'Adding...' : 'Add Faculty'}
        </Button>
        {error && (
          <div className="text-red-500 p-3 rounded bg-red-50 border border-red-200">
            Error: {error}
          </div>
        )}
        {success && (
          <div className="text-green-600 p-3 rounded bg-green-50 border border-green-200">
            {success}
          </div>
        )}
      </form>
      {showCreds && (
        <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
          <div className="font-semibold text-blue-800 mb-2">Faculty Credentials:</div>
          <div><b>Faculty Token:</b> {showCreds.token}</div>
          <div><b>Password:</b> {showCreds.password}</div>
          <div className="text-xs text-gray-500 mt-2">
            Please securely share these credentials with the faculty member.
          </div>
        </div>
      )}
    </div>
  )
} 