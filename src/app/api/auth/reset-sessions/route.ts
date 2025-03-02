import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth/authOptions";
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // In a real app, you would check if the user is an admin here
    // This is simplified for debugging purposes
    
    // Delete all sessions except the current one
    // This assumes you have a Session model in your Prisma schema
    // For NextAuth.js default SQL adapter, this should work
    try {
      // Check if cookies have sessions
      const url = new URL(request.url)
      const cookies = request.headers.get('cookie')
      
      return NextResponse.json({ 
        message: 'For security reasons, this endpoint has been disabled in production.',
        currentSession: session.user.email,
        cookies: cookies ? 'Cookie header present' : 'No cookies found'
      })
    } catch (error) {
      console.error('Error in session handling:', error)
      return NextResponse.json({ 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in auth reset:', error)
    return NextResponse.json({ 
      error: 'Failed to reset sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 