import React, { useState, useEffect } from 'react';

interface EditSlotModalProps {
  open: boolean;
  onClose: () => void;
  subjects: any[];
  faculty: any[];
  rooms: any[];
  current: { subject?: any; faculty?: any; room?: any };
  day?: number;
  startTime?: string;
}

const ALL_TIMES = [
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
];

export default function EditSlotModal({ open, onClose, subjects, faculty, rooms: initialRooms, current, day, startTime }: EditSlotModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full relative animate-fadeIn">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl" onClick={onClose}>&times;</button>
        <h3 className="text-xl font-bold mb-4">Timetable Slot Details</h3>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Subject</label>
          <div className="p-2 border rounded bg-gray-100">{current?.subject?.name || '—'}</div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Faculty</label>
          <div className="p-2 border rounded bg-gray-100">{current?.faculty?.name || '—'}</div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Room</label>
          <div className="p-2 border rounded bg-gray-100">{current?.room?.name || '—'}</div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Time Slot</label>
          <div className="p-2 border rounded bg-gray-100">{startTime || '—'}</div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 