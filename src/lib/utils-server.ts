import { db } from "@/lib/db";
import 'server-only';

/**
 * Gets invitation details from a token
 * SERVER-ONLY FUNCTION - DO NOT IMPORT IN CLIENT COMPONENTS
 */
export async function getInvitationFromToken(token: string) {
  const invitation = await db.invitation.findUnique({
    where: {
      token,
    },
    include: {
      organization: true,
    },
  });
  
  return invitation;
} 