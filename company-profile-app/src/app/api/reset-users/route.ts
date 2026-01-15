import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/database-vercel'

export async function POST() {
  try {
    // Clear existing users
    await sql`DELETE FROM users`
    
    // Reseed users
    const users = [
      { email: 'jasezikeye50@gmail.com', password: 'Sezikeye@12', name: 'Jase Zikeye' },
      { email: 'yvesmuhire@gmail.com', password: 'Muhire@12', name: 'Yves Muhire' },
      { email: 'admin@gmail.com', password: 'Admin@12', name: 'Administrator' }
    ]
    
    for (const user of users) {
      const hashedPassword = bcrypt.hashSync(user.password, 10)
      await sql`
        INSERT INTO users (email, password, name, role) 
        VALUES (${user.email}, ${hashedPassword}, ${user.name}, 'admin')
      `
    }
    
    return NextResponse.json({
      success: true,
      message: 'Users reset successfully',
      count: users.length
    })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset users' },
      { status: 500 }
    )
  }
}