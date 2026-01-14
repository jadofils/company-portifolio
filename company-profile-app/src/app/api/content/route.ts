import { NextRequest, NextResponse } from 'next/server'
import { db, initDatabase } from '@/lib/database-vercel'

// Initialize database
initDatabase()

// GET - Fetch all content
export async function GET() {
  try {
    const content = await db.query(
      'SELECT * FROM company_content ORDER BY section, subsection, updated_at DESC'
    )

    return NextResponse.json({ success: true, content })
  } catch (error) {
    console.error('Content fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch content' }, { status: 500 })
  }
}

// POST - Create new content
export async function POST(request: NextRequest) {
  try {
    const { section, subsection, title, content, image_url } = await request.json()

    if (!section || !title || !content) {
      return NextResponse.json({ success: false, error: 'Section, title, and content are required' }, { status: 400 })
    }

    await db.query(
      'INSERT INTO company_content (section, subsection, title, content, image_url) VALUES (?, ?, ?, ?, ?)',
      [section, subsection || null, title, content, image_url || null]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Content created successfully' 
    })
  } catch (error) {
    console.error('Content creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create content' }, { status: 500 })
  }
}

// PUT - Update existing content
export async function PUT(request: NextRequest) {
  try {
    const { id, section, subsection, title, content, image_url } = await request.json()

    if (!id || !section || !title || !content) {
      return NextResponse.json({ success: false, error: 'ID, section, title, and content are required' }, { status: 400 })
    }

    await db.query(
      'UPDATE company_content SET section = ?, subsection = ?, title = ?, content = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [section, subsection || null, title, content, image_url || null, id]
    )

    return NextResponse.json({ success: true, message: 'Content updated successfully' })
  } catch (error) {
    console.error('Content update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update content' }, { status: 500 })
  }
}

// DELETE - Delete content
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'Content ID is required' }, { status: 400 })
    }

    await db.query('DELETE FROM company_content WHERE id = ?', [id])

    return NextResponse.json({ success: true, message: 'Content deleted successfully' })
  } catch (error) {
    console.error('Content deletion error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete content' }, { status: 500 })
  }
}