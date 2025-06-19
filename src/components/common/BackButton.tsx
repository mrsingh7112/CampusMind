"use client";
import { useRouter } from 'next/navigation';

export default function BackButton({ className = "" }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center px-5 py-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold shadow-lg hover:from-gray-900 hover:to-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 ${className}`}
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      Back
    </button>
  );
} 