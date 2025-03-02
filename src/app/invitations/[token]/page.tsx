import { redirect } from "next/navigation";
import Link from "next/link";
import { Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { AcceptInvitationForm } from "@/components/organizations/accept-invitation-form";

export const metadata = {
  title: "Accept Invitation",
  description: "Join an organization by accepting an invitation",
};

interface AcceptInvitationPageProps {
  params: { token: string };
}

export default async function AcceptInvitationPage({
  params,
}: AcceptInvitationPageProps) {
  // Make sure to await params
  const { token } = await Promise.resolve(params);
  const user = await getCurrentUser();

  // Check if the invitation exists and is valid before redirecting
  const invitation = await db.invitation.findUnique({
    where: {
      token,
    },
    include: {
      organization: true,
    },
  });

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Invalid Invitation</h1>
            <p className="text-slate-600 mb-8">
              This invitation link is invalid or has already been used.
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to sign in, but save the invitation token and organization name in the URL
    // so we can display organization context on the sign-in page
    redirect(`/sign-in?callbackUrl=/invitations/${token}&orgName=${encodeURIComponent(invitation.organization.name)}`);
  }

  // Check if invitation has expired
  const isExpired = new Date() > new Date(invitation.expires);

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Invitation Expired</h1>
            <p className="text-slate-600 mb-8">
              This invitation link has expired. Please ask for a new invitation.
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is already a member
  const existingMembership = await db.membership.findFirst({
    where: {
      userId: user.id,
      organizationId: invitation.organizationId,
    },
  });

  if (existingMembership) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Already a Member</h1>
            <p className="text-slate-600 mb-8">
              You are already a member of this organization.
            </p>
            <Link href={`/organizations/${invitation.organizationId}`}>
              <Button>Go to Organization</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <Toaster position="top-right" />
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-slate-800">Join Organization</h1>
              <p className="text-slate-600 mt-2">
                You've been invited to join {invitation.organization.name}
              </p>
            </div>
            
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Invitation Details</h2>
                <div className="space-y-2">
                  <p className="text-slate-600">
                    <span className="font-medium">Organization:</span> {invitation.organization.name}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">Role:</span> {invitation.role}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">Email:</span> {invitation.email}
                  </p>
                </div>
              </div>
              
              <AcceptInvitationForm 
                token={token}
                organizationName={invitation.organization.name}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 