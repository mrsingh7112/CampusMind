'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: 'light',
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true
  })
  const { toast } = useToast()

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/faculty/settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch settings',
        variant: 'destructive'
      })
    }
  }

  const updateSettings = async (key: string, value: any) => {
    try {
      const response = await fetch('/api/faculty/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [key]: value
        })
      })

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          [key]: value
        }))
        toast({
          title: 'Success',
          description: 'Settings updated successfully'
        })
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive'
      })
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {settings.theme === 'light' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-gray-500">
                  Choose between light and dark mode
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={settings.theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings('theme', 'light')}
              >
                Light
              </Button>
              <Button
                variant={settings.theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings('theme', 'dark')}
              >
                Dark
              </Button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Bell className="h-5 w-5" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSettings('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Bell className="h-5 w-5" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive notifications in browser
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSettings('pushNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Bell className="h-5 w-5" />
                <div>
                  <p className="font-medium">Sound</p>
                  <p className="text-sm text-gray-500">
                    Play sound for notifications
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSettings('soundEnabled', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 