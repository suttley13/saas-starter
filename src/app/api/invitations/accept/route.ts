import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";

// Input validation schema
const acceptInvitationSchema = z.object({
  token: z.string(),
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
    const { token } = acceptInvitationSchema.parse(body);

    // Get the invitation from the token
    const invitation = await db.invitation.findUnique({
      where: {
        token,
      },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { message: "Invalid invitation token" },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expires)) {
      return NextResponse.json(
        { message: "Invitation has expired" },
        { status: 410 }
      );
    }

    // Get the current user with their profile information
    const currentUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        profileImageUrl: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user already is a member
    const existingMembership = await db.membership.findFirst({
      where: {
        userId: user.id,
        organizationId: invitation.organizationId,
      },
    });

    if (existingMembership) {
      // Delete the invitation as it's no longer needed
      await db.invitation.delete({
        where: {
          id: invitation.id,
        },
      });

      return NextResponse.json(
        { message: "You are already a member of this organization", organization: invitation.organization },
        { status: 200 }
      );
    }

    // Create the membership
    const membership = await db.membership.create({
      data: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    });

    // Delete the invitation as it's been used
    await db.invitation.delete({
      where: {
        id: invitation.id,
      },
    });
    
    // Get the updated organization with members for the response
    const updatedOrganization = await db.organization.findUnique({
      where: {
        id: invitation.organizationId,
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
                profileImageUrl: true,
              }
            },
          },
        },
      },
    });

    return NextResponse.json(
      { 
        message: "Successfully joined organization", 
        organization: updatedOrganization || invitation.organization,
        membership,
        user: currentUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Accept invitation error:", error);
    
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