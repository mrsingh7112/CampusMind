"use client";

import { ProfileSettings } from "@/components/common/ProfileSettings";

export default function FacultyProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      <ProfileSettings userType="faculty" />
    </div>
  );
}