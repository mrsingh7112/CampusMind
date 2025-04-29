import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header/Navigation Section */}
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            CampusMind
          </Link>
          <div className="space-x-6">
            <Link href="/auth/login" className="text-gray-600 hover:text-blue-600">
              Login
            </Link>
            <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Welcome to Your Campus Hub
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect, Learn, and Grow with your Campus Community
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Link href="/courses" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-blue-600 text-2xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Course Management</h3>
            <p className="text-gray-600">Access your courses, assignments, and study materials in one place</p>
          </Link>

          <Link href="/community" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-blue-600 text-2xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Student Community</h3>
            <p className="text-gray-600">Connect with classmates, join study groups, and share resources</p>
          </Link>

          <Link href="/events" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-blue-600 text-2xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Events & Activities</h3>
            <p className="text-gray-600">Stay updated with campus events, workshops, and activities</p>
          </Link>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link href="/auth/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-block">
            Get Started Now
          </Link>
          <p className="mt-4 text-gray-500">
            Join thousands of students already using CampusMind
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <p className="text-gray-600 text-sm">Your complete campus management solution for modern education</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/courses" className="hover:text-blue-600">Courses</Link></li>
                <li><Link href="/resources" className="hover:text-blue-600">Resources</Link></li>
                <li><Link href="/community" className="hover:text-blue-600">Community</Link></li>
                <li><Link href="/help" className="hover:text-blue-600">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Email: support@campusmind.com</li>
                <li>Phone: (555) 123-4567</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <span className="text-gray-600 cursor-pointer">📱</span>
                <span className="text-gray-600 cursor-pointer">💻</span>
                <span className="text-gray-600 cursor-pointer">📧</span>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-600 mt-8">
            © 2024 CampusMind. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
} 