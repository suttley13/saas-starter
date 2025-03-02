import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    // Return minimal user data (don't expose sensitive info)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email?.split('@')[0],
        image: user.image,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 