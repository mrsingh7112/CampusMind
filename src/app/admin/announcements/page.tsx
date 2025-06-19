"use client"
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Users, Clipboard, X, MoreHorizontal, PlusCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from '@/components/ui/use-toast'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import useSWR from 'swr'
import CreateAnnouncement from '@/components/admin/CreateAnnouncement'

interface Announcement {
  id: number
  title: string
  content: string
  audience: string
  fileUrl?: string
  createdAt: string
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AnnouncementsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { data: recipients, error, isLoading, mutate } = useSWR('/api/admin/announcements/recipients', fetcher, { refreshInterval: 5000 })
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
  const [announcement, setAnnouncement] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [customContent, setCustomContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    const fetchRecipients = async () => {
      setLoading(true)
      setErrorMessage('')
      try {
        const res = await fetch('/api/admin/announcements/recipients')
        if (!res.ok) throw new Error('Failed to fetch recipients')
        const data = await res.json()
        mutate(data)
      } catch (err: any) {
        setErrorMessage('Failed to load recipients')
        toast({
          title: "Error",
          description: err.message || "Failed to load recipients.",
          variant: "destructive",
        });
      } finally {
        setLoading(false)
      }
    }
    fetchRecipients()
  }, [mutate])

  // Sort by Announcement ID (desc), then Recipient Name (asc)
  const sortedRecipients = [...(recipients || [])].sort((a, b) => {
    if (b.announcementId !== a.announcementId) {
      return b.announcementId - a.announcementId
    }
    return a.name.localeCompare(b.name)
  })

  // Filter by search and by sentAt (only show announcements sent within last 24 hours)
  const now = Date.now();
  const filteredRecipients = sortedRecipients.filter(r => {
    // Filter by search
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.recipientType.toLowerCase().includes(searchTerm.toLowerCase());
    // Filter by sentAt (within 24 hours)
    if (!r.sentAt) return matchesSearch; // Show if sentAt missing (legacy)
    const sentAtTime = new Date(r.sentAt).getTime();
    return matchesSearch && (now - sentAtTime < 24 * 60 * 60 * 1000);
  })

  // Fetch announcement details for modal
  const openRecipientModal = async (recipient: any) => {
    setSelected(recipient)
    setModalOpen(true)
    setCustomContent(recipient.customContent || '')
    setModalLoading(true)
    try {
      const res = await fetch(`/api/admin/announcements/${recipient.announcementId}`)
      if (!res.ok) throw new Error('Failed to fetch announcement')
      const data = await res.json()
      setAnnouncement(data)
    } catch (err: any) {
      setAnnouncement(null)
      toast({
        title: "Error",
        description: err.message || "Failed to load announcement details.",
        variant: "destructive",
      });
    } finally {
      setModalLoading(false)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelected(null)
    setAnnouncement(null)
    setCustomContent('')
  }

  const handleSaveCustomContent = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await fetch(`/api/admin/announcements/${selected.announcementId}/recipients`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: selected.recipientId, customContent }),
      })
      mutate(prev => prev.map(r => r.id === selected.id ? { ...r, customContent } : r))
      closeModal()
      toast({
        title: "Custom Content Saved",
        description: "The custom content has been successfully saved.",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to save custom content.',
        variant: "destructive",
      });
    } finally {
      setSaving(false)
    }
  }

  // Personalized preview message
  const getPersonalizedMessage = () => {
    if (!announcement || !selected) return ''
    const greeting = getGreeting()
    if (selected.recipientType === 'FACULTY') {
      return `${greeting}, ${selected.name},\n\nPlease find attached the examination datesheet for your course(s).\n\nExam Rules for invigilation:\n- Arrive 30 minutes before the exam.\n- Ensure all students follow guidelines.\n- No electronic devices allowed in the exam hall.\n- Submit attendance after the exam.\n\nThank you for your cooperation!\n\nRegards,\nExamination Cell`;
    } else {
      return `${greeting}, ${selected.name},\n\n${announcement.content}`;
    }
  }

  // Copy preview to clipboard
  const handleCopyPreview = () => {
    navigator.clipboard.writeText(getPersonalizedMessage())
    toast({
      title: "Copied to Clipboard",
      description: "Personalized message copied to clipboard.",
    });
  }

  const handleDeleteRecipient = async (id: string) => {
    if (confirm('Are you sure you want to delete this recipient?')) {
      try {
        const response = await fetch(`/api/admin/announcements/recipients/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          toast.success('Recipient deleted successfully');
          mutate(); // Revalidate data
        } else {
          toast.error('Failed to delete recipient');
        }
      } catch (error) {
        console.error('Error deleting recipient:', error);
        toast.error('Failed to delete recipient');
      }
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading recipients...</div>
  if (error) return <div className="text-center py-8 text-red-500">Failed to load recipients.</div>

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Announcements</h1>

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          {showCreateForm ? 'View Recipients' : 'Create New Announcement'}
        </Button>
      </div>

      {showCreateForm ? (
        <CreateAnnouncement />
      ) : (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM4.502 19.5a2.25 2.25 0 0 1-2.247-2.195c-.063-.532.148-.996.357-1.288.33-.447.843-1.015 1.806-1.776L9.5 14.25v2.25h1.5a.75.75 0 0 1 0 1.5H9.5v2.25l-3.562-2.103a.75.75 0 0 0-.877.087l-.025.021-.059.055C4.053 21.291 2.25 21.75 2.25 19.5Zm13.498-9.75a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 .75.75h2.25a.75.75 0 0 0 .75-.75V10.5a.75.75 0 0 0-.75-.75h-2.25ZM12 12.75a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5H12Z" clipRule="evenodd" />
              </svg>
              Recipient List
            </CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search by name or type..."
                  className="pl-8 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <span className="text-lg font-semibold text-gray-700">Total: {filteredRecipients.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Recipient Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Custom Content</TableHead>
                  <TableHead>Read</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipients.map((recipient: any) => (
                  <TableRow key={recipient.id}>
                    <TableCell className="font-medium">{recipient.announcementId}</TableCell>
                    <TableCell>{recipient.name}</TableCell>
                    <TableCell><Badge variant="secondary">{recipient.recipientType}</Badge></TableCell>
                    <TableCell>{recipient.customContent || '--'}</TableCell>
                    <TableCell>{recipient.read ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{format(parseISO(recipient.updatedAt), 'MMM dd, yyyy hh:mm a')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(recipient.announcementId.toString())}>
                            Copy recipient ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRecipient(recipient.id.toString())}>
                            Delete Recipient
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-6">
          <DialogHeader className="relative">
            <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">Announcement Details</DialogTitle>
            <DialogDescription className="text-gray-600 mb-4">
              View and customize content for {selected?.name} ({selected?.recipientType}).
            </DialogDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 rounded-full"
              onClick={closeModal}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          
          {modalLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading announcement...</p>
            </div>
          ) : announcement ? (
            <div className="space-y-4 py-4 border-t border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold text-white shadow-md">
                  {getInitials(selected?.name || '')}
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-800">{selected?.name}</p>
                  <p className="text-sm text-gray-500">{selected?.recipientType}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Announcement Title:</p>
                <Input value={announcement.title} readOnly className="font-semibold text-gray-900" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Original Content:</p>
                <Textarea
                  value={announcement.content}
                  readOnly
                  rows={6}
                  className="text-md text-gray-800 resize-none"
                />
                {announcement.fileUrl && (
                  <a href={announcement.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1 mt-2">
                    <Clipboard className="w-4 h-4" /> View Attachment
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Personalized Preview:</p>
                <Textarea
                  value={getPersonalizedMessage()}
                  readOnly
                  rows={8}
                  className="font-mono text-sm bg-gray-50 border border-gray-200 shadow-inner resize-none"
                />
                <Button onClick={handleCopyPreview} className="w-full" variant="outline">
                  <Clipboard className="w-4 h-4 mr-2" /> Copy Preview
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Custom Content (Optional):</p>
                <Textarea
                  value={customContent}
                  onChange={e => setCustomContent(e.target.value)}
                  placeholder="Add custom content for this recipient..."
                  rows={4}
                  className="shadow-sm resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-red-500 font-medium">Failed to load announcement details.</div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSaveCustomContent} disabled={saving || modalLoading}>
              {saving ? 'Saving...' : 'Save Custom Content'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 