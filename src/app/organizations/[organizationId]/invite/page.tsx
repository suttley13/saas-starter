import { redirect } from "next/navigation";
import Link from "next/link";
import { Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { InviteMembersForm } from "@/components/organizations/invite-members-form";

export const metadata = {
  title: "Invite Members",
  description: "Invite members to your organization",
};

interface InviteMembersPageProps {
  params: { organizationId: string };
}

export default async function InviteMembersPage({
  params,
}: InviteMembersPageProps) {
  // Make sure to await params
  const { organizationId } = await Promise.resolve(params);
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const organization = await db.organization.findUnique({
    where: {
      id: organizationId,
    },
    include: {
      memberships: true,
    },
  });

  if (!organization) {
    redirect("/dashboard");
  }

  // Check if user is a member of this organization
  const membership = organization.memberships.find(
    (member) => member.userId === user.id
  );

  if (!membership) {
    redirect("/dashboard");
  }

  // Check if user is an admin (only admins can invite)
  const isAdmin = membership.role === "ADMIN";

  if (!isAdmin) {
    redirect(`/organizations/${organization.id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <Toaster position="top-right" />
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Invite Members</h1>
          <Link href={`/organizations/${organization.id}`}>
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300">
              Back to Organization
            </Button>
          </Link>
        </div>

        <InviteMembersForm organizationId={organization.id} />
      </div>
    </div>
  );
} 