import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";
import { Role } from "@prisma/client";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Next.js 15: params are now Promises that need to be awaited
    const resolvedParams = await params;
    const invitationId = resolvedParams.id;

    // Find the invitation
    const invitation = await db.invitation.findUnique({
      where: {
        id: invitationId,
      },
      include: {
        organization: {
          include: {
            memberships: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { message: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the organization
    const membership = invitation.organization.memberships.find(
      (member) => member.userId === user.id
    );

    if (!membership) {
      return NextResponse.json(
        { message: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    // Check if user is an admin (only admins can cancel invitations)
    if (membership.role !== Role.ADMIN) {
      return NextResponse.json(
        { message: "Only admins can cancel invitations" },
        { status: 403 }
      );
    }

    // Delete the invitation
    await db.invitation.delete({
      where: {
        id: invitationId,
      },
    });

    return NextResponse.json(
      { message: "Invitation cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancel invitation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 