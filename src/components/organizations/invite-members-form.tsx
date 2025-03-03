"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { logEmailConfig } from "@/lib/mail";

// Define the invitation schema
const invitationSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["ADMIN", "MEMBER"], { 
    message: "Please select a valid role" 
  }),
});

// Infer the type from the schema
type InvitationFormValues = z.infer<typeof invitationSchema>;

// Define the component props
interface InviteMembersFormProps {
  organizationId: string;
}

// Define the invitation type
type Invitation = {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  expires: string;
  createdAt: string;
};

export function InviteMembersForm({ organizationId }: InviteMembersFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string>("");

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  // Initialize email configuration and fetch invitations when component mounts
  useEffect(() => {
    fetchInvitations();
    fetchOrganizationDetails();
    // Log email configuration for debugging
    const emailConfig = logEmailConfig();
    if (!emailConfig.isConfigured) {
      console.warn("Email configuration is incomplete - invitations may not send emails properly");
    }
  }, [organizationId]);

  // Fetch organization details
  const fetchOrganizationDetails = async () => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch organization details");
      }
      
      const data = await response.json();
      setOrganizationName(data.name || "");
    } catch (error) {
      console.error("Error fetching organization details:", error);
    }
  };

  // Fetch invitations from the API
  const fetchInvitations = async () => {
    try {
      const response = await fetch(`/api/invitations?organizationId=${organizationId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch invitations");
      }
      
      const data = await response.json();
      setInvitations(data.invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  // Cancel an invitation
  const cancelInvitation = async (invitationId: string) => {
    setIsCancelling(invitationId);
    
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel invitation");
      }
      
      // Remove the invitation from the state
      setInvitations(invitations.filter(invitation => invitation.id !== invitationId));
      toast.success("Invitation cancelled successfully");
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel invitation");
    } finally {
      setIsCancelling(null);
    }
  };

  // Handle form submission
  const onSubmit = async (data: InvitationFormValues) => {
    try {
      setIsLoading(true);
      setError("");
      
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          organizationId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send invitation");
      }
      
      const responseData = await response.json();
      
      // Handle response and check if email was sent
      if (responseData.emailStatus === "failed") {
        toast.warning(`Invitation created for ${data.email} but email could not be sent. Please check your email configuration.`);
      } else {
        toast.success(`Invitation sent successfully to ${data.email}`);
      }
      
      // Reset form
      reset();
      
      // Refresh invitations list
      fetchInvitations();
    } catch (error) {
      console.error("Error sending invitation:", error);
      setError(error instanceof Error ? error.message : "Failed to send invitation");
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Invite New Members</h2>
        <p className="text-slate-600 mb-6">
          Invite new members to join your organization.
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="email@example.com"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>
            <select
              {...register("role")}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>
          
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-100 text-red-800 text-sm">
              {error}
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg mt-2"
          >
            {isLoading ? "Sending..." : "Send Invitation"}
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Pending Invitations</h2>
        
        {invitations.length === 0 ? (
          <p className="text-slate-600 mb-4">
            No pending invitations.
          </p>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div 
                key={invitation.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-800">{invitation.email}</p>
                  <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-slate-500">
                    <span>Role: {invitation.role}</span>
                    {invitation.expires && (
                      <span>Expires: {format(new Date(invitation.expires), "MMM d, yyyy")}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 sm:mt-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  onClick={() => cancelInvitation(invitation.id)}
                  disabled={isCancelling === invitation.id}
                >
                  {isCancelling === invitation.id ? "Cancelling..." : "Cancel"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 