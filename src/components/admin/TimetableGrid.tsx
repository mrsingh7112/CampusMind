import React from 'react';

interface TimetableSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject?: { name: string; code: string; type: string };
  faculty?: { name: string };
  room?: { name: string };
  isLunch?: boolean;
  isFree?: boolean;
}

interface TimetableGridProps {
  days: string[];
  timeSlots: { start: string; end: string }[];
  slots: Record<number, Record<string, TimetableSlot>>;
  onEditSlot: (day: number, startTime: string) => void;
}

const getCellColor = (slot: TimetableSlot | undefined) => {
  if (!slot) return 'bg-gray-50';
  if (slot.isLunch) return 'bg-orange-100 text-orange-700 font-semibold';
  if (slot.isFree) return 'bg-gray-100 text-gray-400';
  if (slot.subject?.type === 'LAB') return 'bg-green-50';
  if (slot.subject?.type === 'WORKSHOP') return 'bg-yellow-50';
  return 'bg-blue-50';
};

export default function TimetableGrid({ days, timeSlots, slots, onEditSlot }: TimetableGridProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-white z-10">
          <tr>
            <th className="p-2 border-b bg-white">Time</th>
            {days.map((day, idx) => (
              <th key={idx} className="p-2 border-b bg-white">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((ts, tsIdx) => (
            <tr key={tsIdx}>
              <td className="p-2 border-b font-semibold text-gray-700 bg-gray-50">{ts.start} - {ts.end}</td>
              {days.map((_, dIdx) => {
                const slot = slots[dIdx + 1]?.[ts.start];
                return (
                  <td
                    key={dIdx}
                    className={`p-2 border-b cursor-pointer transition ${getCellColor(slot)} hover:ring-2 hover:ring-blue-300`}
                    onClick={() => onEditSlot(dIdx + 1, ts.start)}
                  >
                    {slot?.isLunch ? (
                      <span>Lunch Break</span>
                    ) : slot?.subject ? (
                      <div>
                        <div className="font-bold">{slot.subject.name}</div>
                        <div className="text-xs text-gray-600">{slot.faculty?.name}</div>
                        <div className="text-xs text-gray-500">Room: {slot.room?.name}</div>
                      </div>
                    ) : slot?.isFree ? (
                      <span>—</span>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 