'use client'

import { useState } from 'react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState([])
  const { toast } = useToast()

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8 // Start from 8 AM
    return `${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`
  })

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(selectedDate), i)
    return {
      date,
      name: format(date, 'EEE'),
      fullDate: format(date, 'MMM d')
    }
  })

  const fetchSchedule = async (date: Date) => {
    try {
      const response = await fetch(`/api/faculty/schedule?date=${date.toISOString()}`)
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching schedule:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch schedule',
        variant: 'destructive'
      })
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      fetchSchedule(date)
    }
  }

  const getEventForTimeSlot = (day: typeof weekDays[0], time: string) => {
    return events.find(event => 
      isSameDay(new Date(event.date), day.date) && 
      event.startTime === time
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Schedule</h1>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => handleDateSelect(new Date())}
          >
            Today
          </Button>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-auto">
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 border-r font-medium">Time</div>
          {weekDays.map(day => (
            <div
              key={day.date.toString()}
              className={`p-4 text-center ${
                isSameDay(day.date, new Date()) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-medium">{day.name}</div>
              <div className="text-sm text-gray-500">{day.fullDate}</div>
            </div>
          ))}
        </div>

        <div className="divide-y">
          {timeSlots.map(time => (
            <div key={time} className="grid grid-cols-8">
              <div className="p-4 border-r text-sm text-gray-500">{time}</div>
              {weekDays.map(day => {
                const event = getEventForTimeSlot(day, time)
                return (
                  <div
                    key={day.date.toString()}
                    className={`p-4 ${event ? 'bg-blue-50' : ''}`}
                  >
                    {event && (
                      <div className="text-sm">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-gray-500">{event.location}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 