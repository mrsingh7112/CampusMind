import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Activity, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RecentActivityLogs() {
  const { data, error, isLoading } = useSWR('/api/admin/activity-logs', fetcher, { refreshInterval: 5000 });
  const [visibleLogsCount, setVisibleLogsCount] = useState(5); // Initially show 5 logs

  const truncateMessage = (message: string, maxLength: number) => {
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength) + '...';
  };

  const handleShowMoreLogs = () => {
    if (data) {
      setVisibleLogsCount(prevCount => Math.min(prevCount + 5, data.length)); // Show 5 more or all remaining
    }
  };

  const handleShowLessLogs = () => {
    setVisibleLogsCount(5); // Reset to initial 5 logs
  };

  const logsToShow = Array.isArray(data) ? data.slice(0, visibleLogsCount) : [];
  const hasMoreLogs = Array.isArray(data) && visibleLogsCount < data.length;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-orange-700 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-red-500">Failed to load activity logs.</div>}
        {data && data.length === 0 && <div className="text-gray-400">No recent activity yet.</div>}
        {data && data.length > 0 && (
          <ul className="space-y-3">
            {logsToShow.map((log: any) => (
              <li key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                <MessageSquare className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-1 text-xs font-medium bg-blue-100 text-blue-800">
                    {log.type}
                  </Badge>
                  <p className="text-sm text-gray-800 leading-tight">
                    {truncateMessage(log.message ?? '', 100)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {(hasMoreLogs || visibleLogsCount > 5) && (
          <div className="flex justify-center mt-4">
            {visibleLogsCount > 5 && (
              <Button variant="outline" onClick={handleShowLessLogs} className="text-sm mr-2">
                Show Less
              </Button>
            )}
            {hasMoreLogs && (
              <Button variant="outline" onClick={handleShowMoreLogs} className="text-sm">
                Show More
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 