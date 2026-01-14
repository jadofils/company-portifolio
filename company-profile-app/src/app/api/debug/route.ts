import { NextResponse } from 'next/server'
import { db, initDatabase } from '@/lib/database-vercel'

initDatabase()

export async function GET() {
  try {
    const users = await db.query('SELECT id, email, name, role, created_at FROM users')
    console.log('All users in database:', users)
    
    return NextResponse.json({
      success: true,
      users: users,
      count: users.length,
      emails: users.map((u: any) => u.email)
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}