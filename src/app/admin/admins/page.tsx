'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { PlusCircle, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    console.log("AdminsPage: Session User:", session?.user);
    console.log("AdminsPage: isSuperAdmin:", session?.user?.isSuperAdmin);
  }, [session]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/admins');
      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }
      const data = await response.json();
      setAdmins(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/admin/add-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add admin');
      }

      toast({
        title: 'Success',
        description: data.message,
        variant: 'default',
      });
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setShowAddAdminForm(false);
      fetchAdmins(); // Refresh the list of admins
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Management</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Search admins by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        {session?.user?.isSuperAdmin && (
          <Button onClick={() => setShowAddAdminForm(!showAddAdminForm)} className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> {showAddAdminForm ? 'Cancel Add' : 'Add New Admin'}
          </Button>
        )}
      </div>

      {showAddAdminForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Administrator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Existing Administrators</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading admins...</div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No administrators found.</div>
          ) : (
            <div className="space-y-4">
              {filteredAdmins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
                  <div>
                    <p className="font-semibold text-lg">{admin.name}</p>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                    <p className="text-xs text-gray-400">Added: {new Date(admin.createdAt).toLocaleDateString()}</p>
                  </div>
                  {/* Add actions like Edit/Delete later if needed */}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 