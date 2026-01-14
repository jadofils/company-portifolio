import { NextRequest, NextResponse } from 'next/server'
import db, { initDatabase } from '@/lib/database'

// Initialize database
initDatabase()

// GET - Fetch all content
export async function GET() {
  try {
    const content = db.prepare(`
      SELECT * FROM company_content 
      ORDER BY section, subsection, updated_at DESC
    `).all()

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

    const insertContent = db.prepare(`
      INSERT INTO company_content (section, subsection, title, content, image_url)
      VALUES (?, ?, ?, ?, ?)
    `)

    const result = insertContent.run(section, subsection || null, title, content, image_url || null)

    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid,
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

    const updateContent = db.prepare(`
      UPDATE company_content 
      SET section = ?, subsection = ?, title = ?, content = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    const result = updateContent.run(section, subsection || null, title, content, image_url || null, id)

    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Content not found' }, { status: 404 })
    }

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

    const deleteContent = db.prepare('DELETE FROM company_content WHERE id = ?')
    const result = deleteContent.run(id)

    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Content deleted successfully' })
  } catch (error) {
    console.error('Content deletion error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete content' }, { status: 500 })
  }
}