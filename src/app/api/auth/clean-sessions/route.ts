import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/authOptions'

export async function GET(request: Request) {
  // Check if user is admin
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check if user is an admin of any organization
  const isAdmin = await db.membership.findFirst({
    where: {
      userId: session.user.id,
      role: 'ADMIN',
    },
  })
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Find all sessions that reference deleted users
    const sessions = await db.session.findMany({
      include: {
        user: true
      }
    })
    
    // Find sessions with null user references (deleted users)
    const orphanedSessions = sessions.filter(session => !session.user)
    
    // Delete orphaned sessions
    let deletedCount = 0
    for (const session of orphanedSessions) {
      await db.session.delete({
        where: {
          id: session.id
        }
      })
      deletedCount++
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up ${deletedCount} orphaned sessions`,
      totalSessions: sessions.length,
      orphanedSessions: orphanedSessions.length
    })
  } catch (error) {
    console.error('Error cleaning sessions:', error)
    return NextResponse.json({ error: 'Failed to clean sessions' }, { status: 500 })
  }
} 