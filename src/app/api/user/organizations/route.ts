import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get all organizations where the user is a member
    const memberships = await db.membership.findMany({
      where: {
        userId: user.id
      },
      include: {
        organization: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response data to include organization and role information
    const organizations = memberships.map(membership => ({
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role,
      isOwner: membership.organization.ownerId === user.id
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("[USER_ORGANIZATIONS_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 