import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/auth";

const profileSchema = z.object({
  displayName: z.string().min(2),
  bio: z.string().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
});

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { displayName, bio, profileImageUrl } = profileSchema.parse(body);

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        displayName,
        bio,
        profileImageUrl,
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      { 
        message: "Profile updated successfully", 
        user: userWithoutPassword 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    
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