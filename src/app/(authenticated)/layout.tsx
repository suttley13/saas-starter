import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { unstable_noStore as noStore } from "next/cache";

import { UserHeader } from "@/components/layout/user-header";
import { getCurrentUser } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Disable caching to ensure we always get fresh data
  noStore();
  
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }
  
  // Get the user's role from their first membership
  const firstMembership = await db.membership.findFirst({
    where: {
      userId: user.id,
    },
    select: {
      role: true,
      organizationId: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <>
      <UserHeader 
        user={user} 
        role={firstMembership?.role || null}
        organizationId={firstMembership?.organizationId}
      />
      <main>
        {children}
      </main>
      <Toaster position="top-right" />
    </>
  );
} 