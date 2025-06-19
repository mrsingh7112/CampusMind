'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Bell, Check, BellRing, BellDot, CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'

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
  const router = useRouter()

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/faculty/notifications')
      const data = await response.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive'
      })
      setNotifications([])
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
        toast({
          title: 'Success',
          description: 'Notification marked as read.',
          variant: 'default'
        })
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
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-white to-purple-50 p-8 rounded-lg shadow-xl space-y-8">
      <Card className="bg-white border-none shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 drop-shadow-sm">Notifications</CardTitle>
          <p className="text-lg text-gray-600">Stay informed with the latest updates and alerts.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={fetchNotifications}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <BellRing className="w-5 h-5" /> Refresh Notifications
            </Button>
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-lg bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="font-semibold">No new notifications at the moment. Check back later!</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-5 rounded-xl border transition-all duration-200 ease-in-out cursor-pointer 
                    ${notification.read 
                      ? 'bg-gray-50 border-gray-200 text-gray-600 shadow-sm hover:shadow-md' 
                      : 'bg-white border-purple-200 text-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-1'
                    }`}
                  onClick={() => router.push(`/faculty/notifications/${notification.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`mt-1 ${notification.read ? 'text-gray-400' : 'text-purple-600'}`}>
                        {notification.read ? <Bell className="h-6 w-6" /> : <BellDot className="h-6 w-6 animate-pulse" />}
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${notification.read ? 'text-gray-600' : 'text-purple-800'}`}>
                          {notification.title}
                        </h3>
                        <p className={`mt-1 text-base ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {format(new Date(notification.createdAt), 'PPP')}
                          <Clock className="w-3 h-3 ml-2" /> {format(new Date(notification.createdAt), 'p')}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:bg-green-50 rounded-full p-2"
                        onClick={e => { e.stopPropagation(); markAsRead(notification.id); }}
                      >
                        <Check className="h-5 w-5" />
                      </Button>
                    )}
                    {notification.read && (
                      <div className="text-gray-400 flex items-center gap-1 text-sm">
                        <CircleCheck className="h-4 w-4" /> Read
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 