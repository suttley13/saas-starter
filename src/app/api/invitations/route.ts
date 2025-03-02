import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { addDays } from "date-fns";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";
import { Role } from "@prisma/client";
import { sendInvitationEmail } from "@/lib/mail";

// Input validation schema
const invitationSchema = z.object({
  email: z.string().email(),
  role: z.enum([Role.ADMIN, Role.MEMBER]),
  organizationId: z.string(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, role, organizationId } = invitationSchema.parse(body);

    // Check if organization exists
    const organization = await db.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        memberships: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the organization
    const membership = organization.memberships.find(
      (member) => member.userId === user.id
    );

    if (!membership) {
      return NextResponse.json(
        { message: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    // Check if user is an admin (only admins can invite)
    if (membership.role !== Role.ADMIN) {
      return NextResponse.json(
        { message: "Only admins can invite new members" },
        { status: 403 }
      );
    }

    // Check if the invited email already has a pending invitation
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email,
        organizationId,
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { message: "An invitation has already been sent to this email" },
        { status: 409 }
      );
    }

    // Check if user already exists in the organization
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      const existingMembership = await db.membership.findFirst({
        where: {
          userId: existingUser.id,
          organizationId,
        },
      });

      if (existingMembership) {
        return NextResponse.json(
          { message: "This user is already a member of the organization" },
          { status: 409 }
        );
      }
    }

    // Create a new invitation
    const token = randomUUID();
    const expires = addDays(new Date(), 7); // Invitation expires in 7 days

    const invitation = await db.invitation.create({
      data: {
        email,
        role,
        token,
        expires,
        organizationId,
      },
    });

    // Get the base URL for the invitation link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    process.env.VERCEL_URL || 
                    "http://localhost:3000";

    // Create the invitation link
    // Check if we're using localhost with a non-standard port
    const inviteLink = baseUrl.includes('localhost') && !baseUrl.includes('localhost:3000') 
      ? `${baseUrl.replace(/:\d+$/, '')}/invitations/${token}`
      : `${baseUrl}/invitations/${token}`;

    // Send invitation email
    await sendInvitationEmail({
      email,
      organizationName: organization.name,
      inviteLink,
    });

    return NextResponse.json(
      { 
        message: "Invitation sent successfully", 
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expires: invitation.expires,
          token: invitation.token,
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Invitation error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { message: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if user is a member of the organization
    const membership = await db.membership.findFirst({
      where: {
        userId: user.id,
        organizationId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    // Get all pending invitations for the organization
    const invitations = await db.invitation.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Get invitations error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 