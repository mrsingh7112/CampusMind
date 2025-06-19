import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { BellRing, MessageSquare, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Notification {
  id: string;
  type: string;
  message: string;
  subject?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function NotificationsSummary() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const { data: notifications, error, isLoading } = useSWR('/api/notifications', fetcher, { refreshInterval: 10000 });

  // Ensure notifications is always an array to prevent slice() error
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const displayedNotifications = showAll ? safeNotifications : safeNotifications.slice(0, 2);

  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">Loading notifications...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Failed to load notifications.</div>;
  }

  if (!notifications || notifications.length === 0) {
    return <div className="text-center py-4 text-gray-500">No notifications available.</div>;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-red-700 flex items-center gap-2">
          <BellRing className="w-5 h-5" /> Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedNotifications.map((notification: any) => (
            <div
              key={notification.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => router.push(`/notifications/${notification.id}`)}
            >
              <div className="p-2 rounded-full bg-gray-100">
                <MessageSquare className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <Badge variant="secondary" className="mb-1 text-xs font-medium bg-red-100 text-red-800">
                      {notification.title}
                    </Badge>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.subject ? `${notification.subject.name}: ` : ''}
                      {notification.message}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {notifications.length > 2 && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="w-full"
              >
                {showAll ? 'Show Less' : 'See All'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 