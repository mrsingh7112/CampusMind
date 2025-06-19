'use client'
import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import { format, parseISO } from 'date-fns'
import { BellRing, FileText } from 'lucide-react'

interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  fileUrl?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      setError(null);
      const session = await getSession();
      const studentId = session?.user?.id;

      if (!studentId) {
        setError('Student ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/student/notifications`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch notifications');
        }

        const data: Notification[] = await res.json();
        setNotifications(data);
      } catch (err: any) {
        console.error('Error fetching notifications:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Your Notifications</h1>

      {loading ? (
        <div className="text-center text-gray-600 text-lg py-10">Loading notifications...</div>
      ) : error ? (
        <div className="text-center text-red-600 text-lg py-10 font-medium">Error: {error}</div>
      ) : notifications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notifications.map((notif) => (
            <div key={notif.id} className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-blue-700 mb-2 flex items-center gap-2">
                  <BellRing className="w-6 h-6" /> {notif.title}
                </h2>
                <p className="text-gray-700 mb-4">{notif.message}</p>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
                <span>{format(parseISO(notif.createdAt), 'MMM d, yyyy hh:mm a')}</span>
                {notif.fileUrl && (
                  <a href={notif.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                    <FileText className="w-4 h-4" /> View File
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">No notifications found.</div>
      )}
    </div>
  );
} 