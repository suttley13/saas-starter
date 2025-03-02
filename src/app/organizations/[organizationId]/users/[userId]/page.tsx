"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";

interface UserProfilePageProps {
  params: { 
    organizationId: string;
    userId: string;
  };
}

interface UserInfo {
  id: string;
  email: string;
  displayName?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  // Access params properly in async component
  const organizationId = params.organizationId;
  const userId = params.userId;
  
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [profileUser, setProfileUser] = useState<UserInfo | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Fetch current user
        const userResponse = await fetch("/api/auth/session");
        const userData = await userResponse.json();
        
        if (!userData?.user) {
          window.location.href = "/sign-in";
          return;
        }
        
        setCurrentUser(userData.user);
        
        // Fetch target user profile
        const profileResponse = await fetch(`/api/organizations/${organizationId}/users/${userId}`);
        
        if (!profileResponse.ok) {
          window.location.href = `/organizations/${organizationId}`;
          return;
        }
        
        const profileData = await profileResponse.json();
        setProfileUser(profileData.user);
        setUserRole(profileData.role);
        setOrganizationName(profileData.organizationName);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [organizationId, userId]);

  if (loading || !currentUser || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const isCurrentUser = currentUser.id === profileUser.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">User Profile</h1>
          <Link href={`/organizations/${organizationId}`}>
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300">
              Back to Organization
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            {/* Profile container with explicit Safari-compatible styling */}
            <div className="profile-container flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-8"
                 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              
              {/* Avatar container with fixed dimensions and explicit styling */}
              <div className="profile-avatar-wrapper relative flex-shrink-0" 
                   style={{ 
                     width: '200px', 
                     height: '200px', 
                     position: 'relative',
                     minWidth: '200px',
                     minHeight: '200px',
                     flexShrink: 0,
                     marginBottom: '1.5rem'
                   }}>
                <UserAvatar 
                  user={profileUser} 
                  size="lg" 
                  className="safari-avatar w-full h-full !h-[200px] !w-[200px] rounded-full object-cover border-4 border-slate-200"
                />
              </div>
              
              {/* Profile info with explicit styling for Safari */}
              <div className="profile-info flex-1" style={{ flex: 1 }}>
                <h2 className="text-2xl font-bold text-slate-800 mt-0 md:mt-2" style={{ marginTop: 0 }}>
                  {profileUser.displayName || profileUser.email}
                </h2>
                
                <p className="text-slate-500 mt-1" style={{ marginTop: '0.25rem' }}>
                  {userRole === "ADMIN" ? (
                    <span className="font-medium text-blue-600">Admin</span>
                  ) : (
                    <span>Team Member</span>
                  )}
                </p>
                
                {isCurrentUser && (
                  <div className="mt-6" style={{ marginTop: '1.5rem' }}>
                    <Link href="/settings/profile">
                      <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
                        Edit Your Profile
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* About section with explicit Safari-compatible styling */}
            <div className="mt-8 border-t border-slate-100 pt-6" style={{ marginTop: '2rem', paddingTop: '1.5rem' }}>
              <h3 className="text-lg font-medium text-slate-800 mb-4" style={{ marginBottom: '1rem' }}>About</h3>
              {profileUser.bio ? (
                <p className="text-slate-600 whitespace-pre-wrap">{profileUser.bio}</p>
              ) : (
                <p className="text-slate-400 italic">No bio available</p>
              )}
            </div>

            {/* Contact section with explicit Safari-compatible styling */}
            <div className="mt-8 border-t border-slate-100 pt-6" style={{ marginTop: '2rem', paddingTop: '1.5rem' }}>
              <h3 className="text-lg font-medium text-slate-800 mb-4" style={{ marginBottom: '1rem' }}>Contact</h3>
              <p className="text-slate-600">
                <span className="font-medium">Email:</span> {profileUser.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 