import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import type { Session } from "next-auth";

export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session?.user?.email) {
    return null;
  }
  
  return session.user;
} 