'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (role === 'FACULTY' && !position) {
      setError('Position is required for faculty.');
      return;
    }
    if (role === 'STUDENT' && (!courseId || !semester)) {
      setError('Course and semester are required for students.');
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
      } else {
        setError(data.error || 'Sign up failed.');
      }
    } catch {
      setError('Sign up failed.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md border border-blue-200">
        <h2 className="text-3xl font-black text-blue-800 mb-6 text-center">Sign Up</h2>
        {success ? (
          <div className="text-center">
            <div className="text-green-600 text-lg font-bold mb-2">Sign up successful!</div>
            <div className="mb-4">Your token ID is:</div>
            <div className="text-2xl font-mono font-bold bg-blue-100 text-blue-700 rounded-lg px-4 py-2 inline-block mb-4">{token}</div>
            <div className="text-gray-600 mb-4">You will be able to log in after admin approval.</div>
            <Link href="/auth/login" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">Go to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-bold mb-1">Role</label>
              <select className="w-full border-2 border-blue-200 rounded-lg p-2 text-lg" value={role} onChange={e => setRole(e.target.value)} required>
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Name</label>
              <input type="text" className="w-full border-2 border-blue-200 rounded-lg p-2 text-lg" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block font-bold mb-1">Email</label>
              <input type="email" className="w-full border-2 border-blue-200 rounded-lg p-2 text-lg" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block font-bold mb-1">Department</label>
              <select className="w-full border-2 border-blue-200 rounded-lg p-2 text-lg" value={department} onChange={e => setDepartment(e.target.value)} required>
                <option value="">Select Department</option>
                {departments.map(dep => (
                  <option key={dep.id} value={dep.name}>{dep.name}</option>
                ))}
              </select>
            </div>
            {role === 'FACULTY' && (
              <div>
                <label className="block font-bold mb-1">Position</label>
                <input type="text" className="w-full border-2 border-blue-200 rounded-lg p-2 text-lg" value={position} onChange={e => setPosition(e.target.value)} required={role === 'FACULTY'} />
              </div>
            )}
            {role === 'STUDENT' && (
              <>
                <div>
                  <label className="block font-bold mb-1">Course</label>
                  <select className="w-full border-2 border-blue-200 rounded-lg p-2 text-lg" value={courseId} onChange={e => setCourseId(e.target.value)} required={role === 'STUDENT'}>
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Semester</label>
                  <input type="number" min={1} max={12} className="w-full border-2 border-blue-200 rounded-lg p-2 text-lg" value={semester} onChange={e => setSemester(e.target.value)} required={role === 'STUDENT'} />
                </div>
              </>
            )}
            <div>
              <label className="block font-bold mb-1">Password</label>
              <input type="password" className="w-full border-2 border-blue-200 rounded-lg p-2 text-lg" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block font-bold mb-1">Confirm Password</label>
              <input type="password" className="w-full border-2 border-blue-200 rounded-lg p-2 text-lg" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            {error && <div className="text-red-600 font-bold text-center">{error}</div>}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-full text-lg hover:bg-blue-700 transition" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
} 