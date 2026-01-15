import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database-vercel'

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
    await sql`
      INSERT INTO contact_messages (name, email, company, message)
      VALUES (${name}, ${email}, ${company || null}, ${message})
    `

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
    const { rows: messages } = await sql`
      SELECT * FROM contact_messages ORDER BY created_at DESC
    `

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

    await sql`
      UPDATE contact_messages SET status = ${status} WHERE id = ${id}
    `

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