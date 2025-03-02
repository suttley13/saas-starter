"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AcceptInvitationFormProps {
  token: string;
  organizationName: string;
}

export function AcceptInvitationForm({ token, organizationName }: AcceptInvitationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept invitation");
      }

      const data = await response.json();
      
      // Log success details
      console.log("Successfully joined organization:", data);
      
      toast.success("You have joined the organization successfully!");
      
      // Force a hard refresh of the client-side data to ensure the session is updated
      window.location.href = `/organizations/${data.organization.id}`;
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      toast.error(error instanceof Error ? error.message : "Failed to accept invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, you would call an API to decline the invitation
      // For now we'll just show a toast and redirect
      toast.info("Invitation declined");
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast.error("Failed to decline invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="p-3 mb-4 rounded-md bg-red-50 border border-red-100 text-red-800 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex flex-col space-y-3">
        <Button
          onClick={handleAccept}
          className="bg-blue-600 hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Joining..." : `Join ${organizationName}`}
        </Button>
        
        <Button
          onClick={handleDecline}
          variant="outline"
          className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
          disabled={isLoading}
        >
          Decline Invitation
        </Button>
      </div>
    </div>
  );
} 