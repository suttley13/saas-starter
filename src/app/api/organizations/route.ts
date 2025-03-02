import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";
import { Role } from "@prisma/client";

const organizationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
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
    const { name, slug } = organizationSchema.parse(body);

    // Check if organization with slug already exists
    const existingOrganization = await db.organization.findUnique({
      where: { slug },
    });

    if (existingOrganization) {
      return NextResponse.json(
        { message: "Organization with this slug already exists" },
        { status: 409 }
      );
    }

    // Create organization and add current user as owner and member
    const organization = await db.organization.create({
      data: {
        name,
        slug,
        ownerId: user.id,
        memberships: {
          create: {
            userId: user.id,
            role: Role.ADMIN,
          },
        },
      },
    });

    return NextResponse.json(
      { 
        message: "Organization created successfully", 
        organization 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Organization creation error:", error);
    
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