"use client";

import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState, Suspense } from "react";

// Client components don't use metadata export directly
// We'll set the title in useEffect

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  const orgName = searchParams.get("orgName") || undefined;
  const callbackUrl = searchParams.get("callbackUrl") || undefined;
  const isInvitation = callbackUrl?.includes('/invitations/');

  useEffect(() => {
    // Set page title
    document.title = "Sign Up | SaaS Starter";
    
    // Check authentication status on the client side
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data?.user) {
          router.push("/dashboard");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
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

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading sign-up page...</div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
 