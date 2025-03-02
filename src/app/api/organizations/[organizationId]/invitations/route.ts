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
  { params }: { params: { organizationId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const organizationId = params.organizationId;

    // Check if user is a member of the organization
    const membership = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (!membership || membership.role !== Role.ADMIN) {
      return NextResponse.json(
        { message: "Forbidden: You don't have permission to invite members" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, role } = inviteSchema.parse(body);

    // Check if user is already a member
    const existingMember = await db.membership.findFirst({
      where: {
        organization: { id: organizationId },
        user: { email },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { message: "User is already a member of this organization" },
        { status: 409 }
      );
    }

    // Check if invitation already exists
    const existingInvitation = await db.invitation.findUnique({
      where: {
        email_organizationId: {
          email,
          organizationId,
        },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { message: "Invitation already sent to this email" },
        { status: 409 }
      );
    }

    // Create invitation
    const token = randomUUID();
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // Expires in 7 days

    const invitation = await db.invitation.create({
      data: {
        email,
        role,
        token,
        expires,
        organizationId,
      },
    });

    // In a real application, you would send an email with the invitation link
    // For now, we'll just return the invitation

    return NextResponse.json(
      { 
        message: "Invitation sent successfully", 
        invitation 
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