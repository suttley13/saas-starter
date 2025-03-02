"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Button } from "@/components/ui/button";

// Metadata must be configured differently for client components
// We'll handle the title in the component itself

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const orgName = searchParams.get("orgName") || undefined;
  const callbackUrl = searchParams.get("callbackUrl") || undefined;
  const isInvitation = callbackUrl?.includes('/invitations/');

  useEffect(() => {
    // Set page title
    document.title = "Sign In | SaaS Starter";
    
    // Check authentication status on the client side
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data?.user) {
          router.push(callbackUrl || "/dashboard");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [callbackUrl, router]);

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
              <p className="mt-2 text-slate-600">Sign in to join <span className="font-semibold text-blue-600">{orgName}</span></p>
              <p className="mt-1 text-sm text-slate-500">You've been invited to join this organization</p>
            </>
          ) : (
            <p className="mt-2 text-slate-600">Sign in to your account</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <SignInForm />
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{" "}
            <Link href={`/sign-up${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}${orgName ? `&orgName=${encodeURIComponent(orgName)}` : ''}` : ''}`} className="text-blue-600 hover:text-blue-800 font-medium">
              Sign up
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

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading sign-in page...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
} 