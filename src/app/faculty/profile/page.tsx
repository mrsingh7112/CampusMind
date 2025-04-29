'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { User, Mail, Phone, MapPin, Building, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

interface ProfileData {
  name: string
  email: string
  phone: string | null
  address: string | null
  department: string | null
  position: string | null
  avatar: string | null
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/faculty/profile')
      if (!response.ok) throw new Error('Failed to fetch profile data')
      const data = await response.json()
      setProfileData(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/faculty/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) throw new Error('Failed to update profile')

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!profileData) return null

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="pl-10"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="email"
              value={profileData.email}
              className="pl-10"
              disabled
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="phone"
              value={profileData.phone || ''}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="pl-10"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="address"
              value={profileData.address || ''}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              className="pl-10"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="department"
              value={profileData.department || ''}
              onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              className="pl-10"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="position"
              value={profileData.position || ''}
              onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
              className="pl-10"
              disabled={!isEditing}
            />
          </div>
        </div>

        {isEditing && (
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        )}
      </form>
    </div>
  )
} 