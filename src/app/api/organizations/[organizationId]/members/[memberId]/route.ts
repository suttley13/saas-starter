import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";
import { Role } from "@prisma/client";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ organizationId: string; memberId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;
    const { organizationId, memberId } = params;

    // Check if user is a member of the organization
    const membership = await db.membership.findFirst({
      where: {
        userId: user.id,
        organizationId,
      },
    });

    if (!membership) {
      return new NextResponse("You are not a member of this organization", {
        status: 403,
      });
    }

    // Check if user is an admin (only admins can remove members)
    if (membership.role !== Role.ADMIN) {
      return new NextResponse("Only admins can remove members", {
        status: 403,
      });
    }

    // Check if member exists
    const memberToRemove = await db.membership.findFirst({
      where: {
        id: memberId,
        organizationId,
      },
    });

    if (!memberToRemove) {
      return new NextResponse("Member not found", { status: 404 });
    }

    // Cannot remove yourself
    if (memberToRemove.userId === user.id) {
      return new NextResponse("You cannot remove yourself from the organization", {
        status: 400,
      });
    }

    // Delete membership
    await db.membership.delete({
      where: {
        id: memberId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Remove member error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
} 