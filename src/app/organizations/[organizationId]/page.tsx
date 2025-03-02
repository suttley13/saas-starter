"use client";

import { redirect, useRouter } from "next/navigation";
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

interface OrganizationPageProps {
  params: { organizationId: string };
}

export default function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const router = useRouter();
  const { organizationId } = params;
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data first
        const userResponse = await fetch("/api/auth/session");
        const userData = await userResponse.json();
        
        if (!userData?.user) {
          router.push("/sign-in");
          return;
        }
        
        setUser(userData.user);

        // Then fetch organization data
        const orgResponse = await fetch(`/api/organizations/${organizationId}`);
        if (!orgResponse.ok) {
          throw new Error('Failed to fetch organization');
        }
        const orgData = await orgResponse.json();
        setOrganization(orgData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizationId, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!organization || !user) {
    return <div>Organization not found</div>;
  }

  // Check if user is a member of this organization
  const isMember = organization.memberships.some(
    (member) => member.userId === user.id
  );

  if (!isMember) {
    return (
      <div>You are not a member of this organization</div>
    );
  }

  // Get current user's membership to check if they're an admin
  const currentUserMembership = organization.memberships.find(
    (member) => member.userId === user.id
  );
  
  const isAdmin = currentUserMembership?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <Toaster position="top-right" />
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">{organization.name}</h1>
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
                  Slug: {organization.slug}
                </p>
                <p className="text-slate-600">
                  Created: {new Date(organization.createdAt).toLocaleDateString()}
                </p>
                <p className="text-slate-600">
                  Members: {organization.memberships.length}
                </p>
              </div>
              {isAdmin && (
                <Link href={`/organizations/${organization.id}/settings`}>
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
                <Link href={`/organizations/${organization.id}/invite`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 transition-colors">
                    Invite Members
                  </Button>
                </Link>
              )}
            </div>
            
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                {organization.memberships.length === 0 ? (
                  <p className="text-slate-600">No team members found.</p>
                ) : (
                  organization.memberships.map((membership) => (
                    <Link 
                      key={membership.id} 
                      href={`/organizations/${organization.id}/users/${membership.userId}`}
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
                      
                      {isAdmin && membership.userId !== user.id && membership.userId !== organization.ownerId && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <MemberActions 
                            memberId={membership.id} 
                            organizationId={organization.id}
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
                  <Link href={`/organizations/${organization.id}/invite`}>
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