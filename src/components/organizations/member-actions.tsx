"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface MemberActionsProps {
  memberId: string;
  organizationId: string;
  memberName: string;
}

export function MemberActions({ memberId, organizationId, memberName }: MemberActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const removeMember = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove member");
      }
      
      // Close dialog and show success message
      setIsOpen(false);
      toast.success(`${memberName} has been removed from the organization`);
      
      // Refresh the page to update the member list
      window.location.reload();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
        onClick={() => setIsOpen(true)}
      >
        Remove
      </Button>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{memberName}</strong> from your organization immediately. 
              They will lose access to all organization resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                removeMember();
              }}
              disabled={isLoading}
            >
              {isLoading ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 