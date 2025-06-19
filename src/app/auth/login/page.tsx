"use client";

import { useRouter } from "next/navigation";

export default function RoleSelectionPage() {
  const router = useRouter();

  const handleRoleSelect = (role: "admin" | "faculty" | "student") => {
    router.push(`/auth/login/${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl space-y-6 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">Welcome Back!</h1>
        <p className="text-center text-gray-600">Please select your role to continue</p>
        
        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect("admin")}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            Login as Administrator
          </button>
          
          <button
            onClick={() => handleRoleSelect("faculty")}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Login as Faculty
          </button>
          
          <button
            onClick={() => handleRoleSelect("student")}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            Login as Student
          </button>
        </div>
      </div>
    </div>
  );
} 