import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from 'next/cache';
import { getCurrentUser } from "@/lib/auth/auth";

export default async function LightweightDashboard() {
  // Disable caching
  noStore();
  
  // Get the current user
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Lightweight Dashboard</h1>
      <p>This is a simplified dashboard page to diagnose HTTP 431 errors.</p>
      <pre className="mt-4 p-4 bg-gray-100 rounded">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
} 