"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button, ButtonProps } from "@/components/ui/button";

interface SignOutButtonProps extends Omit<ButtonProps, "onClick"> {
  redirectPath?: string;
}

export function SignOutButton({
  children = "Sign Out",
  redirectPath = "/sign-in",
  className = "",
  variant = "outline",
  size = "default",
  ...props
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({ callbackUrl: redirectPath });
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={isLoading}
      onClick={handleSignOut}
      {...props}
    >
      {isLoading ? "Signing out..." : children}
    </Button>
  );
} 