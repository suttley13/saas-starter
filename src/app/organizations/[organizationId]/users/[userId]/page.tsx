import { Suspense } from "react";
import UserProfileContent from "./user-profile-content";

interface UserProfilePageProps {
  params: Promise<{ 
    organizationId: string;
    userId: string;
  }>;
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  // Resolve params
  const { organizationId, userId } = await params;
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <UserProfileContent
        organizationId={organizationId}
        userId={userId}
      />
    </Suspense>
  );
} 