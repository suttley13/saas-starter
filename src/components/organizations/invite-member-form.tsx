"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Role } from "@prisma/client";
import { sendInvitationEmail } from "@/lib/mail";

const inviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.nativeEnum(Role),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteMemberFormProps {
  organizationId: string;
}

export function InviteMemberForm({ organizationId }: InviteMemberFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("");

  // Fetch organization details to get the name
  useEffect(() => {
    fetchOrganizationDetails();
  }, [organizationId]);

  // Fetch organization details to get the name
  const fetchOrganizationDetails = async () => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch organization details");
      }
      const data = await response.json();
      setOrganizationName(data.name);
    } catch (error) {
      console.error("Error fetching organization details:", error);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: Role.MEMBER,
    },
  });

  async function onSubmit(data: InviteFormValues) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/organizations/${organizationId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          role: data.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      const responseData = await response.json();
      
      // Show response status regarding email
      setSuccess(`Invitation sent to ${data.email}`);
      if (responseData.emailStatus === "failed") {
        toast.warning(`Invitation created but email could not be sent to ${data.email}. Please check your email configuration.`);
      } else {
        toast.success(`Invitation sent to ${data.email}`);
      }
      
      reset();
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Invite Team Member</h3>
        <p className="text-sm text-gray-500">
          Invite a new member to join your organization
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="colleague@example.com"
            disabled={isLoading}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            disabled={isLoading}
            {...register("role")}
          >
            <option value={Role.MEMBER}>Member</option>
            <option value={Role.ADMIN}>Admin</option>
          </select>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        <Button 
          type="submit" 
          disabled={isLoading}
          className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg"
        >
          {isLoading ? "Sending..." : "Send Invitation"}
        </Button>
      </form>
    </div>
  );
} 