import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";
import { Role } from "@prisma/client";

export async function DELETE(
  request: Request,
  { params }: { params: { organizationId: string; memberId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Next.js 15: params are now Promises that need to be awaited
    const resolvedParams = await params;
    const { organizationId, memberId } = resolvedParams;

    // Find the organization
    const organization = await db.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        memberships: true,
      },
    });

    if (!organization) {
      return new NextResponse("Organization not found", { status: 404 });
    }

    // Check if user is a member of the organization
    const currentUserMembership = organization.memberships.find(
      (member) => member.userId === user.id
    );

    if (!currentUserMembership) {
      return new NextResponse("You are not a member of this organization", { status: 403 });
    }

    // Check if user is an admin (only admins can remove members)
    if (currentUserMembership.role !== Role.ADMIN) {
      return new NextResponse("Only admins can remove members", { status: 403 });
    }

    // Find the membership to be removed
    const membershipToRemove = await db.membership.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!membershipToRemove) {
      return new NextResponse("Membership not found", { status: 404 });
    }

    // Check if the membership belongs to this organization
    if (membershipToRemove.organizationId !== organizationId) {
      return new NextResponse("This membership does not belong to the specified organization", { status: 400 });
    }

    // Check if trying to remove the organization owner
    if (membershipToRemove.userId === organization.ownerId) {
      return new NextResponse("Cannot remove the organization owner", { status: 403 });
    }

    // Delete the membership
    await db.membership.delete({
      where: {
        id: memberId,
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[MEMBER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 