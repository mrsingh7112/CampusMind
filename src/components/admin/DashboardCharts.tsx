import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardCharts() {
  const { data, error, isLoading } = useSWR('/api/admin/dashboard-charts', fetcher, { refreshInterval: 10000 });

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-100 mb-8">
      <h3 className="text-lg font-bold text-gray-700 mb-3">Dashboard Charts</h3>
      {isLoading && <div className="text-gray-400">Loading...</div>}
      {error && <div className="text-red-500">Failed to load chart data.</div>}
      {data && data.length === 0 && <div className="text-gray-400">No chart data yet.</div>}
      {data && data.length > 0 && (
        <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto max-h-40">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
} 