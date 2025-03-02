import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ organizationId: string; userId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { organizationId, userId } = params;

    // Get the organization
    const organization = await db.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        memberships: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    // Check if the current user is a member of this organization
    const currentUserMembership = organization.memberships.find(
      (member) => member.userId === user.id
    );

    if (!currentUserMembership) {
      return NextResponse.json(
        { message: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    // Get the target user's membership
    const targetUserMembership = organization.memberships.find(
      (member) => member.userId === userId
    );

    if (!targetUserMembership) {
      return NextResponse.json(
        { message: "User is not a member of this organization" },
        { status: 404 }
      );
    }

    // Get the user's details
    const userProfile = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        profileImageUrl: true,
        bio: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return user data
    return NextResponse.json({
      user: userProfile,
      role: targetUserMembership.role,
      organizationName: organization.name,
    });
  } catch (error) {
    console.error("[USER_PROFILE_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 