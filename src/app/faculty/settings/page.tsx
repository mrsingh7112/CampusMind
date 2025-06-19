'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Bell, Palette, BellRing, Volume2, Mail, BellDot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Toggle } from '@/components/ui/toggle'

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
          description: 'Settings updated successfully',
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
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-white to-orange-50 p-8 rounded-lg shadow-xl space-y-8">
      <Card className="bg-white border-none shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 drop-shadow-sm">Settings</CardTitle>
          <p className="text-lg text-gray-600">Manage your account preferences and notification settings.</p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Theme Settings */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-2"><Palette className="w-6 h-6" /> Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {settings.theme === 'light' ? (
                    <Sun className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <Moon className="h-6 w-6 text-indigo-700" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800 text-lg">Theme</p>
                    <p className="text-sm text-gray-600">
                      Choose between light and dark mode for your interface.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Toggle
                    pressed={settings.theme === 'light'}
                    onPressedChange={() => updateSettings('theme', 'light')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 
                      ${settings.theme === 'light' ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Light
                  </Toggle>
                  <Toggle
                    pressed={settings.theme === 'dark'}
                    onPressedChange={() => updateSettings('theme', 'dark')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 
                      ${settings.theme === 'dark' ? 'bg-indigo-700 text-white shadow-md hover:bg-indigo-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Dark
                  </Toggle>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-gradient-to-br from-green-50 to-teal-100 border border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-green-800 flex items-center gap-2"><BellRing className="w-6 h-6" /> Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Mail className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-800 text-lg">Email Notifications</p>
                      <p className="text-sm text-gray-600">
                        Receive important updates and alerts via email.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSettings('emailNotifications', checked)}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <BellDot className="h-6 w-6 text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-800 text-lg">Push Notifications</p>
                      <p className="text-sm text-gray-600">
                        Get real-time alerts directly in your browser.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSettings('pushNotifications', checked)}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Volume2 className="h-6 w-6 text-orange-500" />
                    <div>
                      <p className="font-medium text-gray-800 text-lg">Sound Alerts</p>
                      <p className="text-sm text-gray-600">
                        Play a sound when a new notification arrives.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => updateSettings('soundEnabled', checked)}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
} 