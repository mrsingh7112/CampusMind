'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/faculty/notifications')
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive'
      })
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/faculty/notifications/${notificationId}/read`, {
        method: 'POST'
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        )
      } else {
        throw new Error('Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      })
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button
          variant="outline"
          onClick={() => fetchNotifications()}
        >
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.read ? 'bg-gray-50' : 'bg-white border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 ${notification.read ? 'text-gray-400' : 'text-blue-500'}`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    <p className={`mt-1 text-sm ${notification.read ? 'text-gray-500' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {format(new Date(notification.createdAt), 'PPp')}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 