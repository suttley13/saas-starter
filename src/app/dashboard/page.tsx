import Link from "next/link";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from 'next/cache';

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export const metadata = {
  title: "Dashboard",
  description: "Welcome to your Dashboard",
};

export default async function Dashboard() {
  // Disable caching to ensure we always get fresh data
  noStore();
  
  // Get the current user
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user's organizations
  const memberships = await db.membership.findMany({
    where: {
      userId: user.id
    },
    include: {
      organization: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Format organizations data
  const organizations = memberships.map(membership => ({
    id: membership.organization.id,
    name: membership.organization.name,
    slug: membership.organization.slug,
    role: membership.role,
    isOwner: membership.organization.ownerId === user.id
  }));

  // Simplified version - just a basic dashboard with minimal DB queries
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <Link href="/organizations/new">
            <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
              Create Organization
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">Welcome back, {user.name || user.email}!</h2>
            <p className="mt-2 text-slate-600">
              This is your dashboard where you can manage your organizations and settings.
            </p>
          </div>

          {organizations.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-slate-800">Your Organizations</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {organizations.map((org) => (
                  <Link 
                    key={org.id}
                    href={`/organizations/${org.id}`}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 
                    shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <h3 className="text-lg font-medium text-slate-800 group-hover:text-blue-700">
                      {org.name}
                    </h3>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-700">
                        {org.role}
                      </span>
                      {org.isOwner && (
                        <span className="text-xs px-2 py-1 bg-blue-100 rounded-full text-blue-700">
                          Owner
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-800">Quick Links</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link 
                href="/settings/profile"
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 
                shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <h3 className="text-lg font-medium text-slate-800 group-hover:text-blue-700">Profile Settings</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Update your profile information and preferences
                </p>
              </Link>
              <Link 
                href="/organizations/new"
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 
                shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <h3 className="text-lg font-medium text-slate-800 group-hover:text-blue-700">Create Organization</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Start a new organization for your team
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 