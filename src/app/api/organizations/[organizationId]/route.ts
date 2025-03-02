import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function DELETE(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Next.js 15: params are now Promises that need to be awaited
    const resolvedParams = await params;
    const { organizationId } = resolvedParams;

    // Get the organization
    const organization = await db.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if the user is the owner
    if (organization.ownerId !== user.id) {
      return NextResponse.json(
        { message: "Only the organization owner can delete it" },
        { status: 403 }
      );
    }

    // Delete the organization
    await db.organization.delete({
      where: {
        id: organizationId,
      },
    });

    return NextResponse.json({ message: "Organization deleted" });
  } catch (error) {
    console.error("[ORGANIZATION_DELETE]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Next.js 15: params are now Promises that need to be awaited
    const resolvedParams = await params;
    const { organizationId } = resolvedParams;

    // Get the organization with members
    const organization = await db.organization.findUnique({
      where: {
        id: organizationId,
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
                bio: true,
              },
            },
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if the user is a member of this organization
    const isMember = organization.memberships.some(
      (member) => member.userId === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { message: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    // Return organization data
    return NextResponse.json(organization);
  } catch (error) {
    console.error("[ORGANIZATION_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 