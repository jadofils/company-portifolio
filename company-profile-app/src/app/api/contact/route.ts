import { NextRequest, NextResponse } from 'next/server'
import { db, initDatabase, trackChange } from '@/lib/database-vercel'
import { cache, cacheKeys } from '@/lib/cache'

initDatabase()

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Save to database
    const result = await db.query(
      'INSERT INTO contact_messages (name, email, company, message) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, company || null, message]
    )

    await trackChange('contact_messages', result[0].id, 'INSERT', null, { name, email, company, message })
    cache.delete(cacheKeys.contactMessages())

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cacheKey = cacheKeys.contactMessages()
    const messages = await db.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    )

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      )
    }

    // Get old data for tracking
    const oldData = await db.query('SELECT * FROM contact_messages WHERE id = $1', [id])

    await db.query(
      'UPDATE contact_messages SET status = $1 WHERE id = $2',
      [status, id]
    )

    await trackChange('contact_messages', id, 'UPDATE', oldData[0], { ...oldData[0], status })
    cache.delete(cacheKeys.contactMessages())

    return NextResponse.json({
      success: true,
      message: 'Message status updated'
    })

  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}