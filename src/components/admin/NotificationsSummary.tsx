import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NotificationsSummary() {
  const { data, error, isLoading } = useSWR('/api/admin/notifications', fetcher, { refreshInterval: 10000 });

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-100 mb-8">
      <h3 className="text-lg font-bold text-gray-700 mb-3">Notifications Summary</h3>
      {isLoading && <div className="text-gray-400">Loading...</div>}
      {error && <div className="text-red-500">Failed to load notifications.</div>}
      {data && data.length === 0 && <div className="text-gray-400">No notifications yet.</div>}
      {data && data.length > 0 && (
        <ul className="space-y-2">
          {data.map((n: any) => (
            <li key={n.id} className="border-b py-2 text-sm text-gray-700 flex flex-col gap-1">
              <span className="font-semibold text-orange-600">{n.title}</span>
              <span>{n.message}</span>
              <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 