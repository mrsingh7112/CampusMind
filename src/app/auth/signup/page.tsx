'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

export default function SignupPage() {
  const [role, setRole] = useState('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semester, setSemester] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/departments')
      .then(res => res.json())
      .then(data => setDepartments(data || []));
  }, []);

  useEffect(() => {
    if (department) {
      const dept = departments.find(d => d.name === department);
      setCourses(dept ? dept.courses : []);
    } else {
      setCourses([]);
    }
    setCourseId('');
  }, [department, departments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!name || !email || !department || !password || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (role === 'FACULTY' && !position) {
      toast({
        title: "Missing Field",
        description: "Position is required for faculty.",
        variant: "destructive",
      });
      return;
    }
    if (role === 'STUDENT' && (!courseId || !semester)) {
      toast({
        title: "Missing Fields",
        description: "Course and semester are required for students.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          department,
          position: role === 'FACULTY' ? position : undefined,
          courseId: role === 'STUDENT' ? courseId : undefined,
          semester: role === 'STUDENT' ? semester : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.tokenId) {
        setToken(data.tokenId);
        setSuccess(true);
        toast({
          title: "Sign Up Successful!",
          description: "Your account has been created. You will be able to log in after admin approval.",
          variant: "success",
        });
      } else {
        setError(data.error || 'Sign up failed.');
        toast({
          title: "Sign Up Failed",
          description: data.error || 'An unexpected error occurred during sign up.',
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setError('Sign up failed.');
      toast({
        title: "Sign Up Failed",
        description: err.message || 'An unexpected error occurred during sign up.',
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <Card className="rounded-2xl shadow-2xl p-10 w-full max-w-md border border-gray-100">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-gray-900 mb-2">Sign Up</CardTitle>
          <CardDescription className="text-gray-600">Create your CampusMind account</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {success ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600 mb-2">Sign up successful!</p>
              <p className="text-gray-700 mb-4">Your unique token ID is:</p>
              <div className="text-2xl font-mono font-bold bg-blue-50 text-blue-700 rounded-lg px-4 py-3 inline-block mb-6 select-all">{token}</div>
              <p className="text-sm text-gray-500 mb-6">Please save this token. You will be able to log in after admin approval.</p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="FACULTY">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input type="text" id="name" placeholder="Your Full Name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input type="email" id="email" placeholder="your.email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dep => (
                      <SelectItem key={dep.id} value={dep.name}>{dep.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {role === 'FACULTY' && (
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <Input type="text" id="position" placeholder="e.g., Professor, Lecturer" value={position} onChange={e => setPosition(e.target.value)} required={role === 'FACULTY'} />
                </div>
              )}
              {role === 'STUDENT' && (
                <>
                  <div>
                    <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <Select value={courseId} onValueChange={setCourseId} disabled={!department}>
                      <SelectTrigger id="course">
                        <SelectValue placeholder="Select Course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={String(course.id)}>{course.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <Input type="number" id="semester" min={1} max={12} placeholder="e.g., 1" value={semester} onChange={e => setSemester(e.target.value)} required={role === 'STUDENT'} />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input type="password" id="password" placeholder="********" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <Input type="password" id="confirm-password" placeholder="********" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </form>
          )}
          <div className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Login here</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 