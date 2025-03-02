import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

// Create a new auth handler
const handler = NextAuth(authOptions);

// Export the handlers
export const GET = handler;
export const POST = handler;
// export { handler as auth }; // This export is not valid in Next.js 15 