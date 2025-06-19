"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { WelcomeScreen } from "@/components/common/WelcomeScreen";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface RoleLoginPageProps {
  params: { role: "admin" | "faculty" | "student" };
}

export default function RoleLoginPage({ params }: RoleLoginPageProps) {
  const { role } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [showWelcome, setShowWelcome] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: identifier,
        password,
      });

      if (result?.error) {
        toast({
          title: "Login Error",
          description: result.error,
          variant: "destructive",
        });
      } else if (result?.ok) {
        const session = await getSession();
        const userRole = session?.user?.role as "admin" | "faculty" | "student" | undefined;
        
        if (userRole && userRole.toLowerCase() === role) { 
          setShowWelcome(true);
          toast({
            title: "Login Successful",
            description: `Welcome, ${session?.user?.name || "User"}!`, 
          });
          router.push(`/${userRole.toLowerCase()}/dashboard`);
        } else {
          console.error("User role mismatch or not found in session after login.");
          toast({
            title: "Login Error",
            description: "Login successful, but role mismatch or role not found. Please try again.",
            variant: "destructive",
          });
          router.push("/auth/login"); 
        }
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showWelcome) {
    return <WelcomeScreen userType={role} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl space-y-6 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">{`Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}</h1>
        <p className="text-center text-gray-600">Sign in to your account</p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">{role === "student" ? "Roll Number or Email" : role === "faculty" ? "Employee ID or Email" : "Email"}</Label>
            <Input
              id="identifier"
              type="text"
              placeholder={`Enter your ${role === "student" ? "roll number or email" : role === "faculty" ? "employee ID or email" : "email"}`}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute inset-y-0 right-0 top-6 flex items-center pr-3"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </div>
      </div>
    </div>
  );
} 