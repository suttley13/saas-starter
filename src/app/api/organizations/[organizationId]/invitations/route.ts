import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";
import { Role } from "@prisma/client";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ organizationId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { organizationId } = params;

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

    // Check if user is an admin (only admins can send invitations)
    if (membership.role !== Role.ADMIN) {
      return NextResponse.json(
        { message: "Only admins can send invitations" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = inviteSchema.parse(body);

    // Check if user is already a member
    const existingMembership = await db.membership.findFirst({
      where: {
        organization: {
          id: organizationId,
        },
        user: {
          email: validatedData.email,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { message: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation
    const existingInvitation = await db.invitation.findFirst({
      where: {
        organizationId,
        email: validatedData.email,
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { message: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Create invitation with token and expiration
    const token = randomUUID();
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // Invitation expires in 7 days

    const invitation = await db.invitation.create({
      data: {
        id: randomUUID(),
        email: validatedData.email,
        role: validatedData.role,
        organizationId,
        token,
        expires,
      },
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request data", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Create invitation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 