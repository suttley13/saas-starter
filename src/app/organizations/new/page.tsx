import { redirect } from "next/navigation";
import Link from "next/link";

import { CreateOrganizationForm } from "@/components/organizations/create-organization-form";
import { getCurrentUser } from "@/lib/auth/auth";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Create Organization",
  description: "Create a new organization for your team",
};

export default async function CreateOrganizationPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Create Organization</h1>
          <Link href="/dashboard">
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300">
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <CreateOrganizationForm />
        </div>
      </div>
    </div>
  );
} 