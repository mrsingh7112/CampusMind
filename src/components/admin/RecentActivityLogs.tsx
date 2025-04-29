import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RecentActivityLogs() {
  const { data, error, isLoading } = useSWR('/api/admin/activity-logs', fetcher, { refreshInterval: 5000 });

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-100 mb-8">
      <h3 className="text-lg font-bold text-gray-700 mb-3">Recent Activity Logs</h3>
      {isLoading && <div className="text-gray-400">Loading...</div>}
      {error && <div className="text-red-500">Failed to load activity logs.</div>}
      {data && data.length === 0 && <div className="text-gray-400">No recent activity yet.</div>}
      {data && data.length > 0 && (
        <ul className="space-y-2">
          {data.map((log: any) => (
            <li key={log.id} className="border-b py-2 text-sm text-gray-700 flex flex-col gap-1">
              <span className="font-semibold text-blue-600">{log.type}</span>
              <span>{log.message}</span>
              <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 