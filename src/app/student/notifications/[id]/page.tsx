'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  title: string;
  message: string;
  fileUrl?: string;
  createdAt: string;
}

const EXAM_RULES = [
  'Arrive 15 minutes before the exam.',
  'Carry your ID card.',
  'No electronic devices allowed.',
  'Follow all university guidelines.',
];

export default function StudentNotificationDetails() {
  const params = useParams();
  const id = params?.id as string;
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotification() {
      setLoading(true);
      try {
        const res = await fetch(`/api/notifications/${id}`);
        if (!res.ok) throw new Error('Failed to fetch notification');
        const data = await res.json();
        setNotification(data);
      } catch (err) {
        setNotification(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchNotification();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!notification) return <div className="p-8 text-red-600">Notification not found.</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{notification.title}</h1>
      <p className="text-gray-600 mb-4">{new Date(notification.createdAt).toLocaleString()}</p>
      <div className="mb-6 whitespace-pre-line text-lg">{notification.message}</div>
      <h2 className="text-xl font-semibold mb-2">Exam Rules & Regulations</h2>
      <ul className="list-disc ml-6 mb-6">
        {EXAM_RULES.map(rule => <li key={rule}>{rule}</li>)}
      </ul>
      {notification.fileUrl && (
        <a
          href={notification.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Download Datesheet PDF
        </a>
      )}
      <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
    </div>
  );
} 