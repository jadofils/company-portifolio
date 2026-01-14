import { NextRequest } from 'next/server'
import db from '@/lib/database'

export function getCurrentUser(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')
    if (!sessionCookie) return null

    const sessionData = Buffer.from(sessionCookie.value, 'base64').toString()
    const [userId] = sessionData.split(':')
    
    const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(userId)
    return user as { id: number; email: string; name: string; role: string } | null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}