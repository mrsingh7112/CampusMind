"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfileSettingsProps {
  userType: "admin" | "faculty" | "student";
}

export function ProfileSettings({ userType }: ProfileSettingsProps) {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");

  const user = session?.user;

  // Load settings from localStorage on mount (for language and notifications)
  useEffect(() => {
    setLanguage(localStorage.getItem('language') || 'en');
    setNotifications(localStorage.getItem('notifications') === 'true');
    setName(user?.name || "");
    setEmail(user?.email || "");
    console.log("ProfileSettings: Session User:", session?.user);
    console.log("ProfileSettings: Profile Picture:", session?.user?.profilePicture);
  }, [user, session]);

  // Save language and notifications to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('notifications', notifications.toString());
  }, [notifications]);

  const getWelcomeMessage = () => {
    const time = new Date().getHours();
    let greeting = "";
    
    if (time < 12) greeting = "Good morning";
    else if (time < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    return `${greeting}, ${user?.name || "User"}!`;
  };

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

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPassword("");
        setShowChangePassword(false);
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred while changing password.');
    }
  };

  const handleEditDetails = async () => {
    try {
      const response = await fetch('/api/profile/update-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        // Update session client-side to reflect changes immediately
        await update({
          user: {
            name: name,
            email: email,
          },
        });
        setShowEditDetails(false);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating profile.');
    }
  };

  const handleAddPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/profile/upload-photo', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          alert(data.message);
          // Update session to reflect the new image
          await update({
            user: {
              profilePicture: data.fileUrl,
            },
          });
        } else {
          alert(data.message || 'Failed to upload photo');
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('An error occurred while uploading photo.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.profilePicture || ""} alt={user?.name || ""} />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{getWelcomeMessage()}</CardTitle>
              <CardDescription className="mt-1">
                {getRoleBadge()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={theme}
                onValueChange={(value) => setTheme(value)}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={language}
                onValueChange={setLanguage}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Email Notifications</Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>

          {/* New Profile Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button onClick={() => setShowEditDetails(!showEditDetails)} variant="outline">
              {showEditDetails ? "Cancel Edit" : "Edit Details"}
            </Button>
            <Button onClick={() => setShowChangePassword(!showChangePassword)} variant="outline">
              {showChangePassword ? "Cancel Change Password" : "Change Password"}
            </Button>
            <label htmlFor="photo-upload" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-accent text-accent-foreground hover:bg-accent/80 h-10 px-4 py-2 cursor-pointer">
              Add Photo
              <Input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleAddPhoto}
                className="hidden"
              />
            </label>
          </div>

          {/* Edit Details Form */}
          {showEditDetails && (
            <Card className="mt-4 p-4 border shadow-sm">
              <CardTitle className="mb-4 text-xl">Edit Your Details</CardTitle>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button onClick={handleEditDetails}>Save Details</Button>
              </div>
            </Card>
          )}

          {/* Change Password Form */}
          {showChangePassword && (
            <Card className="mt-4 p-4 border shadow-sm">
              <CardTitle className="mb-4 text-xl">Change Your Password</CardTitle>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <Button onClick={handleChangePassword}>Change Password</Button>
              </div>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 