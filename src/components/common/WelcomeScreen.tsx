"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface WelcomeScreenProps {
  userType: "admin" | "faculty" | "student";
}

const welcomeMessages = [
  "Welcome to Campus Mind!",
  "Great to see you again!",
  "Ready to make today amazing?",
  "Let's achieve something great today!",
  "Your journey continues here!",
  "Time to shine!",
  "Let's make today count!",
  "Welcome back, superstar!",
  "Ready to learn and grow?",
  "Your success story continues!",
];

export function WelcomeScreen({ userType }: WelcomeScreenProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);
  const [audio] = useState(typeof window !== "undefined" ? new Audio("/welcome.mp3") : null);

  const getRoleBadge = () => {
    switch (userType) {
      case "admin":
        return <Badge variant="destructive">Administrator</Badge>;
      case "faculty":
        return <Badge variant="secondary">Faculty</Badge>;
      case "student":
        return <Badge variant="outline">Student</Badge>;
      default:
        return null;
    }
  };

  const getWelcomeMessage = () => {
    const time = new Date().getHours();
    let greeting = "";
    
    if (time < 12) greeting = "Good morning";
    else if (time < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    return `${greeting}, ${session?.user?.name || "User"}! ${randomMessage}`;
  };

  useEffect(() => {
    if (audio) {
      audio.play().catch(error => {
        console.log("Audio playback failed:", error);
      });
    }

    const timer = setTimeout(() => {
      setShowWelcome(false);
      router.push(`/${userType}/dashboard`);
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio, router, userType]);

  return (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-white z-50 flex items-center justify-center"
        >
          <div className="text-center space-y-6">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {getWelcomeMessage()}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {getRoleBadge()}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500"
            >
              Redirecting to your dashboard...
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "linear" }}
              className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 