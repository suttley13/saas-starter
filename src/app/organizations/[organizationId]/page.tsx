import { Suspense } from "react";
import OrganizationContent from "./organization-content";

interface OrganizationPageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrganizationContent organizationId={resolvedParams.organizationId} />
    </Suspense>
  );
} 