import { Role, Membership, Organization } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ organizationId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;
    const { organizationId } = params;

    const organization = await db.organization.findUnique({
      where: { id: organizationId },
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

    const membership = organization.memberships.find(
      (m: Membership) => m.userId === user.id
    );

    if (!membership) {
      return NextResponse.json(
        { message: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("[ORGANIZATION_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ organizationId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;
    const { organizationId } = params;

    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      include: {
        memberships: true
      }
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    const membership = organization.memberships.find(
      (m: Membership) => m.userId === user.id
    );

    if (!membership) {
      return NextResponse.json(
        { message: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    if (membership.role !== Role.ADMIN) {
      return NextResponse.json(
        { message: "You do not have permission to delete this organization" },
        { status: 403 }
      );
    }

    await db.organization.delete({
      where: {
        id: organizationId,
      },
    });

    return NextResponse.json({ message: "Organization deleted successfully" });
  } catch (error) {
    console.error("[ORGANIZATION_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ organizationId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;
    const { organizationId } = params;

    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      include: {
        memberships: true
      }
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    const membership = organization.memberships.find(
      (m: Membership) => m.userId === user.id
    );

    if (!membership) {
      return NextResponse.json(
        { message: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    if (membership.role !== Role.ADMIN) {
      return NextResponse.json(
        { message: "You do not have permission to update this organization" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, slug } = body;

    // Validate the data
    if (name && name.trim() === '') {
      return NextResponse.json(
        { message: "Organization name cannot be empty" },
        { status: 400 }
      );
    }

    if (slug && slug.trim() === '') {
      return NextResponse.json(
        { message: "Organization slug cannot be empty" },
        { status: 400 }
      );
    }

    // Check for slug uniqueness if it's being updated
    if (slug && slug !== organization.slug) {
      const existingOrg = await db.organization.findUnique({
        where: { slug }
      });

      if (existingOrg) {
        return NextResponse.json(
          { message: "Organization slug already exists" },
          { status: 400 }
        );
      }
    }

    // Create update data object only with fields that are provided
    const updateData: { name?: string; slug?: string } = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;

    // Update the organization
    const updatedOrganization = await db.organization.update({
      where: {
        id: organizationId,
      },
      data: updateData
    });

    return NextResponse.json(updatedOrganization);
  } catch (error) {
    console.error("[ORGANIZATION_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 