'use client'

import { useState, useEffect, Fragment } from 'react'
import { format, startOfWeek, addDays, isSameDay, parse } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { CalendarDays, BookOpen, ClipboardList, Clock, MapPin, Info, CheckCircle, XCircle, ChevronRight, ChevronLeft, PlusCircle, AlignLeft, ListTodo, Save } from 'lucide-react'
import { Dialog, Transition } from '@headlessui/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<any[]>([])
  const { toast } = useToast()
  const [eventModal, setEventModal] = useState<{ open: boolean, event: any | null }>({ open: false, event: null })
  const [scheduleSetupModal, setScheduleSetupModal] = useState<{
    open: boolean,
    date: Date | null,
    startTime: string,
    endTime: string,
    title: string,
    description: string,
    priority: 'Urgent' | 'More Important' | 'Important' | 'Less Important',
    isCompleted: boolean,
    id?: string;
  }>({ open: false, date: null, startTime: '', endTime: '', title: '', description: '', priority: 'Less Important', isCompleted: false })

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8 // Start from 8 AM
    return `${hour.toString().padStart(2, '0')}:00`; // Format as HH:mm
  })

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i) // Monday as start of week
    return {
      date,
      name: format(date, 'EEE'),
      fullDate: format(date, 'MMM d')
    }
  })

  const fetchSchedule = async (date: Date) => {
    try {
      const response = await fetch(`/api/faculty/schedule?date=${format(date, 'yyyy-MM-dd')}`)
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
    return events.find((event: any) => 
      isSameDay(new Date(event.date), day.date) && 
      event.startTime === time
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500';
      case 'More Important': return 'bg-orange-500';
      case 'Important': return 'bg-yellow-500';
      case 'Less Important': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  }

  // Helper for event type icon and color
  const getEventIcon = (event: any) => {
    if (!event) return null;
    if (event.type === 'class') return <BookOpen className="inline w-4 h-4 text-blue-500 mr-1" />;
    if (event.type === 'assignment') return <ClipboardList className="inline w-4 h-4 text-pink-500 mr-1" />;
    return <CalendarDays className="inline w-4 h-4 text-gray-400 mr-1" />;
  }

  // Get current hour for time slot highlight
  const now = new Date();
  const currentHour = now.getHours();

  useEffect(() => {
    fetchSchedule(selectedDate)
    // eslint-disable-next-line
  }, [selectedDate])

  const handleSlotClick = (day: typeof weekDays[0], time: string) => {
    const existingEvent = getEventForTimeSlot(day, time);
    if (existingEvent) {
      setScheduleSetupModal({
        open: true,
        date: new Date(existingEvent.date), // Convert date string to Date object
        startTime: format(parse(existingEvent.startTime, 'HH:mm', new Date()), 'HH:mm'),
        endTime: format(parse(existingEvent.endTime, 'HH:mm', new Date()), 'HH:mm'),
        title: existingEvent.title,
        description: existingEvent.description || '',
        priority: existingEvent.priority,
        isCompleted: existingEvent.isCompleted,
        id: existingEvent.id, // Set the ID for editing
      });
    } else {
      // Use the time directly, as it's already in HH:mm from timeSlots
      const [hourStr, minuteStr] = time.split(':');
      let hour = parseInt(hourStr);
      let minute = parseInt(minuteStr);

      const nextHour = (hour + 1) % 24;
      const endTime = `${nextHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      setScheduleSetupModal({
        open: true,
        date: day.date,
        startTime: time,
        endTime: endTime,
        title: '',
        description: '',
        priority: 'Less Important',
        isCompleted: false
      })
    }
  }

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleSetupModal.date || !scheduleSetupModal.title || !scheduleSetupModal.startTime || !scheduleSetupModal.endTime) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Date, Title, Start Time, End Time)',
        variant: 'destructive'
      });
      return;
    }

    const newSchedule = {
      date: format(scheduleSetupModal.date, 'yyyy-MM-dd'),
      startTime: scheduleSetupModal.startTime,
      endTime: scheduleSetupModal.endTime,
      title: scheduleSetupModal.title,
      description: scheduleSetupModal.description,
      priority: scheduleSetupModal.priority,
      isCompleted: scheduleSetupModal.isCompleted,
      type: 'custom' // Assuming custom for manually added events
    };

    try {
      const url = scheduleSetupModal.id ? `/api/faculty/schedule/${scheduleSetupModal.id}` : '/api/faculty/schedule/create';
      const method = scheduleSetupModal.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSchedule),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Schedule item ${scheduleSetupModal.id ? 'updated' : 'added'} successfully!`,
          variant: 'default'
        });
        setScheduleSetupModal({ ...scheduleSetupModal, open: false, id: undefined }); // Clear ID on close
        fetchSchedule(selectedDate); // Refresh schedule
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to add schedule item',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting schedule:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-white to-pink-50 p-8 rounded-lg shadow-xl space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 drop-shadow-sm">My Schedule</h1>
          <p className="text-lg text-gray-600">
            Organize your day, manage classes, and plan your tasks efficiently.
          </p>
        </div>
        <Button
          onClick={() => setSelectedDate(new Date())}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <CalendarDays className="w-5 h-5" /> Today
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card className="bg-white border-none shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-purple-600" /> Select Date</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-2xl border shadow-lg bg-white flex-shrink-0"
                classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4 w-full",
                    caption: "flex justify-between pt-1 relative items-center",
                    caption_label: "text-lg font-semibold text-gray-800",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-9 w-9 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity duration-200",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-9 font-medium text-sm",
                    row: "flex w-full mt-2",
                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                    day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-700 focus:text-white",
                    day_today: "bg-indigo-100 text-indigo-700 font-bold",
                    day_outside: "text-gray-400 opacity-70",
                    day_disabled: "text-gray-300 opacity-50 cursor-not-allowed",
                    day_range_middle: "aria-selected:bg-indigo-50 aria-selected:text-indigo-700",
                    day_hidden: "invisible",
                  }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="bg-white border-none shadow-xl rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" /> Daily Agenda for {format(selectedDate, 'PPP')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                <div className="p-3 text-center font-bold text-gray-700 border-r border-gray-200">Time</div>
                {weekDays.map(day => (
                  <div
                    key={day.date.toString()}
                    className={`p-3 text-center font-bold text-sm transition-all duration-200 ease-in-out border-r border-gray-200 last:border-r-0 ${
                      isSameDay(day.date, new Date()) ? 'bg-gradient-to-b from-blue-200 to-blue-100 text-blue-800 shadow-inner' : 'text-gray-700'
                    }`}
                  >
                    <div>{day.name}</div>
                    <div className="text-xs text-gray-500 font-normal">{day.fullDate}</div>
                  </div>
                ))}
              </div>

              <div className="divide-y divide-gray-100">
                {timeSlots.map((time, i) => (
                  <div key={time} className="grid grid-cols-8 min-h-[70px]">
                    <div className={`p-3 text-sm md:text-base font-medium flex items-center justify-center border-r border-gray-200 ${
                      i + 8 === currentHour ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600'
                    }`}>{time}</div>
                    {weekDays.map(day => {
                      const event = getEventForTimeSlot(day, time)
                      return (
                        <div
                          key={day.date.toString()}
                          className={`p-2 md:p-4 flex items-center justify-center transition-all duration-200 rounded-lg cursor-pointer group m-1 ${
                            event ? 'bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 shadow-md hover:shadow-lg' : 'hover:bg-gray-50'
                          } ${isSameDay(day.date, selectedDate) ? 'ring-2 ring-purple-300 ring-offset-1' : ''}`}
                          onClick={() => handleSlotClick(day, time)}
                        >
                          {event && (
                            <div className="w-full text-xs md:text-sm font-semibold flex flex-col items-center text-center">
                              <span className="flex items-center gap-1 text-purple-800">
                                {getEventIcon(event)}
                                {event.title}
                              </span>
                              <span className="text-[11px] text-gray-500 mt-1">{event.location}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Modal */}
      <Transition appear show={eventModal.open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setEventModal({ open: false, event: null })}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-3xl font-bold leading-6 text-gray-900 mb-4 flex items-center gap-2"
                >
                  <Info className="w-7 h-7 text-blue-600" /> Event Details
                </Dialog.Title>
                <div className="mt-2 space-y-4">
                  <p className="text-lg text-gray-700"><span className="font-semibold text-blue-800">Title:</span> {eventModal.event?.title}</p>
                  {eventModal.event?.description && <p className="text-md text-gray-600 flex items-start gap-1"><AlignLeft className="w-4 h-4 text-gray-500 mt-1" /> <span className="font-semibold text-blue-800">Description:</span> {eventModal.event.description}</p>}
                  <p className="text-md text-gray-700 flex items-center gap-1"><BookOpen className="w-4 h-4 text-blue-500" /> <span className="font-semibold text-blue-800">Type:</span> {eventModal.event?.type === 'class' ? 'Class' : 'Custom Event'}</p>
                  <p className="text-md text-gray-700 flex items-center gap-1"><CalendarDays className="w-4 h-4 text-blue-500" /> <span className="font-semibold text-blue-800">Date:</span> {eventModal.event?.date ? format(new Date(eventModal.event.date), 'PPP') : ''}</p>
                  <p className="text-md text-gray-700 flex items-center gap-1"><Clock className="w-4 h-4 text-blue-500" /> <span className="font-semibold text-blue-800">Time:</span> {eventModal.event?.startTime} - {eventModal.event?.endTime}</p>
                  {eventModal.event?.location && <p className="text-md text-gray-700 flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-500" /> <span className="font-semibold text-blue-800">Location:</span> {eventModal.event.location}</p>}
                  {eventModal.event?.priority && ( // Only show if it's a custom event with priority
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-800">Priority:</span>
                      <span className={`px-3 py-1 rounded-full text-white text-sm ${getPriorityColor(eventModal.event.priority)}`}>
                        {eventModal.event.priority}
                      </span>
                    </div>
                  )}
                  {eventModal.event?.isCompleted !== undefined && ( // Only show if it's a custom event with completion status
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-800">Completed:</span>
                      {eventModal.event.isCompleted ? 
                        <CheckCircle className="w-5 h-5 text-green-500" /> : 
                        <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out text-lg"
                    onClick={() => setEventModal({ open: false, event: null })}
                  >
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Schedule Setup Modal */}
      <Transition appear show={scheduleSetupModal.open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setScheduleSetupModal({ ...scheduleSetupModal, open: false })}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-3xl font-bold leading-6 text-gray-900 mb-4 flex items-center gap-2"
                >
                  <PlusCircle className="w-7 h-7 text-green-600" /> Set Up Schedule Block
                </Dialog.Title>

                <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="setup-date" className="block text-base font-medium text-gray-700 mb-2">Date</Label>
                      <Input
                        id="setup-date"
                        type="date"
                        value={scheduleSetupModal.date ? format(scheduleSetupModal.date, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setScheduleSetupModal({ ...scheduleSetupModal, date: new Date(e.target.value) })}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-time" className="block text-base font-medium text-gray-700 mb-2">Start Time</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={scheduleSetupModal.startTime}
                          onChange={(e) => setScheduleSetupModal({ ...scheduleSetupModal, startTime: e.target.value })}
                          className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-time" className="block text-base font-medium text-gray-700 mb-2">End Time</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={scheduleSetupModal.endTime}
                          onChange={(e) => setScheduleSetupModal({ ...scheduleSetupModal, endTime: e.target.value })}
                          className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="setup-title" className="block text-base font-medium text-gray-700 mb-2">Title <span className="text-red-500">*</span></Label>
                    <Input
                      id="setup-title"
                      type="text"
                      value={scheduleSetupModal.title}
                      onChange={(e) => setScheduleSetupModal({ ...scheduleSetupModal, title: e.target.value })}
                      required
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="setup-description" className="block text-base font-medium text-gray-700 mb-2">Description</Label>
                    <Textarea
                      id="setup-description"
                      value={scheduleSetupModal.description}
                      onChange={(e) => setScheduleSetupModal({ ...scheduleSetupModal, description: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label className="block text-base font-medium text-gray-700 mb-2">Priority</Label>
                    <RadioGroup
                      value={scheduleSetupModal.priority}
                      onValueChange={(value: 'Urgent' | 'More Important' | 'Important' | 'Less Important') => setScheduleSetupModal({ ...scheduleSetupModal, priority: value })}
                      className="flex flex-wrap gap-4"
                    >
                      {[ 'Urgent', 'More Important', 'Important', 'Less Important'].map((p) => (
                        <div key={p} className="flex items-center gap-2">
                          <RadioGroupItem value={p} id={`priority-${p}`} className="peer sr-only" />
                          <Label
                            htmlFor={`priority-${p}`}
                            className={`flex items-center justify-center px-4 py-2 rounded-full cursor-pointer transition-all duration-200 ease-in-out text-sm font-medium
                              ${scheduleSetupModal.priority === p
                                ? `${getPriorityColor(p)} text-white shadow-md`
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {p}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-completed"
                      checked={scheduleSetupModal.isCompleted}
                      onCheckedChange={(checked) => setScheduleSetupModal({ ...scheduleSetupModal, isCompleted: Boolean(checked) })}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Label htmlFor="is-completed" className="text-base font-medium text-gray-700">Mark as Completed</Label>
                  </div>

                  <div className="mt-6">
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" /> Save Schedule Item
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}