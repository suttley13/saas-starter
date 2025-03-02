"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  user: {
    email: string;
    displayName?: string | null;
    profileImageUrl?: string | null;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ user, className = "", size = "md" }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: "h-8 w-8 min-h-[2rem] min-w-[2rem]",
    md: "h-10 w-10 min-h-[2.5rem] min-w-[2.5rem]",
    lg: "h-20 w-20 min-h-[5rem] min-w-[5rem]"
  };
  
  const safariStyles = {
    display: 'flex',
    overflow: 'hidden',
    aspectRatio: '1 / 1',
    borderRadius: '9999px',
    position: 'relative' as const,
  };
  
  const imageSafariStyles = {
    width: '100%', 
    height: '100%', 
    objectFit: 'cover' as const,
    WebkitBackfaceVisibility: 'hidden' as any,
    borderRadius: '9999px',
    position: 'absolute' as const,
    top: 0,
    left: 0,
  };
  
  const fallbackSafariStyles = {
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: '9999px',
  };
  
  const getFallbackText = () => {
    if (user.displayName) {
      return user.displayName.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <Avatar 
      className={`${sizeClasses[size]} border-2 border-slate-200 ${className}`}
      style={safariStyles}
    >
      {!imageError && user.profileImageUrl && (
        <AvatarImage 
          src={user.profileImageUrl}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          style={imageSafariStyles}
        />
      )}
      <AvatarFallback 
        className="bg-blue-100 text-blue-700"
        style={fallbackSafariStyles}
      >
        {getFallbackText()}
      </AvatarFallback>
    </Avatar>
  );
} 