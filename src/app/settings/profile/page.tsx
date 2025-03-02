import { redirect } from "next/navigation";
import Link from "next/link";

import { ProfileForm } from "@/components/forms/profile-form";
import { ForceSignOut } from "@/components/auth/force-sign-out";
import { getCurrentUser } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Profile Settings",
  description: "Manage your profile settings",
};

export default async function ProfileSettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      displayName: true,
      bio: true,
      profileImageUrl: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Profile Settings</h1>
          <Link href="/dashboard">
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300">
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-slate-600">
              Manage your personal profile information
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <ProfileForm user={user} />
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Session Management</h2>
            <p className="text-slate-600 mb-4">
              If you're experiencing issues with your session or signed in on multiple devices, 
              you can force sign out from all devices. This will clear all your active sessions.
            </p>
            <ForceSignOut />
          </div>
        </div>
      </div>
    </div>
  );
} 