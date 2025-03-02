import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

// Define the props type correctly for Next.js page components
type PageProps = {
  params: { [key: string]: string | string[] };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function SignUpPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const orgName = searchParams?.orgName as string | undefined;
  const callbackUrl = searchParams?.callbackUrl as string | undefined;
  const isInvitation = callbackUrl?.includes('/invitations/');

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="container max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-slate-800">SaaS Starter</h1>
          </Link>
          {isInvitation && orgName ? (
            <>
              <p className="mt-2 text-slate-600">Create an account to join <span className="font-semibold text-blue-600">{orgName}</span></p>
              <p className="mt-1 text-sm text-slate-500">You'll automatically join this organization after signup</p>
            </>
          ) : (
            <p className="mt-2 text-slate-600">Create a new account</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <SignUpForm callbackUrl={callbackUrl} />
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link href={`/sign-in${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}${orgName ? `&orgName=${encodeURIComponent(orgName)}` : ''}` : ''}`} className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in
            </Link>
          </p>
          <Link href="/" className="mt-4 inline-block">
            <Button variant="outline" className="mt-4 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
 