"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";
import { MemberActions } from "@/components/organizations/member-actions";
import { UserAvatar } from "@/components/ui/user-avatar";

// Define a simplified user type that matches our needs
interface UserInfo {
  id: string;
  email: string;
  displayName?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
}

// Define a membership type for organization members
interface MembershipInfo {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  user: UserInfo;
}

// Define the organization type
interface OrganizationInfo {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  memberships: MembershipInfo[];
}

export default function OrganizationPage({
  params,
}: {
  params: { organizationId: string };
}) {
  // Simply use the params directly - no need for React.use here
  const { organizationId } = params;
  
  const [user, setUser] = useState<UserInfo | null>(null);
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo | null>(null);
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
        
        setUser(userData.user);
        
        // Fetch organization data
        const orgResponse = await fetch(`/api/organizations/${organizationId}`);
        
        if (!orgResponse.ok) {
          window.location.href = "/dashboard";
          return;
        }
        
        const orgData = await orgResponse.json();
        setOrganizationInfo(orgData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [organizationId]);

  if (loading || !user || !organizationInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Check if user is a member of this organization
  const isMember = organizationInfo.memberships.some(
    (member) => member.userId === user.id
  );

  if (!isMember) {
    window.location.href = "/dashboard";
    return null;
  }

  // Get current user's membership to check if they're an admin
  const currentUserMembership = organizationInfo.memberships.find(
    (member) => member.userId === user.id
  );
  
  const isAdmin = currentUserMembership?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <Toaster position="top-right" />
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">{organizationInfo.name}</h1>
          <div className="flex gap-3">
            {!isAdmin && (
              <Link href="/settings/profile">
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300">
                  Edit Profile
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link href="/dashboard">
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300">
                  Back to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Organization Details</h2>
                <p className="mt-2 text-slate-600">
                  Slug: {organizationInfo.slug}
                </p>
                <p className="text-slate-600">
                  Created: {new Date(organizationInfo.createdAt).toLocaleDateString()}
                </p>
                <p className="text-slate-600">
                  Members: {organizationInfo.memberships.length}
                </p>
              </div>
              {isAdmin && (
                <Link href={`/organizations/${organizationInfo.id}/settings`}>
                  <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300">
                    Organization Settings
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Team Members</h2>
              {isAdmin && (
                <Link href={`/organizations/${organizationInfo.id}/invite`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 transition-colors">
                    Invite Members
                  </Button>
                </Link>
              )}
            </div>
            
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                {organizationInfo.memberships.length === 0 ? (
                  <p className="text-slate-600">No team members found.</p>
                ) : (
                  organizationInfo.memberships.map((membership) => (
                    <Link 
                      key={membership.id} 
                      href={`/organizations/${organizationInfo.id}/users/${membership.userId}`}
                      className={`flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 block ${
                        membership.userId === user.id ? 'border-l-4 border-blue-500 pl-2' : ''
                      }`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <UserAvatar user={membership.user} size="md" />
                        <div>
                          <p className="font-medium text-slate-800">
                            {membership.user.displayName || membership.user.email}
                          </p>
                          <p className="text-sm text-slate-500 flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={`${membership.role === 'ADMIN' ? 'text-blue-600 font-medium' : ''}`}>
                              {membership.role}
                            </span>
                            {membership.userId === user.id && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">You</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      {isAdmin && membership.userId !== user.id && membership.userId !== organizationInfo.ownerId && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <MemberActions 
                            memberId={membership.id} 
                            organizationId={organizationInfo.id}
                            memberName={membership.user.displayName || membership.user.email}
                          />
                        </div>
                      )}
                    </Link>
                  ))
                )}
              </div>
              
              {isAdmin && (
                <div className="mt-6">
                  <Link href={`/organizations/${organizationInfo.id}/invite`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
                      Invite More Members
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 