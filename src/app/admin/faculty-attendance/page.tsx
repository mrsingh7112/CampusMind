"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  status: string;
  hasBiometric: boolean;
  lastMarked: string | null;
  tokenId: string;
}

export default function FacultyAttendancePage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch data every 30 seconds
  useEffect(() => {
    fetchFacultyData();
    const interval = setInterval(fetchFacultyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchFacultyData = async () => {
    try {
      const res = await fetch('/api/faculty/realtime');
      if (!res.ok) throw new Error('Failed to fetch faculty data');
      const data = await res.json();
      setFaculty(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch faculty data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupFingerprint = async (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsSetupOpen(true);
  };

  const handleRegisterFingerprint = async () => {
    if (!selectedFaculty) return;
    setIsProcessing(true);

    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported by this browser');
      }

      // Start registration
      const startRes = await fetch('/api/faculty/biometric/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFaculty.id,
          name: selectedFaculty.name,
        }),
      });

      if (!startRes.ok) {
        throw new Error('Failed to start registration');
      }

      const options = await startRes.json();

      // Create credentials
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: base64urlToUint8Array(options.challenge),
          user: {
            ...options.user,
            id: base64urlToUint8Array(options.user.id),
          },
        },
      }) as PublicKeyCredential;

      // Verify registration
      const verifyRes = await fetch('/api/faculty/biometric/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFaculty.id,
          credential: {
            id: credential.id,
            type: credential.type,
            rawId: arrayBufferToBase64url(credential.rawId),
            response: {
              clientDataJSON: arrayBufferToBase64url(credential.response.clientDataJSON),
              attestationObject: arrayBufferToBase64url(credential.response.attestationObject),
            },
          },
        }),
      });

      if (!verifyRes.ok) {
        throw new Error('Failed to verify fingerprint');
      }

      toast.success('Fingerprint registered successfully');
      setIsSetupOpen(false);
      fetchFacultyData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to register fingerprint');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAttendance = async (faculty: Faculty) => {
    setIsProcessing(true);
    try {
      // Get authentication options
      const optionsRes = await fetch('/api/faculty/biometric/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyId: faculty.id }),
      });

      if (!optionsRes.ok) {
        throw new Error('Failed to start authentication');
      }

      const options = await optionsRes.json();

      // Get credential
      const assertion = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: base64urlToUint8Array(options.challenge),
          allowCredentials: options.allowCredentials.map((cred: any) => ({
            ...cred,
            id: base64urlToUint8Array(cred.id),
          })),
        },
      }) as PublicKeyCredential;

      // Mark attendance
      const markRes = await fetch('/api/faculty/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: faculty.id,
          credential: {
            id: assertion.id,
            type: assertion.type,
            rawId: Array.from(new Uint8Array(assertion.rawId)),
          },
        }),
      });

      if (!markRes.ok) {
        throw new Error('Failed to mark attendance');
      }

      toast.success('Attendance marked successfully');
      fetchFacultyData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark attendance');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Faculty Attendance Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Department</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Last Marked</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.map((f) => (
                    <tr key={f.id} className="border-b">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{f.name}</p>
                          <p className="text-sm text-gray-500">{f.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{f.department}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            f.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
                          }
                        >
                          {f.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {f.lastMarked
                          ? format(new Date(f.lastMarked), 'PPpp')
                          : 'Never'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {!f.hasBiometric ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetupFingerprint(f)}
                              disabled={isProcessing}
                            >
                              Setup Fingerprint
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAttendance(f)}
                              disabled={isProcessing}
                            >
                              Mark Attendance
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Setup Fingerprint for {selectedFaculty?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Please follow the prompts to register your fingerprint (Touch ID).
              This will be used to mark your attendance.
            </p>
            <Button
              onClick={handleRegisterFingerprint}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : 'Register Fingerprint'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions for WebAuthn
function base64urlToUint8Array(base64url: string) {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    buffer[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

function arrayBufferToBase64url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const charCode of bytes) {
    str += String.fromCharCode(charCode);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
} 